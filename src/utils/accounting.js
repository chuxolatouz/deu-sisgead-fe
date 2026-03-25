export const INCOME_TYPE_OPTIONS = [
  { value: "ordinary", label: "Ingresos ordinarios", color: "info" },
  { value: "own", label: "Ingresos propios", color: "success" },
];

const INCOME_TYPE_LABELS = INCOME_TYPE_OPTIONS.reduce((acc, option) => {
  acc[option.value] = option.label;
  return acc;
}, {});

const INCOME_TYPE_COLORS = INCOME_TYPE_OPTIONS.reduce((acc, option) => {
  acc[option.value] = option.color;
  return acc;
}, {});

export function getIncomeTypeLabel(value) {
  return INCOME_TYPE_LABELS[value] || "Sin definir";
}

export function getIncomeTypeChipColor(value) {
  return INCOME_TYPE_COLORS[value] || "default";
}
