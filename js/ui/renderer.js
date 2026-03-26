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
    renderQuestionWithSubitems(qcm, qcmDiv);
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
    const selectedAnswers = Array.from(
      qcmDiv.querySelectorAll('input[data-type="answer"]:checked')
    ).map((input) => ({
      index: Number(input.dataset.index),
      value: input.value
    }));

    const selectedSubitems = Array.from(
      qcmDiv.querySelectorAll('input[data-type="subitem"]:checked')
    ).map((input) => ({
      index: Number(input.dataset.index),
      value: input.value
    }));

    onValidate({
      selectedAnswers,
      selectedSubitems
    });
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
    checkbox.dataset.type = "answer";
    checkbox.dataset.index = index;

    const text = document.createElement("span");
    text.textContent = `${answer.letter}. ${answer.text}`;

    label.appendChild(checkbox);
    label.appendChild(text);
    answersDiv.appendChild(label);
  });

  container.appendChild(answersDiv);
}

function renderQuestionWithSubitems(qcm, container) {
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

  container.appendChild(wrapper);
}

function formatSubitem(subitem, index) {
  if (!subitem) {
    return `Subitem ${index + 1}`;
  }

  if (typeof subitem === "string") {
    return subitem;
  }

  if (typeof subitem === "object") {
    if (subitem.label && subitem.text) {
      return `${subitem.label}. ${subitem.text}`;
    }
    if (subitem.text) {
      return subitem.text;
    }
    if (subitem.label) {
      return subitem.label;
    }
  }

  return String(subitem);
}