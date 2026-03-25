const input = document.getElementById("pdfInput");
const output = document.getElementById("output");

input.addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const fileReader = new FileReader();

  fileReader.onload = async function () {
    const typedarray = new Uint8Array(this.result);

    const pdf = await pdfjsLib.getDocument(typedarray).promise;

    let fullText = "";

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();

      const strings = content.items.map(item => item.str);
      fullText += strings.join(" ") + "\n";
    }

    output.textContent = fullText;
  };

  fileReader.readAsArrayBuffer(file);
});