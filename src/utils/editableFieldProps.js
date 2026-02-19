export function editableFieldProps({
  fieldName,
  label,
  value,
  placeholder,
  onSave,
  currentUser,
  editHistory,
  setShowSuggestions,
  setOnEdit,
  onEdit,
  formatValue,
}) {
  return {
    fieldName,
    label,
    value,
    placeholder,
    onSave,
    currentUser,
    editHistory,
    setShowSuggestions,
    setOnEdit,
    onEdit,
    ...(formatValue && { formatValue }),
  };
}
