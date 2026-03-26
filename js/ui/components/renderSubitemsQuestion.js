import { formatSubitem } from "../utils/formatSubitem.js";

export function renderSubitemsQuestion(qcm) {
  const wrapper = document.createElement("div");
  wrapper.className = "dual-list-wrapper";

  const answersColumn = document.createElement("div");
  answersColumn.className = "dual-list-column";

  const answersTitle = document.createElement("h3");
  answersTitle.textContent = "Réponses";
  answersColumn.appendChild(answersTitle);

  const answersList = document.createElement("div");
  answersList.className = "answers-list";

  qcm.answers.forEach((answer, index) => {
    const label = document.createElement("label");
    label.className = "list-item";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.value = answer.letter;
    checkbox.dataset.type = "answer";
    checkbox.dataset.index = index;

    const text = document.createElement("span");
    text.textContent = `${answer.letter}. ${answer.text}`;

    label.appendChild(checkbox);
    label.appendChild(text);
    answersList.appendChild(label);
  });

  answersColumn.appendChild(answersList);

  const subitemsColumn = document.createElement("div");
  subitemsColumn.className = "dual-list-column";

  const subitemsTitle = document.createElement("h3");
  subitemsTitle.textContent = "Subitems";
  subitemsColumn.appendChild(subitemsTitle);

  const subitemsList = document.createElement("div");
  subitemsList.className = "subitems-list";

  qcm.subitems.forEach((subitem, index) => {
    const label = document.createElement("label");
    label.className = "list-item";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.value = index;
    checkbox.dataset.type = "subitem";
    checkbox.dataset.index = index;

    const text = document.createElement("span");
    text.textContent = formatSubitem(subitem, index);

    label.appendChild(checkbox);
    label.appendChild(text);
    subitemsList.appendChild(label);
  });

  subitemsColumn.appendChild(subitemsList);

  wrapper.appendChild(answersColumn);
  wrapper.appendChild(subitemsColumn);

  return wrapper;
}