import os
import uuid

from .constants import QUESTION_RE, IMAGE_LABEL_RE
from .utils import normalize_spaces


def extract_text_blocks(page):
    data = page.get_text("dict")
    blocks = []

    for block in data.get("blocks", []):
        if block.get("type") != 0:
            continue

        text = ""
        for line in block.get("lines", []):
            line_text = ""
            for span in line.get("spans", []):
                line_text += span.get("text", "")
            if line_text.strip():
                text += line_text + "\n"

        text = normalize_spaces(text)
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


def _find_image_label(image_bbox, text_blocks):
    x0, y0, x1, y1 = image_bbox
    image_center_x = (x0 + x1) / 2

    best_block = None
    best_distance = None

    for block in text_blocks:
        text = normalize_spaces(block["text"]).upper()
        if not IMAGE_LABEL_RE.fullmatch(text):
            continue

        bx0, by0, bx1, by1 = block["bbox"]
        block_center_x = (bx0 + bx1) / 2

        vertical_gap = by0 - y1
        horizontal_gap = abs(block_center_x - image_center_x)

        if vertical_gap < -5 or vertical_gap > 35:
            continue

        if horizontal_gap > max((x1 - x0) * 0.35, 20):
            continue

        score = (vertical_gap, horizontal_gap)
        if best_distance is None or score < best_distance:
            best_distance = score
            best_block = block

    if best_block:
        return normalize_spaces(best_block["text"]).upper()

    return None


def extract_all_images(doc, base_url, upload_dir):
    images = []

    for page_index in range(len(doc)):
        page = doc[page_index]
        text_blocks = extract_text_blocks(page)

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
                "url": f"{base_url}/uploads/{filename}",
                "label": _find_image_label(bbox, text_blocks)
            })

    images.sort(key=lambda i: (i["page"], i["bbox"][1], i["bbox"][0]))
    return images
