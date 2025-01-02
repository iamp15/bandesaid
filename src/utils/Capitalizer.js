export const capitalizeWords = (str) => {
  return str
    .trim()
    .replace(/\s+/g, " ")
    .split(" ")
    .map((word) => {
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ");
};
