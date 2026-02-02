// Seat status colors - unified constant
// export const STATUS_COLORS = {
//   ocu: "#0000ff", // ocupado
//   nue: "#00ff00", // nuevo
//   hom: "#ff0000", // hombre
//   muj: "#ff69b4", // mujer
//   adu: "#6B7280", // adulto
//   ado: "#8B5CF6", // adolescente
//   niñ: "#EC4899", // niño
//   por: "#F97316", // porteador
// }

export const STATUS_COLORS = {
  nue: "#2E7D32", // nuevo
  nua: "#CE93D8",
  hom: "#1976D2", // hombre
  muj: "#E91E63", // mujer

  ado: "#F57C00", // adolescente
  niñ: "#00BCD4", // niño
  por: "#7B1FA2", // porteador
}

// export const STATUS_COLORS = {
//   nue: "#81C784", // nuevo
//   hom: "#64B5F6", // hombre
//   muj: "#F06292", // mujer

//   ado: "#FFB74D", // adolescente
//   niñ: "#4DD0E1", // niño
//   por: "#A1887F", // porteador
// }

// Get percentage color based on value
export const getPercentageColor = (percent) => {
  if (percent >= 86) {
    return "#F44336" // Rojo
  } else if (percent >= 57) {
    return "#FF9800" // Naranja
  }
  return "#4CAF50" // Verde
}

// Default stage settings
export const DEFAULT_SETTINGS = {
  SEAT_SIZE: 9,
  SEATS_DISTANCE: 2,
  SUBSECTION_SPACING: 30,
  SECTION_TOP_MARGIN: 0,
  SECTION_BOTTOM_MARGIN: 15,
  SECTION_TOP_PADDING: 32,
  SECTION_SIDE_PADDING: 0,
  SECTION_BOTTOM_PADDING: 0,
}

// Default export for auto-import compatibility
export default {
  STATUS_COLORS,
  getPercentageColor,
  DEFAULT_SETTINGS,
}
