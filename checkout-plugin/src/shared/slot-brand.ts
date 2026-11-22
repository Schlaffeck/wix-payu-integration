// Checkout passes its theme to slot plugins as `slotBrand`. Without it a plugin
// would render with default colours on a white background.
export type SlotBrand = {
  backgroundColor?: string;
  textColor?: string;
  buttonColor?: string;
  buttonTextColor?: string;
  selectionColor?: string;
  cornerRadius?: number | string;
};

const defaultBrand: Required<SlotBrand> = {
  backgroundColor: "#ffffff",
  textColor: "#1f1f1f",
  buttonColor: "#1f1f1f",
  buttonTextColor: "#ffffff",
  selectionColor: "#1f1f1f",
  cornerRadius: 8,
};

// slotBrand may arrive as an object (element property) or JSON (attribute).
export function parseSlotBrand(value: unknown): SlotBrand {
  if (typeof value === "string") {
    try {
      return parseSlotBrand(JSON.parse(value));
    } catch {
      return {};
    }
  }
  return value && typeof value === "object" ? (value as SlotBrand) : {};
}

// CSS custom properties consumed by plugin.module.css.
export function slotBrandStyle(value: unknown): Record<string, string> {
  const brand = { ...defaultBrand, ...stripEmpty(parseSlotBrand(value)) };
  const radius = typeof brand.cornerRadius === "number" ? `${brand.cornerRadius}px` : brand.cornerRadius;
  return {
    "--pp-background": brand.backgroundColor,
    "--pp-text": brand.textColor,
    "--pp-button": brand.buttonColor,
    "--pp-button-text": brand.buttonTextColor,
    "--pp-focus": brand.selectionColor,
    "--pp-radius": radius,
  };
}

function stripEmpty(brand: SlotBrand): SlotBrand {
  return Object.fromEntries(
    Object.entries(brand).filter(([, value]) => value !== undefined && value !== null && value !== ""),
  ) as SlotBrand;
}
