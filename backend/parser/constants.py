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