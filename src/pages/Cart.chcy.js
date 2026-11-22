// API Reference: https://www.wix.com/velo/reference/api-overview/introduction
import wixLocationFrontend from "wix-location-frontend";
import wixWindowFrontend from "wix-window-frontend";
import { showPaymentProblemPopupIfNeeded } from "public/payU-payment-result";

$w.onReady(function () {
    // After a failed or canceled PayU payment the buyer lands here with ?payuPayment=...
    showPaymentProblemPopupIfNeeded({
        query: wixLocationFrontend.query,
        removeQueryParameters: (names) => wixLocationFrontend.queryParams.remove(names),
        openLightbox: (name, context) => wixWindowFrontend.openLightbox(name, context),
    });
});
