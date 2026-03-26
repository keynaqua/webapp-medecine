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


def remove_trailing_image_labels(text: str) -> str:
    """
    Supprime des suffixes du style "A B C D E" ajoutés par l'extraction texte
    sous des images d'association.
    """
    text = normalize_spaces(text)
    return re.sub(r"(?:\s+[A-E]){2,}\s*$", "", text).strip()


def split_dash_items(text: str):
    """
    'foo - bar - baz' -> ['foo', 'bar', 'baz']
    Gère aussi les tirets typographiques.
    """
    normalized = normalize_spaces(text)
    parts = re.split(r"\s+[–—-]\s+", normalized)
    return [part.strip(" -–—") for part in parts if part.strip(" -–—")]
