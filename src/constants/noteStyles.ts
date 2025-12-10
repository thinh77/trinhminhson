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
  { bg: "#FFD6E0", name: "Blush" },       // Soft blush
  { bg: "#FFE4B5", name: "Cream" },       // Moccasin cream
  { bg: "#E0F2FE", name: "Ice" },         // Ice blue
  { bg: "#FAF5FF", name: "Lilac" },       // Pale lilac
  { bg: "#ECFDF5", name: "Mint" },        // Fresh mint
  { bg: "#FFF7ED", name: "Apricot" },     // Light apricot
  { bg: "#F0FDFA", name: "Aqua" },        // Aqua mint
  { bg: "#FEF2F2", name: "Coral" },       // Light coral
  { bg: "#E0E7FF", name: "Periwinkle" },  // Periwinkle
  { bg: "#FDF4FF", name: "Orchid" },      // Pale orchid
  { bg: "#FFFBEB", name: "Vanilla" },     // Vanilla
  { bg: "#F5F3FF", name: "Lavender" },    // Light lavender
];

// Text colors
export const textColors: TextColor[] = [
  { color: "#1F2937", name: "Dark" },     // Gray 800
  { color: "#7C2D12", name: "Brown" },    // Orange 900
  { color: "#1E3A8A", name: "Navy" },     // Blue 900
  { color: "#14532D", name: "Forest" },   // Green 900
  { color: "#581C87", name: "Purple" },   // Purple 900
  { color: "#9F1239", name: "Wine" },     // Rose 900
  { color: "#000000", name: "Black" },    // Pure black
  { color: "#374151", name: "Slate" },    // Gray 700
  { color: "#92400E", name: "Amber" },    // Amber 800
  { color: "#065F46", name: "Emerald" },  // Emerald 800
  { color: "#1E40AF", name: "Indigo" },   // Indigo 800
  { color: "#BE123C", name: "Crimson" },  // Rose 700
  { color: "#78350F", name: "Coffee" },   // Orange 900
  { color: "#064E3B", name: "Teal" },     // Emerald 900
  { color: "#4C1D95", name: "Violet" },   // Violet 900
  { color: "#991B1B", name: "Maroon" },   // Red 800
];

// Font families
export const fontFamilies: FontFamily[] = [
  { value: "'Work Sans', sans-serif", name: "Work Sans" },
  { value: "'Outfit', sans-serif", name: "Outfit" },
  { value: "'Inter', sans-serif", name: "Inter" },
  { value: "'Roboto', sans-serif", name: "Roboto" },
  { value: "'Source Sans 3', sans-serif", name: "Source Sans" },
  { value: "'Lexend', sans-serif", name: "Lexend" },
  { value: "'Be Vietnam Pro', sans-serif", name: "Be Vietnam" },
  { value: "'Noto Sans', sans-serif", name: "Noto Sans" },
  { value: "'Newsreader', serif", name: "Newsreader" },
  { value: "'Crimson Pro', serif", name: "Crimson Pro" },
  { value: "Georgia, serif", name: "Georgia" },
  { value: "serif", name: "Serif" },
  { value: "'Courier New', monospace", name: "Courier" },
  { value: "'Fira Code', monospace", name: "Fira Code" },
  { value: "monospace", name: "Mono" },
  { value: "'Dancing Script', cursive", name: "Dancing Script" },
  { value: "'Pacifico', cursive", name: "Pacifico" },
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
