export const formatNumber = (input) => {
  // If input is a number, convert it to a string with 2 decimal places
  if (typeof input === "number") {
    input = input.toFixed(2);
  }

  // Check if the input is already in the correct format
  if (/^\d{1,3}(\.\d{3})*,\d{2}$/.test(input)) {
    return input;
  }

  // Remove existing thousand separators and replace comma with dot
  const cleanedInput = input.replace(/\.(?=\d{3})/g, "").replace(",", ".");

  // Parse the cleaned input
  const number = parseFloat(cleanedInput);

  if (isNaN(number)) {
    return "0,00"; // or handle the error as appropriate for your application
  }

  // Format the number
  const parts = number.toFixed(2).split(".");

  const integerPart = parts[0];
  const decimalPart = parts[1];

  // Add thousand separators to the integer part
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

  // Combine the parts with a comma as decimal separator
  return `${formattedInteger},${decimalPart}`;
};
