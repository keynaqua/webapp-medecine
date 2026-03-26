import {
  getChoices,
  getPropositions,
  buildLetterOptions,
} from "../utils/questionHelpers.js";

function createChoiceLegend(choices) {
  const legend = document.createElement("div");
  legend.className = "association-legend";

  const title = document.createElement("h3");
  title.textContent = "Réponses disponibles";
  legend.appendChild(title);

  const list = document.createElement("div");
  list.className = "legend-list";

  choices.forEach((choice) => {
    const item = document.createElement("div");
    item.className = "legend-item";
    item.innerHTML = `<strong>${choice.letter}.</strong> ${choice.text}`;
    list.appendChild(item);
  });

  legend.appendChild(list);
  return legend;
}

function createAssociationSelect(options) {
  const select = document.createElement("select");
  select.className = "association-select";
  select.dataset.role = "association-select";

  const emptyOption = document.createElement("option");
  emptyOption.value = "";
  emptyOption.textContent = "Choisir";
  select.appendChild(emptyOption);

  options.forEach((letter) => {
    const option = document.createElement("option");
    option.value = letter;
    option.textContent = letter;
    select.appendChild(option);
  });

  return select;
}

export function renderTextAssociationQuestion(qcm) {
  const wrapper = document.createElement("div");
  wrapper.className = "association-layout";

  const choices = getChoices(qcm);
  const propositions = getPropositions(qcm);
  const letters = buildLetterOptions(choices);

  wrapper.appendChild(createChoiceLegend(choices));

  const panel = document.createElement("div");
  panel.className = "association-panel";

  const title = document.createElement("h3");
  title.textContent = "Associe chaque proposition à une lettre";
  panel.appendChild(title);

  const rows = document.createElement("div");
  rows.className = "association-rows";

  propositions.forEach((proposition) => {
    const row = document.createElement("div");
    row.className = "association-row";
    row.dataset.associationKind = "text";
    row.dataset.leftKey = String(proposition.number);

    const left = document.createElement("div");
    left.className = "association-left";
    left.innerHTML = `<strong>${proposition.number}.</strong> ${proposition.text}`;

    const right = document.createElement("div");
    right.className = "association-right";
    right.appendChild(createAssociationSelect(letters));

    row.appendChild(left);
    row.appendChild(right);
    rows.appendChild(row);
  });

  panel.appendChild(rows);
  wrapper.appendChild(panel);
  return wrapper;
}
