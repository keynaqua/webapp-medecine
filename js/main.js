import { displayQCMs } from "./ui/renderer.js";

const input = document.getElementById("pdfInput");
const status = document.getElementById("status");

const API_URL = "https://webapp-medecine.onrender.com/api/parse-pdf";

input.addEventListener("change", handleFile);

async function handleFile(event) {
  const file = event.target.files[0];
  if (!file) return;

  status.textContent = "Parsing du PDF en cours...";

  const formData = new FormData();
  formData.append("pdf", file);

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      body: formData
    });

    const text = await response.text();

    if (!response.ok) {
      console.error("Réponse backend :", text);
      throw new Error(`Erreur HTTP ${response.status}`);
    }

    const data = JSON.parse(text);

	console.log(text);

    displayQCMs(data.qcms);
    status.textContent = "PDF parsé avec succès.";
  } catch (error) {
    console.error(error);
    status.textContent = "Erreur pendant le parsing du PDF.";
  }
}