import { displayQCMs } from "./ui/renderer.js";

const input = document.getElementById("pdfInput");
const status = document.getElementById("status");

input.addEventListener("change", handleFile);

async function handleFile(event) {
  const file = event.target.files[0];
  if (!file) return;

  status.textContent = "Parsing du PDF en cours...";

  const formData = new FormData();
  formData.append("pdf", file);

  try {
    const response = await fetch("http://127.0.0.1:8000/api/parse-pdf", {
      method: "POST",
      body: formData
    });

    if (!response.ok) {
      throw new Error("Erreur lors du parsing");
    }

    const data = await response.json();

    displayQCMs(data.qcms);
    status.textContent = "PDF parsé avec succès.";
  } catch (error) {
    console.error(error);
    status.textContent = "Erreur pendant le parsing du PDF.";
  }
}