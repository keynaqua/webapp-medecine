import { getSelections } from "../utils/getSelections.js";

export function renderValidateButton(container, onValidate) {
  const button = document.createElement("button");
  button.textContent = "Valider";
  button.className = "validate-button";

  button.addEventListener("click", () => {
    const selection = getSelections(container);
    onValidate(selection);
  });

  return button;
}