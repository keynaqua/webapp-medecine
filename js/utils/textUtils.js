export function cleanText(text) {
  return text
    .replace(/\d+\/\d+/g, "")
    .replace(/\s+/g, " ")
    .trim();
}
