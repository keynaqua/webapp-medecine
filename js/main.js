import { extractTextFromPDF } from "./services/pdfExtractor.js";
import { cleanText } from "./utils/textUtils.js";
import { parseAllQCMs } from "./core/parser.js";
import { displayQCMs } from "./ui/renderer.js";

const input = document.getElementById("pdfInput");

input.addEventListener("change", handleFile);

async function handleFile(e) {
  const file = e.target.files[0];
  if (!file) return;

  const text = await extractTextFromPDF(file);
  const cleanedText = cleanText(text);
  const qcms = parseAllQCMs(cleanedText);

  displayQCMs(qcms);
}