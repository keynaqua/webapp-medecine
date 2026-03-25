import os
import re
import uuid
import fitz  # PyMuPDF

from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

app = FastAPI()

# Autoriser le front local
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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

QUESTION_RE = re.compile(r"QCM\s+(\d+)\s*:")


def extract_text_blocks(page):
    """
    Retourne les blocs texte utiles de la page avec leur bbox.
    """
    data = page.get_text("dict")
    blocks = []

    for block in data["blocks"]:
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
            "bbox": block["bbox"]  # [x0, y0, x1, y1]
        })

    return blocks


def extract_questions_from_blocks(blocks, page_number):
    """
    Détecte les débuts de QCM dans les blocs texte.
    """
    questions = []

    for block in blocks:
        text = block["text"]
        match = QUESTION_RE.search(text)
        if match:
            number = int(match.group(1))
            questions.append({
                "number": number,
                "page": page_number,
                "bbox": block["bbox"],
                "raw_text": text,
                "content": ""  # sera rempli ensuite
            })

    questions.sort(key=lambda q: q["bbox"][1])  # tri vertical
    return questions


def collect_question_content(blocks, questions):
    """
    Pour chaque question, récupère le texte situé entre elle et la suivante.
    """
    if not questions:
        return []

    for i, question in enumerate(questions):
        current_y = question["bbox"][1]

        if i + 1 < len(questions):
            next_y = questions[i + 1]["bbox"][1]
        else:
            next_y = float("inf")

        content_parts = []

        for block in blocks:
            y = block["bbox"][1]
            if y >= current_y and y < next_y:
                content_parts.append(block["text"])

        question["content"] = " ".join(content_parts).strip()

    return questions


def parse_question_content(content, number):
    """
    Transforme le texte complet d'un QCM en:
    - question
    - réponses
    """
    # retirer l'en-tête "QCM X :"
    content = re.sub(rf"QCM\s+{number}\s*:\s*", "", content, count=1).strip()

    parts = re.split(r"(?=[A-E]\.)", content)
    question_text = parts[0].strip() if parts else ""

    answers = []
    for part in parts[1:]:
        part = part.strip()
        if len(part) >= 2:
            answers.append({
                "letter": part[0],
                "text": part[2:].strip()
            })

    return {
        "number": number,
        "question": question_text,
        "answers": answers,
        "images": []
    }


def extract_images_with_positions(doc, page, page_index):
    """
    Extrait les images embarquées visibles sur la page, avec bbox.
    """
    images = []
    image_infos = page.get_image_info(xrefs=True)

    for idx, info in enumerate(image_infos):
        xref = info.get("xref")
        bbox = info.get("bbox")

        if not xref or not bbox:
            continue

        try:
            base_image = doc.extract_image(xref)
        except Exception:
            continue

        image_bytes = base_image["image"]
        ext = base_image["ext"]

        width = base_image.get("width", 0)
        height = base_image.get("height", 0)

        # filtre simple pour éviter les mini-images techniques
        if width < 40 or height < 40:
            continue

        filename = f"{uuid.uuid4().hex}.{ext}"
        filepath = os.path.join(UPLOAD_DIR, filename)

        with open(filepath, "wb") as f:
            f.write(image_bytes)

        images.append({
            "page": page_index + 1,
            "bbox": bbox,  # [x0, y0, x1, y1]
            "url": f"http://localhost:8000/uploads/{filename}"
        })

    return images


def attach_images_to_questions(qcms, questions_meta, images):
    """
    Associe chaque image à la question la plus proche sur la même page.
    Règle simple:
    - même page
    - on prend la dernière question située au-dessus de l'image
    """
    qcm_map = {q["number"]: q for q in qcms}
    questions_by_page = {}

    for q in questions_meta:
        questions_by_page.setdefault(q["page"], []).append(q)

    for page_questions in questions_by_page.values():
        page_questions.sort(key=lambda q: q["bbox"][1])

    for image in images:
        page = image["page"]
        image_y = image["bbox"][1]

        candidates = questions_by_page.get(page, [])
        above = [q for q in candidates if q["bbox"][1] <= image_y]

        if above:
            target_question = above[-1]
            qcm_map[target_question["number"]]["images"].append(image["url"])

    return qcms


@app.post("/api/parse-pdf")
async def parse_pdf(pdf: UploadFile = File(...)):
    tmp_filename = f"{uuid.uuid4().hex}_{pdf.filename}"
    tmp_path = os.path.join(TMP_DIR, tmp_filename)

    with open(tmp_path, "wb") as f:
        f.write(await pdf.read())

    doc = fitz.open(tmp_path)

    all_questions_meta = []
    all_qcms = []
    all_images = []

    for page_index in range(len(doc)):
        page = doc[page_index]
        page_number = page_index + 1

        blocks = extract_text_blocks(page)
        questions_meta = extract_questions_from_blocks(blocks, page_number)
        questions_meta = collect_question_content(blocks, questions_meta)

        for q in questions_meta:
            parsed = parse_question_content(q["content"], q["number"])
            all_qcms.append(parsed)
            all_questions_meta.append(q)

        page_images = extract_images_with_positions(doc, page, page_index)
        all_images.extend(page_images)

    doc.close()

    all_qcms = attach_images_to_questions(all_qcms, all_questions_meta, all_images)

    # tri final par numéro de QCM
    all_qcms.sort(key=lambda q: q["number"])

    return {
        "qcms": all_qcms
    }