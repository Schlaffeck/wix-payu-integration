// API Reference: https://www.wix.com/velo/reference/api-overview/introduction
import wixLocationFrontend from "wix-location-frontend";
import wixWindowFrontend from "wix-window-frontend";
import { showPaymentProblemPopupIfNeeded } from "public/payment-status";

$w.onReady(function () {
    // After a failed or canceled payment the buyer comes back here with ?paymentStatus=...
    // The order is still in checkout, so they can pick another payment method.
    showPaymentProblemPopupIfNeeded({
        query: wixLocationFrontend.query,
        removeQueryParameters: (names) => wixLocationFrontend.queryParams.remove(names),
        openLightbox: (name, context) => wixWindowFrontend.openLightbox(name, context),
    });
});
