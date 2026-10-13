/** Product attributes arrive as `{ color: "Black, Green" }`, arrays, or `[]` when empty. */
export type RawAttributes = Record<string, string | string[]> | unknown[] | null | undefined;

/** Values for an attribute, matched case-insensitively ("Color" and "color" both work). */
export const getAttributeValues = (attrs: RawAttributes, name: string): string[] => {
  if (!attrs || Array.isArray(attrs)) return [];
  const key = Object.keys(attrs).find((k) => k.toLowerCase() === name.toLowerCase());
  if (!key) return [];
  const value = attrs[key];
  if (Array.isArray(value)) return value.map((v) => String(v).trim()).filter(Boolean);
  return String(value ?? "")
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
};

const COLOR_HEX: Record<string, string> = {
  black: "#1f2023",
  white: "#f7f7f5",
  grey: "#8a8d91",
  gray: "#8a8d91",
  silver: "#c4c7cc",
  gold: "#c9a54b",
  orange: "#e8772e",
  red: "#d23c3c",
  pink: "#e88aa8",
  purple: "#8a63c9",
  blue: "#3f6fd1",
  navy: "#1f2f55",
  teal: "#2a8c8c",
  green: "#5f9c72",
  "dark green": "#2f4a3a",
  mint: "#b9d4c6",
  brown: "#7a4f32",
  beige: "#ddd0b8",
  yellow: "#e6c13d",
};

/** Best-effort swatch colour for a colour name; unknown names fall back to a neutral grey. */
export const colorHex = (name: string): string => {
  const key = name.trim().toLowerCase();
  if (COLOR_HEX[key]) return COLOR_HEX[key];
  const last = key.split(/\s+/).pop() ?? "";
  return COLOR_HEX[last] ?? (CSS.supports("color", key) ? key : "#b5b7ba");
};
