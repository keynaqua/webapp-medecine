import { getChoices } from "../utils/questionHelpers.js";

export function renderSimpleQuestion(qcm) {
  const wrapper = document.createElement("div");
  wrapper.className = "simple-question";

  const hint = document.createElement("p");
  hint.className = "question-hint";
  hint.textContent = "Sélectionne une ou plusieurs réponses.";
  wrapper.appendChild(hint);

  const list = document.createElement("div");
  list.className = "choice-list";

  getChoices(qcm).forEach((choice) => {
    const label = document.createElement("label");
    label.className = "choice-card";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.value = choice.letter;
    checkbox.dataset.role = "simple-choice";

    const content = document.createElement("div");
    content.className = "choice-card-content";

    const letter = document.createElement("span");
    letter.className = "choice-letter";
    letter.textContent = choice.letter;

    const text = document.createElement("span");
    text.className = "choice-text";
    text.textContent = choice.text;

    content.appendChild(letter);
    content.appendChild(text);
    label.appendChild(checkbox);
    label.appendChild(content);
    list.appendChild(label);
  });

  wrapper.appendChild(list);
  return wrapper;
}
