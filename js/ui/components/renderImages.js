export function renderImages(images, qcmNumber) {
  const imagesDiv = document.createElement("div");
  imagesDiv.className = "images";

  images.forEach((src, index) => {
    const img = document.createElement("img");
    img.src = src;
    img.alt = `Image ${index + 1} pour QCM ${qcmNumber}`;
    img.className = "qcm-image";
    imagesDiv.appendChild(img);
  });

  return imagesDiv;
}