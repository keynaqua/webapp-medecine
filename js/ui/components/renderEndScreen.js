export function renderEndScreenComponent() {
  const endMessage = document.createElement("div");
  endMessage.className = "qcm";

  const title = document.createElement("h2");
  title.textContent = "Terminé";
  endMessage.appendChild(title);

  const text = document.createElement("p");
  text.textContent = "Tu as terminé toutes les questions.";
  endMessage.appendChild(text);

  return endMessage;
}