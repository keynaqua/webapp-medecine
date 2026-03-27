export function getChoices(qcm) {
  return Array.isArray(qcm?.choices) ? qcm.choices : [];
}

export function getPropositions(qcm) {
  return Array.isArray(qcm?.propositions) ? qcm.propositions : [];
}

export function getPromptItems(qcm) {
  return Array.isArray(qcm?.prompt_items) ? qcm.prompt_items : [];
}

export function getTargets(qcm) {
  return Array.isArray(qcm?.targets) ? qcm.targets : [];
}

export function getImages(qcm) {
  return Array.isArray(qcm?.images) ? qcm.images : [];
}

export function getImageUrl(image) {
  return image?.url || image?.image || "";
}

export function getImageLabel(image, index) {
  if (typeof image?.label === "string" && image.label.trim() !== "") {
    return image.label.trim();
  }
  return `Image ${index + 1}`;
}

export function buildNumericOptionsFromLength(length) {
  return Array.from({ length }, (_, index) => String(index + 1));
}

export function buildLetterOptions(items) {
  return items
    .map((item) => item?.letter)
    .filter(Boolean);
}