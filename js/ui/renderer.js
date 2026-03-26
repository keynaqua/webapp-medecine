const output = document.getElementById("output");

export function displayCurrentQCM(qcms, currentIndex, onValidate) {
  output.innerHTML = "";

  if (!qcms || currentIndex >= qcms.length) {
    const endMessage = document.createElement("div");
    endMessage.className = "qcm";
    endMessage.innerHTML = "<h2>Terminé</h2><p>Tu as terminé toutes les questions.</p>";
    output.appendChild(endMessage);
    return;
  }

  const qcm = qcms[currentIndex];

  const qcmDiv = document.createElement("div");
  qcmDiv.className = "qcm";

  const title = document.createElement("h2");
  title.textContent = `QCM ${qcm.number} (${currentIndex + 1}/${qcms.length})`;
  qcmDiv.appendChild(title);

  const question = document.createElement("p");
  question.className = "question";
  question.textContent = qcm.question;
  qcmDiv.appendChild(question);

  const hasSubitems =
    Array.isArray(qcm.subitems) &&
    qcm.subitems.length > 0;

  if (hasSubitems) {
    renderSubitemsQuestion(qcm, qcmDiv);
  } else {
    renderClassicQuestion(qcm, qcmDiv);
  }

  if (qcm.images && qcm.images.length > 0) {
    const imagesDiv = document.createElement("div");
    imagesDiv.className = "images";

    qcm.images.forEach((src) => {
      const img = document.createElement("img");
      img.src = src;
      img.alt = `Image pour QCM ${qcm.number}`;
      img.className = "qcm-image";
      imagesDiv.appendChild(img);
    });

    qcmDiv.appendChild(imagesDiv);
  }

  const validateButton = document.createElement("button");
  validateButton.textContent = "Valider";
  validateButton.className = "validate-button";
  validateButton.addEventListener("click", () => {
    const checkedInputs = qcmDiv.querySelectorAll('input[type="checkbox"]:checked');
    const selectedAnswers = Array.from(checkedInputs).map((input) => ({
      value: input.value,
      subitemIndex: input.dataset.subitemIndex || null,
      answerIndex: input.dataset.answerIndex || null
    }));

    onValidate(selectedAnswers);
  });

  qcmDiv.appendChild(validateButton);
  output.appendChild(qcmDiv);
}

function renderClassicQuestion(qcm, container) {
  const answersDiv = document.createElement("div");
  answersDiv.className = "answers";

  qcm.answers.forEach((answer, index) => {
    const label = document.createElement("label");
    label.className = "answer-item";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.value = answer.letter;
    checkbox.dataset.answerIndex = index;

    const text = document.createElement("span");
    text.textContent = `${answer.letter}. ${answer.text}`;

    label.appendChild(checkbox);
    label.appendChild(text);
    answersDiv.appendChild(label);
  });

  container.appendChild(answersDiv);
}

function renderSubitemsQuestion(qcm, container) {
  const pairList = document.createElement("div");
  pairList.className = "subitems-answers-list";

  const maxLength = Math.max(qcm.subitems.length, qcm.answers.length);

  for (let i = 0; i < maxLength; i++) {
    const subitem = qcm.subitems[i];
    const answer = qcm.answers[i];

    const row = document.createElement("label");
    row.className = "subitem-answer-row";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.value = answer ? answer.letter : "";
    checkbox.dataset.subitemIndex = i;
    checkbox.dataset.answerIndex = i;

    const subitemDiv = document.createElement("div");
    subitemDiv.className = "subitem-col";
    subitemDiv.textContent = formatSubitem(subitem, i);

    const answerDiv = document.createElement("div");
    answerDiv.className = "answer-col";
    answerDiv.textContent = answer
      ? `${answer.letter}. ${answer.text}`
      : "(réponse absente)";

    row.appendChild(checkbox);
    row.appendChild(subitemDiv);
    row.appendChild(answerDiv);

    pairList.appendChild(row);
  }

  container.appendChild(pairList);
}

function formatSubitem(subitem, index) {
  if (!subitem) {
    return `(subitem ${index + 1} absent)`;
  }

  if (typeof subitem === "string") {
    return subitem;
  }

  if (typeof subitem === "object") {
    if (subitem.text) return subitem.text;
    if (subitem.label && subitem.text) return `${subitem.label}. ${subitem.text}`;
    if (subitem.label) return subitem.label;
  }

  return String(subitem);
}