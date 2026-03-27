import {
  getChoices,
  getImages,
  getImageLabel,
  getImageUrl,
} from "../utils/questionHelpers.js";

function createQuestionImages(images) {
  if (!images.length) return null;

  const section = document.createElement("section");
  section.className = "question-images-section";

  const grid = document.createElement("div");
  grid.className = "question-images-grid";

  images.forEach((image, index) => {
    const url = getImageUrl(image);
    if (!url) return;

    const figure = document.createElement("figure");
    figure.className = "question-image-card";

    const img = document.createElement("img");
    img.className = "question-image-preview";
    img.src = url;
    img.alt = getImageLabel(image, index);
    img.loading = "lazy";

    const caption = document.createElement("figcaption");
    caption.className = "question-image-caption";
    caption.textContent = getImageLabel(image, index);

    figure.appendChild(img);
    figure.appendChild(caption);
    grid.appendChild(figure);
  });

  if (!grid.childElementCount) return null;

  section.appendChild(grid);
  return section;
}

export function renderSimpleQuestion(qcm) {
  const wrapper = document.createElement("div");
  wrapper.className = "simple-question";

  const images = getImages(qcm);
  const imagesSection = createQuestionImages(images);

  if (imagesSection) {
    wrapper.appendChild(imagesSection);
  }

  const list = document.createElement("div");
  list.className = "choice-list";

  getChoices(qcm).forEach((choice) => {
    const label = document.createElement("label");
    label.className = "choice-card";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.value = choice.letter;
    checkbox.dataset.role = "simple-choice";

    const content = document.createElement("div");
    content.className = "choice-card-content";

    const letter = document.createElement("span");
    letter.className = "choice-letter";
    letter.textContent = choice.letter;

    const text = document.createElement("span");
    text.className = "choice-text";
    text.textContent = choice.text || "";

    content.appendChild(letter);
    content.appendChild(text);
    label.appendChild(checkbox);
    label.appendChild(content);
    list.appendChild(label);
  });

  wrapper.appendChild(list);

  return wrapper;
}