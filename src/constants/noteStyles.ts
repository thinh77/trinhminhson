import type { NoteColor, TextColor, FontFamily, FontWeight, FontSize } from "@/types/note";

// Predefined note colors (pastel sticky note colors)
export const noteColors: NoteColor[] = [
  { bg: "#FEF3C7", name: "Yellow" },      // Warm yellow
  { bg: "#FECACA", name: "Pink" },        // Soft pink
  { bg: "#BBF7D0", name: "Green" },       // Mint green
  { bg: "#BFDBFE", name: "Blue" },        // Sky blue
  { bg: "#DDD6FE", name: "Purple" },      // Lavender
  { bg: "#FED7AA", name: "Orange" },      // Peach
  { bg: "#FBCFE8", name: "Rose" },        // Rose
  { bg: "#A5F3FC", name: "Cyan" },        // Cyan
];

// Text colors
export const textColors: TextColor[] = [
  { color: "#1F2937", name: "Dark" },     // Gray 800
  { color: "#7C2D12", name: "Brown" },    // Orange 900
  { color: "#1E3A8A", name: "Navy" },     // Blue 900
  { color: "#14532D", name: "Forest" },   // Green 900
  { color: "#581C87", name: "Purple" },   // Purple 900
  { color: "#9F1239", name: "Wine" },     // Rose 900
];

// Font families
export const fontFamilies: FontFamily[] = [
  { value: "'Work Sans', sans-serif", name: "Work Sans" },
  { value: "'Outfit', sans-serif", name: "Outfit" },
  { value: "serif", name: "Serif" },
  { value: "monospace", name: "Mono" },
  { value: "cursive", name: "Cursive" },
];

// Font weights
export const fontWeights: FontWeight[] = [
  { value: "300", name: "Light" },
  { value: "400", name: "Normal" },
  { value: "500", name: "Medium" },
  { value: "600", name: "Semi Bold" },
  { value: "700", name: "Bold" },
];

// Font sizes
export const fontSizes: FontSize[] = [
  { value: "12px", name: "XS" },
  { value: "14px", name: "S" },
  { value: "16px", name: "M" },
  { value: "18px", name: "L" },
  { value: "20px", name: "XL" },
];
