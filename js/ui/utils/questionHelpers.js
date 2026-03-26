export function getChoices(qcm) {
  return Array.isArray(qcm.choices) ? qcm.choices : [];
}

export function getPropositions(qcm) {
  return Array.isArray(qcm.propositions) ? qcm.propositions : [];
}

export function getPromptItems(qcm) {
  return Array.isArray(qcm.prompt_items) ? qcm.prompt_items : [];
}

export function getTargets(qcm) {
  return Array.isArray(qcm.targets) ? qcm.targets : [];
}

export function buildLetterOptions(targetsOrChoices) {
  return targetsOrChoices
    .map((item) => item?.letter)
    .filter(Boolean)
    .sort();
}
