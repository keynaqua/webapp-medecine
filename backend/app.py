import os
import re
import uuid
import fitz  # PyMuPDF

from fastapi import FastAPI, UploadFile, File, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

app = FastAPI()

FRONTEND_URL = os.getenv("FRONTEND_URL", "*")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if FRONTEND_URL == "*" else [FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")
TMP_DIR = os.path.join(BASE_DIR, "tmp")

os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(TMP_DIR, exist_ok=True)

app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")


QUESTION_RE = re.compile(r"QCM\s+(\d+)\s*:", re.IGNORECASE)
QUESTION_BLOCK_RE = re.compile(
    r"QCM\s+(\d+)\s*:\s*(.*?)(?=QCM\s+\d+\s*:|$)",
    re.IGNORECASE | re.DOTALL
)
ANSWER_START_RE = re.compile(r"^\s*([A-E])[\.\)]\s*(.*)$", re.IGNORECASE)


def normalize_spaces(text):
    return re.sub(r"[ \t\r\f\v]+", " ", text.replace("\u00a0", " ")).strip()


def clean_multiline_text(text):
    """
    Nettoie un bloc de texte brut tout en gardant les retours ligne utiles.
    """
    lines = text.splitlines()
    cleaned = []

    for line in lines:
        line = normalize_spaces(line)
        if line:
            cleaned.append(line)

    return "\n".join(cleaned).strip()


# =========================================================
# 1) PARSING TEXTE BRUT SANS LES IMAGES
# =========================================================

def extract_full_text(doc):
    """
    Concatène le texte brut du document, page par page.
    On ne s'appuie pas sur les blocks pour parser les réponses.
    """
    pages_text = []

    for page_index in range(len(doc)):
        page = doc[page_index]
        text = page.get_text("text")
        if text:
            pages_text.append(text)

    return "\n".join(pages_text)


def parse_qcm_block(number, raw_content):
    """
    Parse le contenu texte d'un QCM :
    - texte de la question
    - réponses A/B/C/D/E
    """
    content = clean_multiline_text(raw_content)
    if not content:
        return None

    lines = content.splitlines()

    question_lines = []
    answers = []
    current_answer = None

    for line in lines:
        match = ANSWER_START_RE.match(line)

        if match:
            if current_answer is not None:
                current_answer["text"] = normalize_spaces(current_answer["text"])
                answers.append(current_answer)

            current_answer = {
                "letter": match.group(1).upper(),
                "text": match.group(2).strip()
            }
        else:
            if current_answer is not None:
                current_answer["text"] += " " + line
            else:
                question_lines.append(line)

    if current_answer is not None:
        current_answer["text"] = normalize_spaces(current_answer["text"])
        answers.append(current_answer)

    question_text = normalize_spaces(" ".join(question_lines))

    if "qcm non reporté" in question_text.lower():
        return None

    return {
        "number": int(number),
        "question": question_text,
        "answers": answers,
        "images": []
    }


def extract_qcms_from_text(doc):
    """
    Extrait tous les QCM depuis le texte brut du PDF.
    On découpe de 'QCM X:' jusqu'au prochain 'QCM Y:'.
    """
    full_text = extract_full_text(doc)
    matches = QUESTION_BLOCK_RE.findall(full_text)

    qcms = []

    for number, raw_content in matches:
        parsed = parse_qcm_block(number, raw_content)
        if parsed:
            qcms.append(parsed)

    qcms.sort(key=lambda q: q["number"])
    return qcms


# =========================================================
# 2) PASSE IMAGES + POSITIONS DES "QCM X"
# =========================================================

def extract_text_blocks(page):
    """
    Extrait les blocs texte avec leur bbox.
    Sert seulement à repérer visuellement les "QCM X" dans la page.
    """
    data = page.get_text("dict")
    blocks = []

    for block in data.get("blocks", []):
        if block.get("type") != 0:
            continue

        lines_text = []

        for line in block.get("lines", []):
            spans = line.get("spans", [])
            line_text = "".join(span.get("text", "") for span in spans).strip()
            if line_text:
                lines_text.append(line_text)

        text = " ".join(lines_text).strip()
        if not text:
            continue

        blocks.append({
            "text": text,
            "bbox": block["bbox"]
        })

    return blocks


def extract_question_anchors(doc):
    """
    Repère visuellement où se trouvent les 'QCM X' sur les pages.
    On ne parse pas les réponses ici.
    """
    anchors = []

    for page_index in range(len(doc)):
        page = doc[page_index]
        page_number = page_index + 1
        blocks = extract_text_blocks(page)

        for block in blocks:
            text = block["text"]
            match = QUESTION_RE.search(text)
            if match:
                anchors.append({
                    "number": int(match.group(1)),
                    "page": page_number,
                    "bbox": block["bbox"]
                })

    anchors.sort(key=lambda a: (a["page"], a["bbox"][1], a["bbox"][0]))
    return anchors


def extract_images_with_positions(doc, page, page_index, base_url):
    """
    Extrait uniquement les images avec leur page + bbox + URL.
    """
    images = []
    image_infos = page.get_image_info(xrefs=True)

    for info in image_infos:
        xref = info.get("xref")
        bbox = info.get("bbox")

        if not xref or not bbox:
            continue

        try:
            base_image = doc.extract_image(xref)
        except Exception:
            continue

        image_bytes = base_image.get("image")
        ext = base_image.get("ext", "png")
        width = base_image.get("width", 0)
        height = base_image.get("height", 0)

        if not image_bytes:
            continue

        # Ignore petites icônes / logos parasites
        if width < 40 or height < 40:
            continue

        filename = f"{uuid.uuid4().hex}.{ext}"
        filepath = os.path.join(UPLOAD_DIR, filename)

        with open(filepath, "wb") as f:
            f.write(image_bytes)

        images.append({
            "page": page_index + 1,
            "bbox": bbox,
            "url": f"{base_url}/uploads/{filename}"
        })

    return images


def extract_all_images(doc, base_url):
    all_images = []

    for page_index in range(len(doc)):
        page = doc[page_index]
        page_images = extract_images_with_positions(doc, page, page_index, base_url)
        all_images.extend(page_images)

    all_images.sort(key=lambda img: (img["page"], img["bbox"][1], img["bbox"][0]))
    return all_images


# =========================================================
# 3) RATTACHEMENT IMAGES -> BON QCM
# =========================================================

def attach_images_to_questions(qcms, anchors, images, total_pages):
    """
    Rattache les images aux questions en parcourant les pages.
    Logique :
    - on garde en mémoire le dernier QCM rencontré
    - sur chaque page, les images vont au dernier QCM situé au-dessus
    - si une page n'a pas de nouveau QCM, les images vont au dernier QCM connu
    """
    qcm_map = {q["number"]: q for q in qcms}

    anchors_by_page = {}
    for anchor in anchors:
        anchors_by_page.setdefault(anchor["page"], []).append(anchor)

    images_by_page = {}
    for image in images:
        images_by_page.setdefault(image["page"], []).append(image)

    for page in anchors_by_page:
        anchors_by_page[page].sort(key=lambda a: (a["bbox"][1], a["bbox"][0]))

    for page in images_by_page:
        images_by_page[page].sort(key=lambda img: (img["bbox"][1], img["bbox"][0]))

    current_question_number = None

    for page_number in range(1, total_pages + 1):
        page_anchors = anchors_by_page.get(page_number, [])
        page_images = images_by_page.get(page_number, [])

        anchor_index = 0

        for image in page_images:
            image_y = image["bbox"][1]

            while (
                anchor_index < len(page_anchors)
                and page_anchors[anchor_index]["bbox"][1] <= image_y
            ):
                current_question_number = page_anchors[anchor_index]["number"]
                anchor_index += 1

            if current_question_number in qcm_map:
                qcm_map[current_question_number]["images"].append(image["url"])

        # S'il reste des QCM en fin de page sans image dessous,
        # on met quand même à jour le "current_question_number"
        # pour les images éventuelles des pages suivantes.
        while anchor_index < len(page_anchors):
            current_question_number = page_anchors[anchor_index]["number"]
            anchor_index += 1

    return qcms


# =========================================================
# API
# =========================================================

@app.get("/")
async def root():
    return {"message": "API QCM en ligne"}


@app.post("/api/parse-pdf")
async def parse_pdf(request: Request, pdf: UploadFile = File(...)):
    tmp_filename = f"{uuid.uuid4().hex}_{pdf.filename}"
    tmp_path = os.path.join(TMP_DIR, tmp_filename)

    with open(tmp_path, "wb") as f:
        f.write(await pdf.read())

    base_url = str(request.base_url).rstrip("/")

    doc = fitz.open(tmp_path)

    try:
        # 1) TEXTE BRUT -> QCM sans images
        qcms = extract_qcms_from_text(doc)

        # 2) PASSE VISUELLE -> positions des QCM + extraction images
        anchors = extract_question_anchors(doc)
        images = extract_all_images(doc, base_url)

        # 3) RATTACHEMENT DES IMAGES AUX BONS QCM
        qcms = attach_images_to_questions(qcms, anchors, images, len(doc))

        return {"qcms": qcms}

    finally:
        doc.close()
        try:
            os.remove(tmp_path)
        except OSError:
            pass