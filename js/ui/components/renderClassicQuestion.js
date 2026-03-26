export function renderClassicQuestion(qcm) {
  const answersDiv = document.createElement("div");
  answersDiv.className = "answers";

  qcm.answers.forEach((answer, index) => {
    const label = document.createElement("label");
    label.className = "answer-item";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.value = answer.letter;
    checkbox.dataset.type = "answer";
    checkbox.dataset.index = index;

    const text = document.createElement("span");
    text.textContent = `${answer.letter}. ${answer.text}`;

    label.appendChild(checkbox);
    label.appendChild(text);
    answersDiv.appendChild(label);
  });

  return answersDiv;
}