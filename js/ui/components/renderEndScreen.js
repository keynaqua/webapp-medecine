export function renderEndScreenComponent(userAnswers = [], qcms = []) {
  const endMessage = document.createElement("div");
  endMessage.className = "qcm";

  const title = document.createElement("h2");
  title.textContent = "Terminé";
  endMessage.appendChild(title);

  const text = document.createElement("p");
  text.textContent = `Tu as terminé ${qcms.length} question(s).`;
  endMessage.appendChild(text);

  if (userAnswers.length > 0) {
    const summary = document.createElement("pre");
    summary.className = "result-summary";
    summary.textContent = JSON.stringify(userAnswers, null, 2);
    endMessage.appendChild(summary);
  }

  return endMessage;
}
