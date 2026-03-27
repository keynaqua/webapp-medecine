function getCheckedLetters(container) {
  return Array.from(
    container.querySelectorAll('input[data-role="simple-choice"]:checked')
  ).map((input) => input.value);
}

function getTextAssociationPairs(container) {
  return Array.from(
    container.querySelectorAll('.association-row[data-association-kind="text"]')
  ).map((row) => {
    const propositionNumber = row.dataset.leftKey || "";
    const select = row.querySelector('select[data-role="association-select"]');

    return {
      propositionNumber,
      selectedNumber: select?.value || "",
    };
  });
}

function getImageAssociationPairs(container) {
  return Array.from(
    container.querySelectorAll('.image-answer-card[data-association-kind="image"]')
  ).map((card) => {
    const imageNumber = card.dataset.leftKey || "";
    const select = card.querySelector('select[data-role="association-select"]');

    return {
      imageNumber,
      selectedLetter: select?.value || "",
    };
  });
}

export function getSelections(container, qcmType) {
  switch (qcmType) {
    case "text_association":
      return {
        type: "text_association",
        pairs: getTextAssociationPairs(container),
      };

    case "image_association":
      return {
        type: "image_association",
        pairs: getImageAssociationPairs(container),
      };

    case "simple":
    default:
      return {
        type: "simple",
        selectedLetters: getCheckedLetters(container),
      };
  }
}