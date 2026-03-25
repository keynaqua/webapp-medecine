const output = document.getElementById("output");

export function displayQCMs(qcms) {
  output.innerHTML = "";

  qcms.forEach((qcm) => {
    const qcmDiv = document.createElement("div");
    qcmDiv.className = "qcm";

    const title = document.createElement("h2");
    title.textContent = `QCM ${qcm.number}`;
    qcmDiv.appendChild(title);

    const question = document.createElement("p");
    question.textContent = qcm.question;
    qcmDiv.appendChild(question);

    const answersDiv = document.createElement("div");
    answersDiv.className = "answers";

    qcm.answers.forEach((answer) => {
      const answerP = document.createElement("p");
      answerP.textContent = `${answer.letter}. ${answer.text}`;
      answersDiv.appendChild(answerP);
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

    output.appendChild(qcmDiv);
  });
}