import { app } from "@wix/custom-extensions";
import paymentProblemPlugin from "./extensions/site/plugins/payment-problem/payment-problem.extension";

export default app().use(paymentProblemPlugin);
