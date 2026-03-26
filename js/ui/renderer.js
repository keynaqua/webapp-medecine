import { clearElement } from "./utils/clearElement.js";
import { renderClassicQuestion } from "./components/renderClassicQuestion.js";
import { renderSubitemsQuestion } from "./components/renderSubitemsQuestion.js";
import { renderImages } from "./components/renderImages.js";
import { renderValidateButton } from "./components/renderValidateButton.js";
import { renderEndScreenComponent } from "./components/renderEndScreen.js";

const output = document.getElementById("output");

export function renderQuestionScreen(qcm, currentIndex, totalQuestions, onValidate) {
  clearElement(output);

  const container = document.createElement("div");
  container.className = "qcm";

  const title = document.createElement("h2");
  title.textContent = `QCM ${qcm.number} (${currentIndex + 1}/${totalQuestions})`;
  container.appendChild(title);

  const question = document.createElement("p");
  question.className = "question";
  question.textContent = qcm.question;
  container.appendChild(question);

  const hasSubitems = Array.isArray(qcm.subitems) && qcm.subitems.length > 0;

  if (hasSubitems) {
    container.appendChild(renderSubitemsQuestion(qcm));
  } else {
    container.appendChild(renderClassicQuestion(qcm));
  }

  if (Array.isArray(qcm.images) && qcm.images.length > 0) {
    container.appendChild(renderImages(qcm.images, qcm.number));
  }

  container.appendChild(renderValidateButton(container, onValidate));
  output.appendChild(container);
}

export function renderEndScreen() {
  clearElement(output);
  output.appendChild(renderEndScreenComponent());
}