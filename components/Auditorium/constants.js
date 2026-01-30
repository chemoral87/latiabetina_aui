// Seat status colors - unified constant
export const STATUS_COLORS = {
  ocu: "#0000ff", // ocupado
  adu: "#6B7280", // adulto
  ado: "#8B5CF6", // adolescente
  niñ: "#EC4899", // niño
  por: "#F97316", // porteador
}

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
  SUBSECTION_PADDING: 30,
  SECTIONS_MARGIN: 10,
  SECTION_TOP_PADDING: 32,
  SECTION_SIDE_PADDING: 10,
  SECTION_BOTTOM_PADDING: 0,
}
