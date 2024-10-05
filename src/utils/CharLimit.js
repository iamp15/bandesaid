export const isValidNumber = (number, digits) => {
  const regex = new RegExp(`^\\d{${digits}}$`);
  return regex.test(number);
};
