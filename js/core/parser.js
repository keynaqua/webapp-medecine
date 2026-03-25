function splitQCMs(text) {
  return text.split(/QCM \d+ :/).slice(1);
}

function parseQCM(block) {
  const parts = block.split(/(?=[A-E]\.)/);

  const question = parts[0].trim();

  const answers = parts.slice(1).map(p => ({
    letter: p.trim()[0],
    text: p.trim().slice(2).trim()
  }));

  return { question, answers };
}

export function parseAllQCMs(text) {
  const blocks = splitQCMs(text);
  return blocks.map(parseQCM);
}
