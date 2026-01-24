export const STAGE_CATEGORIES = [
  { label: "Servidores", value: "Servidores", fill: "#9e9e9e" },
  { label: "Nuevos", value: "Nuevos", fill: "#1976d2" },
  { label: "Discapacitados", value: "Discapacitados", fill: "#ffff00" },
  { label: "Carriolas", value: "Carriolas", fill: "#008f39" },
  { label: "Lideres", value: "Lideres", fill: "#f44336" },
  { label: "Embarazadas", value: "Embarazadas", fill: "#9c27b0" },
  { label: "Silla Ruedas", value: "SillaRuedas", fill: "#FFFFFF" },
  { label: "Ninguno", value: null, fill: "#000" },
]

export const CLASS_STROKE_MAP = (() => {
  const map = {}
  STAGE_CATEGORIES.forEach((category) => {
    if (category.value && category.value !== null) {
      map[category.value.toLowerCase()] = category.fill
    }
  })

  return map
})()

export const COLORS = {
  SEAT_SELECTED: "#1976d2",
  SEAT_FREE: "#1b728d",
  SEAT_RESERVED: "lightgrey",
  SECTION_BG: "#222d3b",
  SUBSECTION_BG: "#e0e0e0",
  LABEL_TEXT: "#ff9800",
}
