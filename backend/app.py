import os
import uuid
import fitz

from fastapi import FastAPI, UploadFile, File, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from parser.text_parser import extract_qcms_from_text
from parser.image_parser import extract_all_images, extract_question_anchors
from parser.attach import attach_images_to_questions

app = FastAPI()

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")
TMP_DIR = os.path.join(BASE_DIR, "tmp")

os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(TMP_DIR, exist_ok=True)

app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/api/parse-pdf")
async def parse_pdf(request: Request, pdf: UploadFile = File(...)):
    tmp_filename = f"{uuid.uuid4().hex}_{pdf.filename}"
    tmp_path = os.path.join(TMP_DIR, tmp_filename)

    with open(tmp_path, "wb") as f:
        f.write(await pdf.read())

    base_url = str(request.base_url).rstrip("/")
    doc = fitz.open(tmp_path)

    try:
        qcms = extract_qcms_from_text(doc)

        anchors = extract_question_anchors(doc)
        images = extract_all_images(doc, base_url, UPLOAD_DIR)

        qcms = attach_images_to_questions(qcms, anchors, images, len(doc))

        return {"qcms": qcms}

    finally:
        doc.close()
        os.remove(tmp_path)