import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  PAYMENT_STATUS_QUERY_PARAMETER,
  PaymentStatus,
  findPaymentProblem,
  isPaymentProblem,
  messageByPaymentStatus,
  takePaymentProblemFromUrl,
} from "../src/shared/payment-status";

beforeEach(() => {
  vi.spyOn(console, "warn").mockImplementation(() => {});
});

const page = (query: Record<string, unknown>) => ({
  readQuery: vi.fn(async () => query),
  removeQueryParameters: vi.fn(async () => {}),
});

describe("payment-status", () => {
  it("recognizes only known payment problems", () => {
    expect(isPaymentProblem("failed")).toBe(true);
    expect(isPaymentProblem("canceled")).toBe(true);
    expect(isPaymentProblem("completed")).toBe(false);
    expect(isPaymentProblem(undefined)).toBe(false);
  });

  it.each(Object.values(PaymentStatus))("describes %s", (paymentStatus) => {
    const problem = findPaymentProblem({ [PAYMENT_STATUS_QUERY_PARAMETER]: paymentStatus });
    expect(problem).toEqual({
      paymentStatus,
      title: expect.any(String),
      message: messageByPaymentStatus[paymentStatus],
    });
    expect(problem?.message).not.toBe("");
  });

  it.each([[{}], [{ paymentStatus: "hacked" }], [null], [undefined]])("ignores %j", (query) => {
    expect(findPaymentProblem(query as Record<string, unknown>)).toBeNull();
  });

  it("takes the problem from the URL and removes the flag", async () => {
    const url = page({ paymentStatus: "canceled", appSectionParams: "{}" });
    const problem = await takePaymentProblemFromUrl(url);
    expect(problem?.paymentStatus).toBe("canceled");
    expect(url.removeQueryParameters).toHaveBeenCalledWith([PAYMENT_STATUS_QUERY_PARAMETER]);
  });

  it("leaves the URL alone without a payment problem", async () => {
    const url = page({ appSectionParams: "{}" });
    expect(await takePaymentProblemFromUrl(url)).toBeNull();
    expect(url.removeQueryParameters).not.toHaveBeenCalled();
  });

  it("still shows the problem when removing the flag fails", async () => {
    const url = page({ paymentStatus: "failed" });
    url.removeQueryParameters.mockRejectedValueOnce(new Error("not available"));
    expect((await takePaymentProblemFromUrl(url))?.paymentStatus).toBe("failed");
  });
});
