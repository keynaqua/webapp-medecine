function getCheckedLetters(container) {
  return Array.from(
    container.querySelectorAll('input[data-role="simple-choice"]:checked')
  ).map((input) => input.value);
}

function getAssociationPairs(container, rowSelector) {
  return Array.from(container.querySelectorAll(rowSelector)).map((row) => {
    const leftKey = row.dataset.leftKey;
    const select = row.querySelector("select[data-role='association-select']");

    return {
      leftKey,
      rightKey: select?.value || "",
    };
  });
}

export function getSelections(container, qcmType) {
  switch (qcmType) {
    case "text_association":
      return {
        type: qcmType,
        pairs: getAssociationPairs(container, ".association-row[data-association-kind='text']"),
      };

    case "image_association":
      return {
        type: qcmType,
        pairs: getAssociationPairs(container, ".association-row[data-association-kind='image']"),
      };

    case "simple":
    default:
      return {
        type: "simple",
        selectedLetters: getCheckedLetters(container),
      };
  }
}
