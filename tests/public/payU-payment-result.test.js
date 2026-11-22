import { describe, it, expect, vi } from "vitest";
import {
  PAYMENT_RESULT_QUERY_PARAMETER,
  PAYMENT_PROBLEM_LIGHTBOX_NAME,
  PaymentProblem,
  isPaymentProblem,
  paymentProblemMessage,
  showPaymentProblemPopupIfNeeded,
} from "public/payU-payment-result";

const cartPage = (query) => ({
  query,
  removeQueryParameters: vi.fn(),
  openLightbox: vi.fn(),
});

describe("payU-payment-result", () => {
  it("recognizes only known payment problems", () => {
    expect(isPaymentProblem("failed")).toBe(true);
    expect(isPaymentProblem("canceled")).toBe(true);
    expect(isPaymentProblem("completed")).toBe(false);
    expect(isPaymentProblem(undefined)).toBe(false);
  });

  it("has a message for each payment problem", () => {
    for (const problem of Object.values(PaymentProblem)) {
      expect(paymentProblemMessage(problem)).not.toBe("");
    }
    expect(paymentProblemMessage("other")).toBe("");
  });

  it.each(Object.values(PaymentProblem))("opens the popup for %s and clears the flag", (problem) => {
    const page = cartPage({ [PAYMENT_RESULT_QUERY_PARAMETER]: problem });
    expect(showPaymentProblemPopupIfNeeded(page)).toBe(true);
    expect(page.removeQueryParameters).toHaveBeenCalledWith([PAYMENT_RESULT_QUERY_PARAMETER]);
    expect(page.openLightbox).toHaveBeenCalledWith(PAYMENT_PROBLEM_LIGHTBOX_NAME, {
      paymentProblem: problem,
      message: paymentProblemMessage(problem),
    });
  });

  it.each([[{}], [{ [PAYMENT_RESULT_QUERY_PARAMETER]: "hacked" }], [undefined]])(
    "does nothing without a known flag: %j",
    (query) => {
      const page = cartPage(query);
      expect(showPaymentProblemPopupIfNeeded(page)).toBe(false);
      expect(page.removeQueryParameters).not.toHaveBeenCalled();
      expect(page.openLightbox).not.toHaveBeenCalled();
    },
  );
});
