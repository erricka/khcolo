import type { Product } from "./types";

/** Spec value by label (exact or prefix match). */
export function spec(product: Product, ...labels: string[]): string | undefined {
  for (const label of labels) {
    const hit =
      product.specs.find((s) => s.label === label) ??
      product.specs.find((s) => s.label.toLowerCase().startsWith(label.toLowerCase()));
    if (hit) return hit.value;
  }
  return undefined;
}

export type CompareColumn = { label: string; value: (p: Product) => string | undefined; mono?: boolean };

/** Comparison columns per category, chosen from specs every model in it shares. */
export const COMPARE_COLUMNS: Record<string, CompareColumn[]> = {
  "ip-phone": [
    { label: "Type", value: (p) => p.type },
    { label: "SIP accounts", value: (p) => spec(p, "SIP accounts"), mono: true },
    { label: "Network", value: (p) => spec(p, "Network") },
    { label: "PoE", value: (p) => spec(p, "PoE") },
    { label: "Display", value: (p) => spec(p, "Display", "Screen") },
  ],
  "voip-gateway": [
    { label: "Type", value: (p) => p.facet },
    { label: "Ports / channels", value: (p) => spec(p, "Ports", "Channels"), mono: true },
    { label: "Protocols", value: (p) => spec(p, "Protocols", "Protocol", "Transport") },
    { label: "Fax", value: (p) => spec(p, "Fax") },
  ],
  "ip-pbx": [
    { label: "Users", value: (p) => spec(p, "Users"), mono: true },
    { label: "Concurrent calls", value: (p) => spec(p, "Concurrent calls"), mono: true },
    {
      label: "Analog / BRI",
      value: (p) => {
        const combined = spec(p, "Analog / BRI ports");
        if (combined) return combined;
        const fxs = spec(p, "FXS ports");
        const fxo = spec(p, "FXO / BRI ports");
        return [fxs && `FXS ${fxs.toLowerCase()}`, fxo && `FXO/BRI ${fxo.toLowerCase()}`].filter(Boolean).join(" · ");
      },
    },
    { label: "Cellular", value: (p) => spec(p, "Cellular") },
    { label: "E1 / T1", value: (p) => spec(p, "E1") },
  ],
};
