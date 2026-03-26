export function getSelections(container) {
  const selectedAnswers = Array.from(
    container.querySelectorAll('input[data-type="answer"]:checked')
  ).map((input) => ({
    index: Number(input.dataset.index),
    value: input.value
  }));

  const selectedSubitems = Array.from(
    container.querySelectorAll('input[data-type="subitem"]:checked')
  ).map((input) => ({
    index: Number(input.dataset.index),
    value: input.value
  }));

  return {
    selectedAnswers: selectedAnswers,
    selectedSubitems: selectedSubitems
  };
}