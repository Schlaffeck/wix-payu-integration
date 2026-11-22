// Payment status the site backend adds to the checkout URL after a payment
// attempt (?paymentStatus=failed|canceled), independent of the payment provider.
//
// Keep in sync with src/public/payment-status.js in the site project: the app
// can't import site code. tests/public/payment-status-sync.test.js checks that
// both sides agree.

export const PAYMENT_STATUS_QUERY_PARAMETER = "paymentStatus";

export const PaymentStatus = Object.freeze({
  FAILED: "failed",
  CANCELED: "canceled",
} as const);

export type PaymentProblemStatus = (typeof PaymentStatus)[keyof typeof PaymentStatus];

export type PaymentProblem = {
  paymentStatus: PaymentProblemStatus;
  title: string;
  message: string;
};

export const PAYMENT_PROBLEM_TITLE = "Problem z płatnością";

export const messageByPaymentStatus: Readonly<Record<PaymentProblemStatus, string>> = Object.freeze({
  [PaymentStatus.FAILED]:
    "Płatność nie powiodła się. Spróbuj ponownie lub wybierz inną metodę płatności.",
  [PaymentStatus.CANCELED]:
    "Płatność została anulowana. Możesz spróbować ponownie lub wybrać inną metodę płatności.",
});

export function isPaymentProblem(paymentStatus: unknown): paymentStatus is PaymentProblemStatus {
  return (Object.values(PaymentStatus) as unknown[]).includes(paymentStatus);
}

// Returns the payment problem described by the URL query, or null.
export function findPaymentProblem(query: Record<string, unknown> | null | undefined): PaymentProblem | null {
  const paymentStatus = query?.[PAYMENT_STATUS_QUERY_PARAMETER];
  if (!isPaymentProblem(paymentStatus)) {
    return null;
  }
  return {
    paymentStatus,
    title: PAYMENT_PROBLEM_TITLE,
    message: messageByPaymentStatus[paymentStatus],
  };
}

export type PageUrl = {
  readQuery: () => Promise<Record<string, unknown>> | Record<string, unknown>;
  removeQueryParameters: (names: string[]) => Promise<void> | void;
};

// Reads the payment problem from the page URL and removes the flag, so a page
// refresh doesn't show the popup again. URL access is passed in so this can be
// tested without Wix.
export async function takePaymentProblemFromUrl({ readQuery, removeQueryParameters }: PageUrl): Promise<PaymentProblem | null> {
  const paymentProblem = findPaymentProblem(await readQuery());
  if (!paymentProblem) {
    return null;
  }
  try {
    await removeQueryParameters([PAYMENT_STATUS_QUERY_PARAMETER]);
  } catch (error) {
    // Still show the popup; at worst it shows again after a refresh.
    console.warn("[payment-problem] could not remove the query parameter", error);
  }
  return paymentProblem;
}
