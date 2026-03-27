import { getChoices } from "../utils/questionHelpers.js";

export function renderSimpleQuestion(container, qcm, onAnswer) {
    container.innerHTML = "";

    const title = document.createElement("h2");
    title.textContent = `Question ${qcm.number}`;
    container.appendChild(title);

    const question = document.createElement("p");
    question.textContent = qcm.question;
    container.appendChild(question);

    // ✅ AJOUT : affichage des images
    if (qcm.images && qcm.images.length > 0) {
        const imagesContainer = document.createElement("div");
        imagesContainer.className = "question-images";

        qcm.images.forEach((imgObj) => {
            const wrapper = document.createElement("div");
            wrapper.className = "question-image-wrapper";

            const img = document.createElement("img");
            img.src = imgObj.url || imgObj.image;
            img.alt = imgObj.label || "image question";

            wrapper.appendChild(img);

            if (imgObj.label) {
                const label = document.createElement("p");
                label.className = "image-label";
                label.textContent = imgObj.label;
                wrapper.appendChild(label);
            }

            imagesContainer.appendChild(wrapper);
        });

        container.appendChild(imagesContainer);
    }

    // Choix
    const form = document.createElement("form");

    qcm.choices.forEach((choice, index) => {
        const label = document.createElement("label");
        label.className = "choice";

        const input = document.createElement("input");
        input.type = "checkbox";
        input.name = "answer";
        input.value = choice.letter;

        label.appendChild(input);
        label.append(` ${choice.letter}. ${choice.text}`);

        form.appendChild(label);
    });

    container.appendChild(form);

    const button = document.createElement("button");
    button.textContent = "Valider";

    button.onclick = () => {
        const selected = Array.from(
            form.querySelectorAll("input:checked")
        ).map((input) => input.value);

        onAnswer(selected);
    };

    container.appendChild(button);
}
