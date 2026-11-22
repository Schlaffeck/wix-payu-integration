// API Reference: https://www.wix.com/velo/reference/api-overview/introduction
import wixLocationFrontend from "wix-location-frontend";
import wixWindowFrontend from "wix-window-frontend";
import { showPaymentProblemPopupIfNeeded } from "public/payment-status";

$w.onReady(function () {
    // Fallback landing page after a failed or canceled payment (?paymentStatus=...),
    // used when the checkout page address is not known.
    showPaymentProblemPopupIfNeeded({
        query: wixLocationFrontend.query,
        removeQueryParameters: (names) => wixLocationFrontend.queryParams.remove(names),
        openLightbox: (name, context) => wixWindowFrontend.openLightbox(name, context),
    });
});
