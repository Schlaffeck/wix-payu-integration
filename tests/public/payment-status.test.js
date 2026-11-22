import { describe, it, expect, vi } from "vitest";
import {
  PAYMENT_STATUS_QUERY_PARAMETER,
  PAYMENT_PROBLEM_LIGHTBOX_NAME,
  PaymentStatus,
  isPaymentProblem,
  paymentProblemMessage,
  addPaymentStatusToUrl,
  showPaymentProblemPopupIfNeeded,
} from "public/payment-status";

const sitePage = (query) => ({
  query,
  removeQueryParameters: vi.fn(),
  openLightbox: vi.fn(),
});

describe("payment-status", () => {
  it("uses a provider-neutral query parameter", () => {
    expect(PAYMENT_STATUS_QUERY_PARAMETER).toBe("paymentStatus");
  });

  it("recognizes only known payment problems", () => {
    expect(isPaymentProblem("failed")).toBe(true);
    expect(isPaymentProblem("canceled")).toBe(true);
    expect(isPaymentProblem("completed")).toBe(false);
    expect(isPaymentProblem(undefined)).toBe(false);
  });

  it("has a message for each payment problem", () => {
    for (const paymentStatus of Object.values(PaymentStatus)) {
      expect(paymentProblemMessage(paymentStatus)).not.toBe("");
    }
    expect(paymentProblemMessage("other")).toBe("");
  });

  it("adds the payment status to a URL and keeps its parameters", () => {
    expect(addPaymentStatusToUrl("https://shop.example/cart-page", "failed")).toBe(
      "https://shop.example/cart-page?paymentStatus=failed",
    );
    const checkout = 'https://shop.example/checkout?appSectionParams={"checkoutId":"c1"}';
    const url = new URL(addPaymentStatusToUrl(checkout, "canceled"));
    expect(url.searchParams.get("appSectionParams")).toBe('{"checkoutId":"c1"}');
    expect(url.searchParams.get("paymentStatus")).toBe("canceled");
  });

  it("replaces an existing payment status", () => {
    expect(addPaymentStatusToUrl("https://shop.example/?paymentStatus=failed", "canceled")).toBe(
      "https://shop.example/?paymentStatus=canceled",
    );
  });

  it.each(Object.values(PaymentStatus))("opens the popup for %s and clears the flag", (paymentStatus) => {
    const page = sitePage({ [PAYMENT_STATUS_QUERY_PARAMETER]: paymentStatus });
    expect(showPaymentProblemPopupIfNeeded(page)).toBe(true);
    expect(page.removeQueryParameters).toHaveBeenCalledWith([PAYMENT_STATUS_QUERY_PARAMETER]);
    expect(page.openLightbox).toHaveBeenCalledWith(PAYMENT_PROBLEM_LIGHTBOX_NAME, {
      paymentStatus,
      message: paymentProblemMessage(paymentStatus),
    });
  });

  it.each([[{}], [{ [PAYMENT_STATUS_QUERY_PARAMETER]: "hacked" }], [undefined]])(
    "does nothing without a known payment status: %j",
    (query) => {
      const page = sitePage(query);
      expect(showPaymentProblemPopupIfNeeded(page)).toBe(false);
      expect(page.removeQueryParameters).not.toHaveBeenCalled();
      expect(page.openLightbox).not.toHaveBeenCalled();
    },
  );
});
