import re


def normalize_spaces(text: str) -> str:
    return re.sub(r"[ \t\r\f\v]+", " ", text.replace("\u00a0", " ")).strip()


def clean_multiline_text(text: str) -> str:
    lines = text.splitlines()
    cleaned = []

    for line in lines:
        line = normalize_spaces(line)
        if line:
            cleaned.append(line)

    return "\n".join(cleaned).strip()