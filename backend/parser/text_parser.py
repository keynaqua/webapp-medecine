from .constants import QUESTION_BLOCK_RE, ANSWER_START_RE
from .utils import normalize_spaces, clean_multiline_text
import re


def extract_full_text(doc):
    pages_text = []

    for page_index in range(len(doc)):
        page = doc[page_index]
        text = page.get_text("text")
        if text:
            pages_text.append(text)

    return "\n".join(pages_text)


def parse_qcm_block(number, raw_content):
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
            if current_answer:
                current_answer["text"] = normalize_spaces(current_answer["text"])
                answers.append(current_answer)

            current_answer = {
                "letter": match.group(1).upper(),
                "text": match.group(2).strip()
            }
        else:
            if current_answer:
                current_answer["text"] += " " + line
            else:
                question_lines.append(line)

    if current_answer:
        current_answer["text"] = normalize_spaces(current_answer["text"])
        answers.append(current_answer)

    question_text = normalize_spaces(" ".join(question_lines))

    # 🔴 FILTRE NON REPORTÉ
    if re.search(r"non\s+report[ée]?", question_text, re.IGNORECASE):
        return None

    return {
        "number": int(number),
        "question": question_text,
        "answers": answers,
        "images": []
    }


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