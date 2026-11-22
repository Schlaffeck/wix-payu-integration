// @vitest-environment jsdom
import { describe, it, expect, vi, beforeAll, beforeEach, afterEach } from "vitest";

const wixLocation = vi.hoisted(() => ({
  query: vi.fn(),
  remove: vi.fn(),
}));

vi.mock("@wix/site-location", () => ({
  location: { query: wixLocation.query },
  queryParams: { remove: wixLocation.remove },
}));

import PaymentProblemElement from "../src/extensions/site/plugins/payment-problem/payment-problem";

const TAG = "payment-problem-test";

beforeAll(() => {
  // Wix registers the element under the extension's tagName; do it ourselves here.
  customElements.define(TAG, PaymentProblemElement);
});

beforeEach(() => {
  vi.spyOn(console, "warn").mockImplementation(() => {});
  wixLocation.query.mockResolvedValue({});
  wixLocation.remove.mockResolvedValue(undefined);
  window.history.replaceState(null, "", "/checkout");
});

afterEach(() => {
  document.body.innerHTML = "";
  document.body.style.overflow = "";
});

async function mountPlugin(setup?: (element: PaymentProblemElement) => void) {
  const element = document.createElement(TAG) as PaymentProblemElement;
  setup?.(element);
  document.body.append(element);
  await vi.waitFor(() => expect(wixLocation.query).toHaveBeenCalled());
  await new Promise((resolve) => setTimeout(resolve, 0));
  return element;
}

const dialog = () => document.querySelector<HTMLElement>('[role="alertdialog"]');

describe("payment-problem element", () => {
  it("renders nothing without a payment problem", async () => {
    wixLocation.query.mockResolvedValue({ appSectionParams: "{}" });
    const element = await mountPlugin();
    expect(dialog()).toBeNull();
    expect(element.isOpen).toBe(false);
    expect(wixLocation.remove).not.toHaveBeenCalled();
  });

  it.each([
    ["failed", "Płatność nie powiodła się"],
    ["canceled", "Płatność została anulowana"],
  ])("shows the popup for %s and removes the flag", async (paymentStatus, text) => {
    wixLocation.query.mockResolvedValue({ paymentStatus });
    await mountPlugin();
    expect(dialog()?.dataset.paymentStatus).toBe(paymentStatus);
    expect(dialog()?.textContent).toContain(text);
    expect(wixLocation.remove).toHaveBeenCalledWith(["paymentStatus"]);
    expect(document.activeElement?.textContent).toBe("Zamknij");
    expect(document.body.style.overflow).toBe("hidden");
  });

  it("closes with the button, Escape or a backdrop click", async () => {
    wixLocation.query.mockResolvedValue({ paymentStatus: "failed" });
    const element = await mountPlugin();

    dialog()!.querySelector("button")!.click();
    expect(dialog()).toBeNull();
    expect(document.body.style.overflow).toBe("");

    element.open({ paymentStatus: "failed", title: "t", message: "m" });
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    expect(dialog()).toBeNull();

    element.open({ paymentStatus: "failed", title: "t", message: "m" });
    document.querySelector<HTMLElement>(".payment-problem-backdrop")!.click();
    expect(dialog()).toBeNull();
  });

  it("does not close when clicking inside the dialog", async () => {
    wixLocation.query.mockResolvedValue({ paymentStatus: "failed" });
    await mountPlugin();
    dialog()!.click();
    expect(dialog()).not.toBeNull();
  });

  it("uses the checkout theme from slotBrand, as a property or an attribute", async () => {
    wixLocation.query.mockResolvedValue({ paymentStatus: "canceled" });
    const element = await mountPlugin((plugin) => {
      plugin.slotBrand = { buttonColor: "rgb(1, 2, 3)", cornerRadius: 12 };
    });
    const backdrop = document.querySelector<HTMLElement>(".payment-problem-backdrop")!;
    expect(backdrop.style.getPropertyValue("--pp-button")).toBe("rgb(1, 2, 3)");
    expect(backdrop.style.getPropertyValue("--pp-radius")).toBe("12px");

    element.setAttribute("slot-brand", JSON.stringify({ buttonColor: "rgb(4, 5, 6)" }));
    expect(backdrop.style.getPropertyValue("--pp-button")).toBe("rgb(4, 5, 6)");
  });

  it("falls back to the browser URL when the Wix location API fails", async () => {
    wixLocation.query.mockRejectedValue(new Error("not available"));
    wixLocation.remove.mockRejectedValue(new Error("not available"));
    window.history.replaceState(null, "", "/checkout?checkoutId=c1&paymentStatus=failed");
    await mountPlugin();
    expect(dialog()?.dataset.paymentStatus).toBe("failed");
    expect(window.location.search).toBe("?checkoutId=c1");
  });

  it("escapes the message text", async () => {
    wixLocation.query.mockResolvedValue({});
    const element = await mountPlugin();
    element.open({ paymentStatus: "failed", title: "<b>x</b>", message: "<img src=x onerror=alert(1)>" });
    expect(dialog()!.querySelector("img")).toBeNull();
    expect(dialog()!.textContent).toContain("<img src=x onerror=alert(1)>");
  });
});
