import { getSelections } from "../utils/getSelections.js";

export function renderValidateButton({ container, qcm, onValidate }) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "validate-button";
  button.textContent = "Valider";

  button.addEventListener("click", () => {
    const selection = getSelections(container, qcm.type);
    onValidate(selection);
  });

  return button;
}