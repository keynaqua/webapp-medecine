import {
  getPromptItems,
  getTargets,
  getImageLabel,
  getImageUrl,
  buildLetterOptions,
} from "../utils/questionHelpers.js";

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

function createPromptCard(item) {
  const card = document.createElement("div");
  card.className = "prompt-card";

  const letter = document.createElement("div");
  letter.className = "prompt-letter";
  letter.textContent = item.letter || "";

  const text = document.createElement("div");
  text.className = "prompt-text";
  text.textContent = item.text || "";

  card.appendChild(letter);
  card.appendChild(text);

  return card;
}

function createImageAnswerCard(target, index, letters) {
  const card = document.createElement("div");
  card.className = "image-answer-card";
  card.dataset.associationKind = "image";
  card.dataset.leftKey = String(index + 1);

  const img = document.createElement("img");
  img.className = "image-answer-preview";
  img.src = getImageUrl(target);
  img.alt = getImageLabel(target, index);
  img.loading = "lazy";

  const caption = document.createElement("div");
  caption.className = "image-answer-caption";
  caption.textContent = getImageLabel(target, index);

  const selectWrapper = document.createElement("div");
  selectWrapper.className = "image-answer-select-wrapper";
  selectWrapper.appendChild(createAssociationSelect(letters));

  card.appendChild(img);
  card.appendChild(caption);
  card.appendChild(selectWrapper);

  return card;
}

export function renderImageAssociationQuestion(qcm) {
  const wrapper = document.createElement("div");
  wrapper.className = "image-association-page";

  const promptItems = getPromptItems(qcm);
  const targets = getTargets(qcm);
  const letters = buildLetterOptions(promptItems);

  const topSection = document.createElement("section");
  topSection.className = "image-association-top";

  const topTitle = document.createElement("h3");
  topTitle.className = "section-title centered";
  topTitle.textContent = "Propositions";
  topSection.appendChild(topTitle);

  const promptsGrid = document.createElement("div");
  promptsGrid.className = "prompt-grid";

  promptItems.forEach((item) => {
    promptsGrid.appendChild(createPromptCard(item));
  });

  topSection.appendChild(promptsGrid);

  const bottomSection = document.createElement("section");
  bottomSection.className = "image-association-bottom";

  const bottomTitle = document.createElement("h3");
  bottomTitle.className = "section-title centered";
  bottomTitle.textContent = "Images";
  bottomSection.appendChild(bottomTitle);

  const imagesGrid = document.createElement("div");
  imagesGrid.className = "image-answer-grid";

  targets.forEach((target, index) => {
    const url = getImageUrl(target);
    if (!url) return;
    imagesGrid.appendChild(createImageAnswerCard(target, index, letters));
  });

  bottomSection.appendChild(imagesGrid);

  wrapper.appendChild(topSection);
  wrapper.appendChild(bottomSection);

  return wrapper;
}