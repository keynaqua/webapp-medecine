import os
import uuid
from .constants import QUESTION_RE


def extract_text_blocks(page):
    data = page.get_text("dict")
    blocks = []

    for block in data.get("blocks", []):
        if block.get("type") != 0:
            continue

        text = ""
        for line in block.get("lines", []):
            for span in line.get("spans", []):
                text += span.get("text", "")

        text = text.strip()
        if text:
            blocks.append({
                "text": text,
                "bbox": block["bbox"]
            })

    return blocks


def extract_question_anchors(doc):
    anchors = []

    for page_index in range(len(doc)):
        page = doc[page_index]
        blocks = extract_text_blocks(page)

        for block in blocks:
            match = QUESTION_RE.search(block["text"])
            if match:
                anchors.append({
                    "number": int(match.group(1)),
                    "page": page_index + 1,
                    "bbox": block["bbox"]
                })

    anchors.sort(key=lambda a: (a["page"], a["bbox"][1]))
    return anchors


def extract_all_images(doc, base_url, upload_dir):
    images = []

    for page_index in range(len(doc)):
        page = doc[page_index]

        for info in page.get_image_info(xrefs=True):
            xref = info.get("xref")
            bbox = info.get("bbox")

            if not xref or not bbox:
                continue

            try:
                base_image = doc.extract_image(xref)
            except Exception:
                continue

            if base_image["width"] < 40 or base_image["height"] < 40:
                continue

            filename = f"{uuid.uuid4().hex}.{base_image['ext']}"
            filepath = os.path.join(upload_dir, filename)

            with open(filepath, "wb") as f:
                f.write(base_image["image"])

            images.append({
                "page": page_index + 1,
                "bbox": bbox,
                "url": f"{base_url}/uploads/{filename}"
            })

    images.sort(key=lambda i: (i["page"], i["bbox"][1]))
    return images