import type { ColorAngle, ProductColor } from "../../../types/product";
import { colorHex } from "../../../utils/attributes";

/** A colour being edited: kept photo URLs plus newly picked files per angle. */
export interface ColorDraft {
  key: string;
  id?: number;
  name: string;
  name_kh: string;
  hex: string;
  images: Partial<Record<ColorAngle, string | null>>;
  files: Partial<Record<ColorAngle, File>>;
}

export const toColorDrafts = (colors: ProductColor[] | undefined): ColorDraft[] =>
  (colors ?? []).map((c) => ({
    key: `c${c.id}`,
    id: c.id,
    name: c.name,
    name_kh: c.name_kh ?? "",
    hex: c.hex ?? "",
    images: { ...(c.images ?? {}) },
    files: {},
  }));

/** Writes the colour list into the product FormData: JSON meta + color_images[i][angle] files. */
export const appendColors = (data: FormData, drafts: ColorDraft[]) => {
  data.append(
    "colors",
    JSON.stringify(
      drafts.map((d) => {
        const fallback = colorHex(d.name || "grey");
        return {
          id: d.id,
          name: d.name.trim(),
          name_kh: d.name_kh.trim() || null,
          hex: d.hex || (/^#[0-9a-f]{6}$/i.test(fallback) ? fallback : null),
          images: d.images,
        };
      }),
    ),
  );
  drafts.forEach((d, i) => {
    for (const [angle, file] of Object.entries(d.files)) {
      if (file) data.append(`color_images[${i}][${angle}]`, file);
    }
  });
};
