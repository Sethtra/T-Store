import type { ColorAngle, PhoneOS, PhoneSpecs, ProductColor } from "../types/product";

export type SpecGroupKey = keyof PhoneSpecs;

export interface SpecField {
  key: string;
  label: string;
  type: "text" | "number" | "os" | "bool";
  unit?: string;
  placeholder?: string;
}

export interface SpecGroup {
  key: SpecGroupKey;
  label: string;
  label_kh: string;
  /** Free text first, then typed fields shown beside it in the admin form */
  fields: SpecField[];
}

const text = (placeholder: string): SpecField => ({ key: "text", label: "Details", type: "text", placeholder });

/** The 12 phone spec groups, in the order shoppers read them. Mirrors SPEC_SCHEMA in AdminProductController. */
export const PHONE_SPEC_GROUPS: SpecGroup[] = [
  {
    key: "display",
    label: "Display",
    label_kh: "អេក្រង់",
    fields: [
      text('6.83" AMOLED, 1.5K, HDR10+'),
      { key: "size_in", label: "Size", type: "number", unit: "in", placeholder: "6.83" },
      { key: "refresh_hz", label: "Refresh", type: "number", unit: "Hz", placeholder: "165" },
    ],
  },
  { key: "chipset", label: "Chipset", label_kh: "បន្ទះឈីប", fields: [text("Snapdragon 8 Elite (3 nm)")] },
  {
    key: "rear_camera",
    label: "Rear camera",
    label_kh: "កាមេរ៉ាក្រោយ",
    fields: [text("50MP main (OIS), 50MP telephoto 3x, 8MP ultrawide")],
  },
  { key: "front_camera", label: "Front camera", label_kh: "កាមេរ៉ាមុខ", fields: [text("32MP")] },
  {
    key: "battery",
    label: "Battery",
    label_kh: "ថ្ម",
    fields: [text("Silicon-carbon"), { key: "mah", label: "Capacity", type: "number", unit: "mAh", placeholder: "7400" }],
  },
  { key: "build", label: "Build", label_kh: "សម្ភារៈ", fields: [text("Aluminium frame, glass back, IP68")] },
  {
    key: "software",
    label: "Software",
    label_kh: "ប្រព័ន្ធប្រតិបត្តិការ",
    fields: [{ key: "os", label: "OS", type: "os" }, text("Android 16, OxygenOS 16")],
  },
  {
    key: "brightness",
    label: "Brightness",
    label_kh: "ពន្លឺ",
    fields: [text("1800 nits (HBM)"), { key: "nits", label: "Peak", type: "number", unit: "nits", placeholder: "3000" }],
  },
  { key: "memory", label: "Memory", label_kh: "អង្គចងចាំ", fields: [text("12GB/256GB, 16GB/512GB, UFS 4.1")] },
  {
    key: "charging",
    label: "Charging",
    label_kh: "ការសាកថ្ម",
    fields: [text("80W wired, no wireless"), { key: "watts", label: "Wired", type: "number", unit: "W", placeholder: "80" }],
  },
  {
    key: "size_weight",
    label: "Size & weight",
    label_kh: "ទំហំ និងទម្ងន់",
    fields: [text("163.4 × 76.0 × 8.1 mm"), { key: "weight_g", label: "Weight", type: "number", unit: "g", placeholder: "218" }],
  },
  {
    key: "connectivity",
    label: "Connectivity",
    label_kh: "ការតភ្ជាប់",
    fields: [
      { key: "five_g", label: "5G", type: "bool" },
      { key: "nfc", label: "NFC", type: "bool" },
      { key: "esim", label: "eSIM", type: "bool" },
      { key: "wifi7", label: "Wi-Fi 7", type: "bool" },
      text("Bluetooth 5.4, USB-C 3.2"),
    ],
  },
];

export const OS_OPTIONS: PhoneOS[] = ["Android", "iOS", "HarmonyOS", "Other"];

export const COLOR_ANGLES: { key: ColorAngle; label: string; label_kh: string }[] = [
  { key: "front", label: "Front", label_kh: "មុខ" },
  { key: "rear", label: "Rear", label_kh: "ក្រោយ" },
  { key: "left", label: "Left", label_kh: "ឆ្វេង" },
  { key: "right", label: "Right", label_kh: "ស្តាំ" },
  { key: "top", label: "Top", label_kh: "លើ" },
  { key: "bottom", label: "Bottom", label_kh: "ក្រោម" },
];

const num = (n: number) => (Number.isInteger(n) ? String(n) : String(+n.toFixed(2)));

/**
 * What a group shows on the product page: the typed values as short facts,
 * then the free text. Empty groups return null and are hidden.
 */
export const specGroupValue = (specs: PhoneSpecs | null | undefined, key: SpecGroupKey): { facts: string[]; text?: string } | null => {
  const g = (specs?.[key] ?? {}) as Record<string, unknown>;
  const facts: string[] = [];
  const n = (k: string) => (typeof g[k] === "number" ? (g[k] as number) : undefined);

  switch (key) {
    case "display":
      if (n("size_in")) facts.push(`${num(n("size_in")!)}"`);
      if (n("refresh_hz")) facts.push(`${num(n("refresh_hz")!)}Hz`);
      break;
    case "battery":
      if (n("mah")) facts.push(`${num(n("mah")!)} mAh`);
      break;
    case "software":
      if (typeof g.os === "string") facts.push(g.os);
      break;
    case "brightness":
      if (n("nits")) facts.push(`${num(n("nits")!)} nits`);
      break;
    case "charging":
      if (n("watts")) facts.push(`${num(n("watts")!)}W`);
      break;
    case "size_weight":
      if (n("weight_g")) facts.push(`${num(n("weight_g")!)} g`);
      break;
    case "connectivity":
      if (g.five_g) facts.push("5G");
      if (g.nfc) facts.push("NFC");
      if (g.esim) facts.push("eSIM");
      if (g.wifi7) facts.push("Wi-Fi 7");
      break;
  }

  const text = typeof g.text === "string" && g.text.trim() ? g.text.trim() : undefined;
  return facts.length || text ? { facts, text } : null;
};

export const hasSpecs = (specs: PhoneSpecs | null | undefined) =>
  PHONE_SPEC_GROUPS.some((group) => specGroupValue(specs, group.key));

/** The headline numbers, from the number boxes in Admin → Phone specifications. */
const headlineList = (specs: PhoneSpecs, isKh: boolean) => {
  const out: { value: string; label: string }[] = [];
  const d = specs.display;
  if (d?.size_in) out.push({ value: `${num(d.size_in)}"`, label: isKh ? "អេក្រង់" : "Display" });
  if (d?.refresh_hz) out.push({ value: `${num(d.refresh_hz)}Hz`, label: isKh ? "អត្រាធ្វើឱ្យស្រស់" : "Refresh" });
  if (specs.battery?.mah) out.push({ value: `${num(specs.battery.mah)}mAh`, label: isKh ? "ថ្ម" : "Battery" });
  if (specs.charging?.watts) out.push({ value: `${num(specs.charging.watts)}W`, label: isKh ? "ការសាកថ្ម" : "Charging" });
  if (specs.brightness?.nits) out.push({ value: `${num(specs.brightness.nits)}`, label: isKh ? "ពន្លឺ (nits)" : "Peak nits" });
  if (specs.size_weight?.weight_g) out.push({ value: `${num(specs.size_weight.weight_g)}g`, label: isKh ? "ទម្ងន់" : "Weight" });
  return out;
};

/** Up to three short specs for the product card. */
export const headlineSpecs = (specs: PhoneSpecs | null | undefined): { value: string; label: string }[] =>
  specs ? headlineList(specs, false).slice(0, 3) : [];

/** Up to four headline numbers for the product page's key-specs strip. */
export const keySpecs = (specs: PhoneSpecs | null | undefined, isKh = false): { value: string; label: string }[] =>
  specs ? headlineList(specs, isKh).slice(0, 4) : [];

/** The first photo a colour has, preferring the front. */
export const colorCover = (color: ProductColor | undefined): string | undefined => {
  if (!color?.images) return undefined;
  for (const { key } of COLOR_ANGLES) {
    const url = color.images[key];
    if (url) return url;
  }
  return undefined;
};
