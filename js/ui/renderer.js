const output = document.getElementById("output");

export function displayQCMs(qcms) {
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
