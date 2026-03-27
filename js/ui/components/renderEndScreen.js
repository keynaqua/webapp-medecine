function formatSimpleSelection(selection) {
  const letters = Array.isArray(selection?.selectedLetters)
    ? selection.selectedLetters.filter(Boolean)
    : [];

  return letters.length ? letters.join(" - ") : "Aucune réponse";
}

function formatTextAssociationSelection(selection) {
  const pairs = Array.isArray(selection?.pairs) ? selection.pairs : [];

  const filled = pairs
    .filter((pair) => pair.selectedNumber)
    .map((pair) => `${pair.propositionNumber}→${pair.selectedNumber}`);

  return filled.length ? filled.join(" | ") : "Aucune réponse";
}

function formatImageAssociationSelection(selection) {
  const pairs = Array.isArray(selection?.pairs) ? selection.pairs : [];

  const filled = pairs
    .filter((pair) => pair.selectedLetter)
    .map((pair) => `Image ${pair.imageNumber}→${pair.selectedLetter}`);

  return filled.length ? filled.join(" | ") : "Aucune réponse";
}

function formatAnswer(answer) {
  if (!answer?.selection) return "Aucune réponse";

  switch (answer.type) {
    case "text_association":
      return formatTextAssociationSelection(answer.selection);

    case "image_association":
      return formatImageAssociationSelection(answer.selection);

    case "simple":
    default:
      return formatSimpleSelection(answer.selection);
  }
}

export function renderEndScreenComponent(userAnswers = [], qcms = []) {
  const endMessage = document.createElement("div");
  endMessage.className = "qcm end-screen";

  const title = document.createElement("h2");
  title.className = "qcm-title";
  title.textContent = "Résumé des réponses";
  endMessage.appendChild(title);

  const subtitle = document.createElement("p");
  subtitle.className = "end-subtitle";
  subtitle.textContent = `${qcms.length} question(s) terminée(s).`;
  endMessage.appendChild(subtitle);

  const list = document.createElement("div");
  list.className = "summary-list";

  userAnswers.forEach((answer) => {
    const line = document.createElement("div");
    line.className = "summary-line";
    line.textContent = `QCM ${answer.questionNumber} : ${formatAnswer(answer)}`;
    list.appendChild(line);
  });

  endMessage.appendChild(list);

  return endMessage;
}