// @ts-nocheck
// Shared by the backend (payuReturn redirect) and page code (cart popup).
// When a PayU payment fails or is canceled, the buyer is sent back to the cart
// with ?payuPayment=failed|canceled, and the cart page shows a popup.

export const PAYMENT_RESULT_QUERY_PARAMETER = "payuPayment";

export const PaymentProblem = Object.freeze({
  FAILED: "failed",
  CANCELED: "canceled",
});

// Name of the lightbox in the Wix Editor.
export const PAYMENT_PROBLEM_LIGHTBOX_NAME = "PayU Payment Problem";

const messageByPaymentProblem = {
  [PaymentProblem.FAILED]:
    "Płatność nie powiodła się. Spróbuj ponownie lub wybierz inną metodę płatności.",
  [PaymentProblem.CANCELED]: "Płatność została anulowana. Możesz spróbować ponownie.",
};

export function isPaymentProblem(value) {
  return Object.values(PaymentProblem).includes(value);
}

export function paymentProblemMessage(paymentProblem) {
  return messageByPaymentProblem[paymentProblem] || "";
}

// Cart page: shows the popup once when the buyer came back from a failed or
// canceled payment. Wix APIs are passed in so this can be tested.
export function showPaymentProblemPopupIfNeeded({ query, removeQueryParameters, openLightbox }) {
  const paymentProblem = query?.[PAYMENT_RESULT_QUERY_PARAMETER];
  if (!isPaymentProblem(paymentProblem)) {
    return false;
  }
  // Remove the flag so a page refresh doesn't show the popup again.
  removeQueryParameters([PAYMENT_RESULT_QUERY_PARAMETER]);
  openLightbox(PAYMENT_PROBLEM_LIGHTBOX_NAME, {
    paymentProblem,
    message: paymentProblemMessage(paymentProblem),
  });
  return true;
}
