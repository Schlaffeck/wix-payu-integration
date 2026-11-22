import { extensions } from "@wix/custom-extensions";

// Wix eCommerce Checkout page, slot `checkout:top`.
// https://dev.wix.com/docs/build-apps/develop-your-app/extensions/site-extensions/site-plugins/supported-wix-app-pages/wix-e-commerce/wix-e-commerce-checkout-page
const CHECKOUT_TOP_SLOT_ID = "210b7bf5-8532-4f42-9f5f-00204534b403";

export default extensions.sitePlugin({
  id: "e3e4a01b-fd62-4883-a423-a8cc1421348d",
  name: "payment-problem",
  marketData: {
    name: "Payment Problem Popup",
    description: "Shows a popup on checkout after a failed or canceled payment.",
    logoUrl: "{{BASE_URL}}/payment-problem-logo.svg",
  },
  placementsSlotIds: [CHECKOUT_TOP_SLOT_ID],
  installation: { autoAdd: true },
  tagName: "payment-problem",
  element: "./extensions/site/plugins/payment-problem/payment-problem.tsx",
  settings: "./extensions/site/plugins/payment-problem/payment-problem.panel.tsx",
});
