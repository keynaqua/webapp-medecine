from .constants import QUESTION_BLOCK_RE, ANSWER_START_RE
from .utils import normalize_spaces, clean_multiline_text
import re

ITEM_START_RE = re.compile(r"^\s*([A-Z]|\d+)\.\s*(.*)")

HEADER_PATTERNS = [
    r"Tutorat d[’']Années Supérieures Médecine Bordeaux",
]

FOOTER_PATTERNS = [
    r"^\s*\d+\s*$",          # 2
    r"^\s*\d+/\d+\s*$",      # 11/43
    r"^\s*\(\d+/\d+\)\s*$",  # (11/43)
]


def clean_page_text(text):
    lines = text.splitlines()
    cleaned = []

    for line in lines:
        line = line.strip()
        if not line:
            cleaned.append("")
            continue

        # Header connu
        if any(re.search(pattern, line, re.IGNORECASE) for pattern in HEADER_PATTERNS):
            continue

        # Footer type "2", "11/43", "(11/43)"
        if any(re.match(pattern, line) for pattern in FOOTER_PATTERNS):
            continue

        # Cas collé dans une ligne :
        # "E. ... 2 Tutorat d’Années Supérieures Médecine Bordeaux F. ..."
        line = re.sub(
            r"\s+\d+\s+Tutorat d[’']Années Supérieures Médecine Bordeaux\s+",
            " ",
            line,
            flags=re.IGNORECASE
        )

        # Cas collé avec page/maxpage
        line = re.sub(
            r"\s+\(?\d+/\d+\)?\s+Tutorat d[’']Années Supérieures Médecine Bordeaux\s+",
            " ",
            line,
            flags=re.IGNORECASE
        )

        cleaned.append(line)

    return "\n".join(cleaned)


def extract_full_text(doc):
    pages_text = []

    for page_index in range(len(doc)):
        page = doc[page_index]
        text = page.get_text("text")
        if text:
            text = clean_page_text(text)
            pages_text.append(text)

    return "\n".join(pages_text)


def parse_qcm_block(number, raw_content):
    content = clean_multiline_text(raw_content)
    if not content:
        return None

    lines = content.splitlines()

    question_lines = []
    answers = []
    subitems = []
    current_item = None
    current_type = None

    for line in lines:
        line = line.strip()
        if not line:
            continue

        match = re.match(r"^\s*([A-Z]|\d+)\.\s*(.*)", line)

        if match:
            marker = match.group(1)
            text = match.group(2).strip()

            if current_item:
                current_item["text"] = normalize_spaces(current_item["text"])
                if current_type == "answer":
                    answers.append(current_item)
                else:
                    subitems.append(current_item)

            if marker.isdigit():
                current_type = "subitem"
                current_item = {
                    "number": int(marker),
                    "text": text
                }
            else:
                current_type = "answer"
                current_item = {
                    "letter": marker.upper(),
                    "text": text
                }
        else:
            if current_item:
                current_item["text"] += " " + line
            else:
                question_lines.append(line)

    if current_item:
        current_item["text"] = normalize_spaces(current_item["text"])
        if current_type == "answer":
            answers.append(current_item)
        else:
            subitems.append(current_item)

    question_text = normalize_spaces(" ".join(question_lines))

    if re.search(r"non\s+report[ée]?", question_text, re.IGNORECASE):
        return None

    result = {
        "number": int(number),
        "question": question_text,
        "answers": answers,
        "images": []
    }

    if subitems:
        result["subitems"] = subitems

    return result

def extract_qcms_from_text(doc):
    full_text = extract_full_text(doc)
    matches = QUESTION_BLOCK_RE.findall(full_text)

    qcms = []

    for number, raw_content in matches:
        parsed = parse_qcm_block(number, raw_content)
        if parsed:
            qcms.append(parsed)

    qcms.sort(key=lambda q: q["number"])
    return qcms