const output = document.getElementById("output");

export function displayCurrentQCM(qcms, currentIndex, onValidate) {
  output.innerHTML = "";

  if (!qcms || currentIndex >= qcms.length) {
    const endMessage = document.createElement("div");
    endMessage.className = "qcm";

    const title = document.createElement("h2");
    title.textContent = "Terminé";
    endMessage.appendChild(title);

    const text = document.createElement("p");
    text.textContent = "Tu as terminé toutes les questions.";
    endMessage.appendChild(text);

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

  const answersDiv = document.createElement("div");
  answersDiv.className = "answers";

  qcm.answers.forEach((answer) => {
    const label = document.createElement("label");
    label.className = "answer-item";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.value = answer.letter;

    const text = document.createElement("span");
    text.textContent = `${answer.letter}. ${answer.text}`;

    label.appendChild(checkbox);
    label.appendChild(text);
    answersDiv.appendChild(label);
  });

  qcmDiv.appendChild(answersDiv);

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
      answersDiv.querySelectorAll('input[type="checkbox"]:checked')
    ).map((input) => input.value);

    onValidate(selectedAnswers);
  });

  qcmDiv.appendChild(validateButton);
  output.appendChild(qcmDiv);
}