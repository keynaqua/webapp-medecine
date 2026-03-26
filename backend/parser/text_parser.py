from .constants import QUESTION_BLOCK_RE, ITEM_START_RE, ASSOCIATION_HINT_RE
from .utils import (
    normalize_spaces,
    clean_multiline_text,
    remove_trailing_image_labels,
    split_dash_items,
)
import re

HEADER_PATTERNS = [
    r"Tutorat d[’']Années Supérieures Médecine Bordeaux",
]

FOOTER_PATTERNS = [
    r"^\s*\d+\s*$",
    r"^\s*\d+/\d+\s*$",
    r"^\s*\(\d+/\d+\)\s*$",
]


def clean_page_text(text):
    lines = text.splitlines()
    cleaned = []

    for line in lines:
        line = line.strip()
        if not line:
            cleaned.append("")
            continue

        if any(re.search(pattern, line, re.IGNORECASE) for pattern in HEADER_PATTERNS):
            continue

        if any(re.match(pattern, line) for pattern in FOOTER_PATTERNS):
            continue

        line = re.sub(
            r"\s+\d+\s+Tutorat d[’']Années Supérieures Médecine Bordeaux\s+",
            " ",
            line,
            flags=re.IGNORECASE
        )

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


def _flush_current_item(current_item, current_type, answers, propositions):
    if not current_item:
        return

    current_item["text"] = normalize_spaces(current_item["text"])
    if current_type == "answer":
        answers.append(current_item)
    elif current_type == "proposition":
        propositions.append(current_item)


def _parse_question_core(question_lines):
    question_text = normalize_spaces(" ".join(question_lines))
    question_text = remove_trailing_image_labels(question_text)

    prompt = None
    prompt_items = []

    if ":" in question_text:
        left, right = question_text.split(":", 1)
        if ASSOCIATION_HINT_RE.search(left):
            prompt = normalize_spaces(left)
            prompt_items = split_dash_items(right)

    return question_text, prompt, prompt_items


def _infer_type(answers, propositions, prompt_items):
    if answers and propositions:
        return "text_association"
    if answers:
        return "simple"
    if prompt_items:
        return "image_association"
    return "simple"


def parse_qcm_block(number, raw_content):
    content = clean_multiline_text(raw_content)
    if not content:
        return None

    lines = content.splitlines()

    question_lines = []
    answers = []
    propositions = []
    current_item = None
    current_type = None

    for line in lines:
        line = line.strip()
        if not line:
            continue

        match = ITEM_START_RE.match(line)

        if match:
            marker = match.group(1).upper()
            text = match.group(2).strip()

            _flush_current_item(current_item, current_type, answers, propositions)

            if marker.isdigit():
                current_type = "proposition"
                current_item = {
                    "number": int(marker),
                    "text": text
                }
            elif marker in {"A", "B", "C", "D", "E"}:
                current_type = "answer"
                current_item = {
                    "letter": marker,
                    "text": text
                }
            else:
                current_type = None
                current_item = None
        else:
            if current_item:
                current_item["text"] += " " + line
            else:
                question_lines.append(line)

    _flush_current_item(current_item, current_type, answers, propositions)

    question_text, prompt, prompt_items = _parse_question_core(question_lines)

    if re.search(r"non\s+report[ée]?", question_text, re.IGNORECASE):
        return None

    qcm_type = _infer_type(answers, propositions, prompt_items)

    result = {
        "number": int(number),
        "type": qcm_type,
        "question": prompt if qcm_type == "image_association" and prompt else question_text,
    }

    if qcm_type == "simple":
        result["choices"] = answers
        result["images"] = []
    elif qcm_type == "text_association":
        result["choices"] = answers
        result["propositions"] = propositions
    elif qcm_type == "image_association":
        result["prompt_items"] = [
            {"index": index + 1, "text": text}
            for index, text in enumerate(prompt_items)
        ]
        result["targets"] = []

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
