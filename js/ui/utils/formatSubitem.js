export function formatSubitem(subitem, index) {
  if (!subitem) {
    return `Subitem ${index + 1}`;
  }

  if (typeof subitem === "string") {
    return subitem;
  }

  if (typeof subitem === "object") {
    if (subitem.label && subitem.text) {
      return `${subitem.label}. ${subitem.text}`;
    }
    if (subitem.text) {
      return subitem.text;
    }
    if (subitem.label) {
      return subitem.label;
    }
  }

  return String(subitem);
}