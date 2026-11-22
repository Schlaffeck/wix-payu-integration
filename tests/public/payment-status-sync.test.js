import { describe, it, expect } from "vitest";
import * as site from "public/payment-status";
import * as checkoutPlugin from "../../checkout-plugin/src/shared/payment-status";

// The checkout plugin app can't import site code, so it keeps its own copy.
describe("payment status shared with the checkout plugin", () => {
  it("uses the same query parameter", () => {
    expect(checkoutPlugin.PAYMENT_STATUS_QUERY_PARAMETER).toBe(site.PAYMENT_STATUS_QUERY_PARAMETER);
  });

  it("knows the same statuses and messages", () => {
    expect(checkoutPlugin.PaymentStatus).toEqual(site.PaymentStatus);
    for (const paymentStatus of Object.values(site.PaymentStatus)) {
      expect(checkoutPlugin.messageByPaymentStatus[paymentStatus]).toBe(
        site.paymentProblemMessage(paymentStatus),
      );
    }
  });
});
