# Plan: payment problem popup on Wix Checkout (site plugin)

Wix Checkout page code can't be modified, so the popup shown after a failed or
canceled payment (`?paymentStatus=failed|canceled`) must come from a **site
plugin** placed in a Checkout **slot**.

## Findings from the Wix docs

- Site plugins are **app extensions**, so they're built with the Wix CLI for Apps
  (a custom element hosted by Wix), as a self-hosted custom element, or with
  Wix Blocks (not supported in the Harmony editor). This site project (Wix CLI
  for Sites: `src/pages`, `src/backend`) can't hold one. The plugin needs its own
  small app project, installed only on this site with the preview "Install App"
  link or a release's direct install URL. Nothing has to go on the App Market.
- Checkout slots, declared with `placementsSlotIds`:

  | Slot | ID |
  |---|---|
  | `checkout:top` | `210b7bf5-8532-4f42-9f5f-00204534b403` |
  | `checkout:header` | `bb058d1f-b70f-4df9-9da0-0523322a38a1` |
  | `checkout:steps:before` | `16cf4440-fa01-47ff-973e-051bb91c25d9` |
  | `checkout:summary:before` | `969d874f-bdba-4429-a626-ff801d712c6a` |

  Legacy format: app ID `1380b703-ce81-ff05-f115-39571d94dfcd`, widget ID
  `14fd5970-8072-c276-1246-058b79e70c1a`, slot ID set to the `checkout:...` name.
- Plugin props: `checkoutId`, `stepId`, `checkoutUpdatedDate`, `slotBrand`
  (theme colours and corner radius), `onRefreshCheckout()`. A custom element also
  gets them as kebab-case attributes (`checkout-id`). Plugins must use
  `slotBrand`, or they render on a white background.
- **Not confirmed:**
  - Whether the SDK `location` module (`query()`, `queryParams.remove()`) works
    inside a plugin custom element.
  - Whether `window.openLightbox()` can be called from a plugin. The safer
    choice is a popup drawn by the plugin itself (fixed-position overlay).
- The docs list no slots for the Cart page or Thank You page, only for the Side
  Cart. It's unclear whether `src/pages/Cart.chcy.js` runs on the live site.
- CLI flow: `wix generate` (choose **Site Plugin**, pick a slot),
  `wix app dev`, `wix app build`, `wix app preview`, `wix app release`. Needs
  Node 24.22.1 or later. A plugin is placed by a dashboard page calling
  `addSitePlugin(pluginId, { placement })`, or by hand in the editor (Plugins
  panel, **+ Add**).

## Steps

1. **Spike (about half a day).** Generate a throwaway plugin in `checkout:top`
   and install it on a test site. It should log the page URL from the
   `location` module and the props, and show a fixed-position test overlay.
   This settles the two unconfirmed points.
2. **App project.** Create `checkout-plugin/` (its own `package.json`, kept
   out of the site's `src/` sync) or a separate repo, and register a private
   app in the Wix dev center.
3. **Shared status logic.** The app can't import `public/payment-status.js`,
   so copy the provider-neutral parts (parameter name, `failed`/`canceled`,
   messages, `isPaymentProblem`) into the app, with a comment in both files
   saying they must stay in sync. The backend redirect
   (`payU-buyer-return.js`) stays as it is.
4. **Plugin** `<payment-problem-plugin>` in `checkout:top`:
   - On load, read `paymentStatus` from the URL. If it's not a payment
     problem, render nothing.
   - Remove the parameter so a refresh doesn't show the popup again (use the
     `location` module, or `history.replaceState` if that doesn't work in a
     plugin).
   - Show a modal with the message, styled from `slotBrand`, with a close
     button, Escape key support and focus trapping.
   - If a fixed-position overlay is clipped, fall back to an inline alert
     banner at the top of checkout.
5. **Tests.** Vitest unit tests for the pure logic (status to message,
   should-show), as in `tests/public/payment-status.test.js`. Plus a Playwright
   smoke test on the preview site using a checkout URL with
   `?paymentStatus=failed`.
6. **Placement.** Place the plugin once by hand in the editor (enough for one
   site), or add a minimal dashboard page calling `addSitePlugin` for
   `checkout:top`.
7. **Release and install.** Run `wix app build` and `wix app release`, install
   the app on the production site with the direct install URL, place the
   plugin, and publish the site.
8. **Clean up.**
   - Remove `src/pages/Checkout.pbfhv.js`.
   - Keep the Cart page fallback only if it's confirmed to run. Otherwise send
     the backend fallback for a missing `errorUrl` to checkout, or use the
     Side Cart slots.
   - Delete the "Payment Problem" lightbox once nothing uses it.
   - Update the README section on the payment problem popup.
9. **End-to-end check** in the PayU sandbox:
   - A canceled or failed payment shows the popup on checkout.
   - The order is kept and another payment method can be chosen.
   - A refresh doesn't show the popup again.
   - It works on mobile too.

## Sources (dev.wix.com)

- Checkout page slots: `docs/build-apps/develop-your-app/extensions/site-extensions/site-plugins/supported-wix-app-pages/wix-e-commerce/wix-e-commerce-checkout-page`
- Side cart slots: `.../supported-wix-app-pages/wix-e-commerce/wix-e-commerce-side-cart`
- About slots: `.../site-plugins/supported-wix-app-pages/about-slots`
- About site plugin extensions: `.../site-extensions/site-plugins/about-site-plugin-extensions`
- Add a site plugin with the Wix CLI: `docs/build-apps/develop-your-app/develop-an-app-with-the-cli/supported-extensions/site/site-plugins/add-a-site-plugin-extension-with-the-wix-cli`
- Dashboard page for a site plugin: `.../site-plugins/build-a-dashboard-page-to-manage-your-site-plugin`
- Build and deploy: `docs/build-apps/develop-your-app/develop-an-app-with-the-cli/project-development/build-and-deploy`
- SDK frontend modules: `docs/sdk/frontend-modules/location`, `docs/sdk/frontend-modules/window`
