import { clearElement } from "../utils/clearElement.js";
import { renderSimpleQuestion } from "../components/renderSimpleQuestion.js";
import { renderTextAssociationQuestion } from "../components/renderTextAssociationQuestion.js";
import { renderImageAssociationQuestion } from "../components/renderImageAssociationQuestion.js";
import { renderValidateButton } from "../components/renderValidateButton.js";
import { renderEndScreenComponent } from "../components/renderEndScreen.js";

const output = document.getElementById("output");

function createQuestionCard(qcm, currentIndex, totalQuestions) {
  const container = document.createElement("div");
  container.className = "qcm";

  const title = document.createElement("h2");
  title.className = "qcm-title";
  title.textContent = `QCM ${qcm.number} (${currentIndex + 1}/${totalQuestions})`;
  container.appendChild(title);

  const typeBadge = document.createElement("span");
  typeBadge.className = "question-type-badge";
  typeBadge.textContent = qcm.type;
  container.appendChild(typeBadge);

  const question = document.createElement("p");
  question.className = "question";
  question.textContent = qcm.question;
  container.appendChild(question);

  return container;
}

function renderQuestionContent(qcm) {
  switch (qcm.type) {
    case "text_association":
      return renderTextAssociationQuestion(qcm);
    case "image_association":
      return renderImageAssociationQuestion(qcm);
    case "simple":
    default:
      return renderSimpleQuestion(qcm);
  }
}

export function renderQuestionScreen({ qcm, currentIndex, totalQuestions, onValidate }) {
  clearElement(output);

  const container = createQuestionCard(qcm, currentIndex, totalQuestions);
  container.appendChild(renderQuestionContent(qcm));
  container.appendChild(renderValidateButton({ container, qcm, onValidate }));

  output.appendChild(container);
}

export function renderEndScreen(userAnswers = [], qcms = []) {
  clearElement(output);
  output.appendChild(renderEndScreenComponent(userAnswers, qcms));
}
