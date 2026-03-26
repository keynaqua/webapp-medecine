import re

QUESTION_RE = re.compile(r"QCM\s+(\d+)\s*:", re.IGNORECASE)

QUESTION_BLOCK_RE = re.compile(
    r"QCM\s+(\d+)\s*:\s*(.*?)(?=QCM\s+\d+\s*:|$)",
    re.IGNORECASE | re.DOTALL
)

ANSWER_START_RE = re.compile(
    r"^\s*([A-E])[\.\)]\s*(.*)$",
    re.IGNORECASE
)

ITEM_START_RE = re.compile(
    r"^\s*([A-E]|\d+)[\.\)]\s*(.*)$",
    re.IGNORECASE
)

ASSOCIATION_HINT_RE = re.compile(
    r"(question\s+d[’']association|associez)",
    re.IGNORECASE
)

IMAGE_LABEL_RE = re.compile(r"^[A-E]$", re.IGNORECASE)
