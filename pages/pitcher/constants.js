// constants.js
// All constants for pitcher/index.vue

export const COLORS = [
  // C (Do) and intermediates
  "#FF0000", // C (bright red)
  "#FF4000", // C+
  "#FF8000", // C♯ (orange)
  "#FFB000", // C♯+
  // D (Re)
  "#FFD700", // D (gold)
  "#FFE880", // D+
  "#FFFF00", // D♯ (yellow)
  "#FFFF60", // D♯+
  // E (Mi)
  "#E0FF80", // E
  "#A0FF00", // E+
  // F (Fa)
  "#80FF00", // F (lime)
  "#40FF00", // F+
  "#00FF00", // F♯ (green)
  "#00FF80", // F♯+
  // G (Sol)
  "#00FFC0", // G (aqua)
  "#00FFFF", // G+ (cyan)
  "#00BFFF", // G♯ (sky blue)
  "#0080FF", // G♯+
  // A (La) - Now much brighter!
  "#0060FF", // A (bright blue)
  "#0040FF", // A+
  "#7F5AFF", // A♯ (lighter violet-blue)
  "#A066FF", // A♯+
  // B (Si)
  "#CC00FF", // B (electric purple)
  "#FF00FF", // B+ (magenta)
  "#FF20FF", // Cycle back to red (optional)
]

export const NOTE_SHORT_STRINGS = ["C", "C+", "C♯", "C♯+", "D", "D+", "D♯", "D♯+", "E", "E+", "F", "F+", "F♯", "F♯+", "G", "G+", "G♯", "G♯+", "A", "A+", "A♯", "A♯+", "B", "B+"]

export const NOTE_LATIN_STRINGS = ["Do", "Do+", "Do♯", "Do♯+", "Re", "Re+", "Re♯", "Re♯+", "Mi", "Mi+", "Fa", "Fa+", "Fa♯", "Fa♯+", "Sol", "Sol+", "Sol♯", "Sol♯+", "La", "La+", "La♯", "La♯+", "Si", "Si+"]

export const MAJOR_STEPS = [0, 2, 4, 5, 7, 9, 11]
export const MIN_MIDI = 47
export const TOLERANCE_HZ = 1.95
export const A4_FREQ = 440
export const A4_MIDI = 69
export const TEXT_WIDTH = 40

// Add these missing constants that were defined inline in other files
export const NATURAL_POSITIONS = [0, 0, 1, 1, 2, 3, 3, 4, 4, 5, 5, 6]
export const BASE_LINE_SPACING = 16
export const STAFF_TOP_OFFSET = 60
export const STEM_LENGTH = 40
export const NOTE_X_OFFSET = 65
export const NOTE_X_B_OFFSET = 45 // Changed from noteXbOffset to camelCase
export const SHORT_LINE_HALF_WIDTH = 15
export const CANVAS_BG_COLOR = "#f5f5f5"
export const SIMBOL_MARGIN = 23
export const MARGIN_LINE = 0
export const LINE_BASE = 130
