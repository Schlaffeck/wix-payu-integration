import { describe, it, expect } from "vitest";
import { parseSlotBrand, slotBrandStyle } from "../src/shared/slot-brand";

describe("slot-brand", () => {
  it("reads slotBrand from an object or JSON", () => {
    expect(parseSlotBrand({ textColor: "red" })).toEqual({ textColor: "red" });
    expect(parseSlotBrand('{"textColor":"red"}')).toEqual({ textColor: "red" });
    expect(parseSlotBrand("not json")).toEqual({});
    expect(parseSlotBrand(undefined)).toEqual({});
  });

  it("maps brand values to CSS variables, with defaults", () => {
    const style = slotBrandStyle({ buttonColor: "#123456", cornerRadius: 4, textColor: "" });
    expect(style["--pp-button"]).toBe("#123456");
    expect(style["--pp-radius"]).toBe("4px");
    expect(style["--pp-text"]).toBe("#1f1f1f");
    expect(style["--pp-background"]).toBe("#ffffff");
  });

  it("keeps a CSS length for the corner radius", () => {
    expect(slotBrandStyle({ cornerRadius: "1rem" })["--pp-radius"]).toBe("1rem");
  });
});
