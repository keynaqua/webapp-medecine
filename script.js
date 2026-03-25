const input = document.getElementById("pdfInput");
const output = document.getElementById("output");

input.addEventListener("change", handleFile);

async function handleFile(e) {
  const file = e.target.files[0];
  if (!file) return;

  const text = await extractTextFromPDF(file);
  const cleanedText = cleanText(text);
  const qcms = parseAllQCMs(cleanedText);

  displayQCMs(qcms);
}

// 📄 Extraction PDF
async function extractTextFromPDF(file) {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;

  let fullText = "";

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();

    const strings = content.items.map(item => item.str);
    fullText += strings.join(" ") + "\n";
  }

  return fullText;
}

// 🧹 Nettoyage
function cleanText(text) {
  return text
    .replace(/\d+\/\d+/g, "") // enlève "1/3"
    .replace(/\s+/g, " ")     // normalise espaces
    .trim();
}

// ✂️ Split QCM
function splitQCMs(text) {
  return text.split(/QCM \d+ :/).slice(1);
}

// 🧠 Parse un QCM
function parseQCM(block) {
  const parts = block.split(/(?=[A-E]\.)/);

  const question = parts[0].trim();

  const answers = parts.slice(1).map(p => ({
    letter: p.trim()[0],
    text: p.trim().slice(2).trim()
  }));

  return { question, answers };
}

// 🔄 Parse tout
function parseAllQCMs(text) {
  const blocks = splitQCMs(text);
  return blocks.map(parseQCM);
}

// 🎨 Affichage
function displayQCMs(qcms) {
  output.innerHTML = "";

  qcms.forEach((qcm, index) => {
    const div = document.createElement("div");
    div.className = "qcm";

    const question = document.createElement("div");
    question.className = "question";
    question.textContent = `QCM ${index + 1} — ${qcm.question}`;

    const answersDiv = document.createElement("div");
    answersDiv.className = "answers";

    qcm.answers.forEach(answer => {
      const btn = document.createElement("button");
      btn.textContent = `${answer.letter}. ${answer.text}`;
      answersDiv.appendChild(btn);
    });

    div.appendChild(question);
    div.appendChild(answersDiv);
    output.appendChild(div);
  });
}