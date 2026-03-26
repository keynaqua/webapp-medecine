import { renderQuestionScreen, renderEndScreen } from "./ui/renderer.js";

const input = document.getElementById("pdfInput");
const status = document.getElementById("status");

const API_URL = "https://webapp-medecine.onrender.com/api/parse-pdf";

let qcms = [];
let currentIndex = 0;
let userAnswers = [];

input.addEventListener("change", handleFileUpload);

async function handleFileUpload(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  status.textContent = "Parsing du PDF en cours...";

  const formData = new FormData();
  formData.append("pdf", file);

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      body: formData,
    });

    const rawText = await response.text();

    if (!response.ok) {
      throw new Error(`Erreur HTTP ${response.status}: ${rawText}`);
    }

    const data = JSON.parse(rawText);

    qcms = Array.isArray(data.qcms) ? data.qcms : [];
    currentIndex = 0;
    userAnswers = [];

    input.style.display = "none";
    status.textContent = "PDF parsé avec succès.";

    showCurrentQuestion();
  } catch (error) {
    console.error(error);
    status.textContent = "Erreur pendant le parsing du PDF.";
  }
}

function showCurrentQuestion() {
  if (currentIndex >= qcms.length) {
    renderEndScreen(userAnswers, qcms);
    return;
  }

  renderQuestionScreen({
    qcm: qcms[currentIndex],
    currentIndex,
    totalQuestions: qcms.length,
    onValidate: handleValidate,
  });
}

function handleValidate(selection) {
  userAnswers.push({
    questionNumber: qcms[currentIndex].number,
    type: qcms[currentIndex].type,
    selection,
  });

  currentIndex += 1;
  showCurrentQuestion();
}
