// @ts-nocheck
// Payment status passed to site pages after a payment attempt, independent of
// the payment provider. Shared by the backend (redirect after payment) and page
// code (popup on checkout or cart).
//
// A failed or canceled payment sends the buyer back to checkout with
// ?paymentStatus=failed|canceled, and the page shows a popup.
//
// The checkout plugin app keeps a copy in checkout-plugin/src/shared/payment-status.ts
// (an app can't import site code). Change both; tests/public/payment-status-sync.test.js
// checks they match.

export const PAYMENT_STATUS_QUERY_PARAMETER = "paymentStatus";

export const PaymentStatus = Object.freeze({
  FAILED: "failed",
  CANCELED: "canceled",
});

// Name of the lightbox in the Wix Editor.
export const PAYMENT_PROBLEM_LIGHTBOX_NAME = "Payment Problem";

const messageByPaymentStatus = {
  [PaymentStatus.FAILED]:
    "Płatność nie powiodła się. Spróbuj ponownie lub wybierz inną metodę płatności.",
  [PaymentStatus.CANCELED]:
    "Płatność została anulowana. Możesz spróbować ponownie lub wybrać inną metodę płatności.",
};

export function isPaymentProblem(paymentStatus) {
  return Object.values(PaymentStatus).includes(paymentStatus);
}

export function paymentProblemMessage(paymentStatus) {
  return messageByPaymentStatus[paymentStatus] || "";
}

// Adds ?paymentStatus=... to a URL, keeping its other query parameters.
export function addPaymentStatusToUrl(url, paymentStatus) {
  const urlWithStatus = new URL(url);
  urlWithStatus.searchParams.set(PAYMENT_STATUS_QUERY_PARAMETER, paymentStatus);
  return urlWithStatus.toString();
}

// Page code: shows the popup once when the buyer came back from a failed or
// canceled payment. Wix APIs are passed in so this can be tested.
export function showPaymentProblemPopupIfNeeded({ query, removeQueryParameters, openLightbox }) {
  const paymentStatus = query?.[PAYMENT_STATUS_QUERY_PARAMETER];
  if (!isPaymentProblem(paymentStatus)) {
    return false;
  }
  // Remove the flag so a page refresh doesn't show the popup again.
  removeQueryParameters([PAYMENT_STATUS_QUERY_PARAMETER]);
  openLightbox(PAYMENT_PROBLEM_LIGHTBOX_NAME, {
    paymentStatus,
    message: paymentProblemMessage(paymentStatus),
  });
  return true;
}
