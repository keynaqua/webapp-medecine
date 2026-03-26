import { displayCurrentQCM } from "./ui/renderer.js";

const input = document.getElementById("pdfInput");
const status = document.getElementById("status");

const API_URL = "https://webapp-medecine.onrender.com/api/parse-pdf";

let qcms = [];
let currentIndex = 0;
let userAnswers = [];

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

    console.log(data);

    qcms = data.qcms || [];
    currentIndex = 0;
    userAnswers = [];

    document.getElementById("uploadSection").style.display = "none";
    status.textContent = "PDF parsé avec succès.";

    renderQuestion();
  } catch (error) {
    console.error(error);
    status.textContent = "Erreur pendant le parsing du PDF.";
  }
}

function renderQuestion() {
  displayCurrentQCM(qcms, currentIndex, handleValidate);
}

function handleValidate(selectedAnswers) {
  userAnswers.push({
    questionNumber: qcms[currentIndex].number,
    selectedAnswers
  });

  currentIndex++;
  renderQuestion();
}