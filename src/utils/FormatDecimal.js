export const decimalComma = (number) => {
  // Convert to string and replace any existing dot with a comma
  let formatted = number.toString().replace(".", ",");

  // If there's no comma, add ',00' at the end
  if (!formatted.includes(",")) {
    formatted += ",00";
  } else {
    // If there's only one digit after the comma, add a zero
    const parts = formatted.split(",");
    if (parts[1].length === 1) {
      formatted += "0";
    }
  }

  return formatted;
};

export const decimalPeriod = (number) => {
  // Convert to string and ensure it uses a period as decimal separator
  let formatted = parseFloat(number).toFixed(2);

  // If it's a whole number, add '.00'
  if (!formatted.includes(".")) {
    formatted += ".00";
  } else {
    // If there's only one digit after the period, add a zero
    const parts = formatted.split(".");
    if (parts[1].length === 1) {
      formatted += "0";
    }
  }

  return formatted;
};
