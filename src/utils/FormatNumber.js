export const formatNumber = (input) => {
  // Remove any existing thousand separators and replace comma with dot for parsing
  const cleanedInput = input.replace(/\./g, "").replace(",", ".");

  // Check if the input is already in the correct format
  const isCorrectFormat = /^\d{1,3}(\.\d{3})*,\d{2}$/.test(input);

  if (isCorrectFormat) {
    return input; // Return the input as is if it's already correctly formatted
  }

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
