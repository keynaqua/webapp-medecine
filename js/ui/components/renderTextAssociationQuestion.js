import {
  getChoices,
  getPropositions,
  buildNumericOptionsFromLength,
} from "../utils/questionHelpers.js";

function createDefinitionBox(choice) {
  const item = document.createElement("div");
  item.className = "definition-card";

  const letter = document.createElement("div");
  letter.className = "definition-letter";
  letter.textContent = choice.letter;

  const text = document.createElement("div");
  text.className = "definition-text";
  text.textContent = choice.text || "";

  item.appendChild(letter);
  item.appendChild(text);

  return item;
}

function createAssociationSelect(options) {
  const select = document.createElement("select");
  select.className = "association-select";
  select.dataset.role = "association-select";

  const emptyOption = document.createElement("option");
  emptyOption.value = "";
  emptyOption.textContent = "Choisir";
  select.appendChild(emptyOption);

  options.forEach((value) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    select.appendChild(option);
  });

  return select;
}

export function renderTextAssociationQuestion(qcm) {
  const wrapper = document.createElement("div");
  wrapper.className = "text-association-layout";

  const choices = getChoices(qcm);
  const propositions = getPropositions(qcm);
  const numericOptions = buildNumericOptionsFromLength(propositions.length);

  const leftColumn = document.createElement("section");
  leftColumn.className = "text-association-left";

  const leftTitle = document.createElement("h3");
  leftTitle.className = "section-title";
  leftTitle.textContent = "Propositions";
  leftColumn.appendChild(leftTitle);

  const definitionsList = document.createElement("div");
  definitionsList.className = "definition-list";

  choices.forEach((choice) => {
    definitionsList.appendChild(createDefinitionBox(choice));
  });

  leftColumn.appendChild(definitionsList);

  const rightColumn = document.createElement("section");
  rightColumn.className = "text-association-right";

  const rightTitle = document.createElement("h3");
  rightTitle.className = "section-title";
  rightTitle.textContent = "Associe chaque lettre à la bonne définition";
  rightColumn.appendChild(rightTitle);

  const rows = document.createElement("div");
  rows.className = "association-rows";

  propositions.forEach((proposition) => {
    const row = document.createElement("div");
    row.className = "association-row";
    row.dataset.associationKind = "text";
    row.dataset.leftKey = String(proposition.number);

    const left = document.createElement("div");
    left.className = "association-left";
    left.innerHTML = `<strong>${proposition.number}.</strong> ${proposition.text || ""}`;

    const right = document.createElement("div");
    right.className = "association-right";
    right.appendChild(createAssociationSelect(numericOptions));

    row.appendChild(left);
    row.appendChild(right);
    rows.appendChild(row);
  });

  rightColumn.appendChild(rows);

  wrapper.appendChild(leftColumn);
  wrapper.appendChild(rightColumn);

  return wrapper;
}