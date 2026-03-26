import {
  getPromptItems,
  getTargets,
  buildLetterOptions,
} from "../utils/questionHelpers.js";

function createTargetGallery(targets) {
  const gallery = document.createElement("div");
  gallery.className = "image-targets-grid";

  targets.forEach((target) => {
    const card = document.createElement("div");
    card.className = "image-target-card";

    const label = document.createElement("div");
    label.className = "image-target-label";
    label.textContent = target.letter;

    const image = document.createElement("img");
    image.className = "image-target-preview";
    image.src = target.image;
    image.alt = `Image ${target.letter}`;

    card.appendChild(label);
    card.appendChild(image);
    gallery.appendChild(card);
  });

  return gallery;
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

export function renderImageAssociationQuestion(qcm) {
  const wrapper = document.createElement("div");
  wrapper.className = "image-association-layout";

  const targets = getTargets(qcm);
  const promptItems = getPromptItems(qcm);
  const letters = buildLetterOptions(targets);

  const gallerySection = document.createElement("section");
  gallerySection.className = "image-gallery-section";

  const galleryTitle = document.createElement("h3");
  galleryTitle.textContent = "Images repérées";
  gallerySection.appendChild(galleryTitle);
  gallerySection.appendChild(createTargetGallery(targets));

  const panel = document.createElement("section");
  panel.className = "association-panel";

  const panelTitle = document.createElement("h3");
  panelTitle.textContent = "Associe chaque proposition à une image";
  panel.appendChild(panelTitle);

  const rows = document.createElement("div");
  rows.className = "association-rows";

  promptItems.forEach((item, index) => {
    const row = document.createElement("div");
    row.className = "association-row";
    row.dataset.associationKind = "image";
    row.dataset.leftKey = String(item.index ?? index + 1);

    const left = document.createElement("div");
    left.className = "association-left";
    left.textContent = item.text;

    const right = document.createElement("div");
    right.className = "association-right";
    right.appendChild(createAssociationSelect(letters));

    row.appendChild(left);
    row.appendChild(right);
    rows.appendChild(row);
  });

  panel.appendChild(rows);
  wrapper.appendChild(gallerySection);
  wrapper.appendChild(panel);

  return wrapper;
}
