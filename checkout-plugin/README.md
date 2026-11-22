# Checkout plugin: payment problem popup

A small private Wix app with one **site plugin** for the Wix eCommerce Checkout
page, slot `checkout:top` (`210b7bf5-8532-4f42-9f5f-00204534b403`).

Wix Checkout page code can't be changed, so the site's page code can't show a
popup there. After a failed or canceled payment, the site backend
(`src/backend/payU/payU-buyer-return.js`) sends the buyer back to checkout with
`?paymentStatus=failed|canceled`. This plugin removes that parameter and shows
a popup that asks the buyer to try again or choose another payment method. It
renders nothing on a normal checkout visit.

Built with the **new Wix CLI** (`@wix/custom-extensions`, `wix.config.mjs`).
The legacy CLI for Apps (`@wix/cli-app`) is deprecated and reaches end of life
on 2027-02-28.

## Layout

```
checkout-plugin/
├── public/payment-problem-logo.svg           # plugin explorer logo
├── src/
│   ├── extensions.ts                         # registers the extensions
│   ├── extensions/site/plugins/payment-problem/
│   │   ├── payment-problem.extension.ts      # plugin config: slot, tag name, files
│   │   ├── payment-problem.tsx               # custom element (no React on the live site)
│   │   └── payment-problem.panel.tsx         # editor settings panel (nothing to set)
│   └── shared/
│       ├── payment-status.ts                 # status → message (copy of the site's)
│       ├── page-url.ts                       # @wix/site-location, browser URL fallback
│       └── slot-brand.ts                     # checkout theme → CSS variables
├── tests/                                    # Vitest (jsdom for the element)
└── wix.config.mjs                            # app ID etc. (placeholders)
```

`src/shared/payment-status.ts` copies the parameter name, statuses and messages
from the site's `src/public/payment-status.js`, because the app can't import
site code. The site's test `tests/public/payment-status-sync.test.js` fails if
the two copies drift apart.

## Behaviour

- Reads the query with `location.query()` from `@wix/site-location`. If that
  isn't available in the plugin, it falls back to `window.location.search`.
- Removes `paymentStatus` with `queryParams.remove()`, falling back to
  `history.replaceState`, so a refresh doesn't show the popup again.
- Renders the dialog into `<body>` (`position: fixed`) so the slot can't clip
  it. It's an `alertdialog` with the focus on the close button, and it closes
  with Escape or a click on the backdrop. Page scroll is locked while it's open.
- Colours and corner radius come from the checkout's `slotBrand` prop, which
  arrives as an object or a JSON attribute.

## Setup (needs your Wix account; do it once)

Requires Node 24.22.1 or later (see `.nvmrc`).

1. **Create the app and get its IDs.** In an empty scratch folder outside this
   repo, run `npm create @wix/new@latest app` and choose *Create a new Wix
   app*. From the `wix.config.mjs` it generates, copy `appId`, `namespace` and
   `codeIdentifier` into `checkout-plugin/wix.config.mjs`. Keep
   `projectId: "checkout-plugin"`, or use the generated one. Delete the scratch
   folder afterwards.
2. Install, log in and pull the env:
   ```bash
   cd checkout-plugin
   npm install
   npx wix login
   npx wix env pull        # writes .env.local (gitignored) with WIX_CLIENT_ID
   ```
3. Run `npm run dev` (`wix app dev`). Pick a **development site** that has Wix
   Stores or eCommerce, install the app when the browser asks, and open the
   editor link.

## Spike: check on a real checkout

The checks below aren't covered by the Wix docs and need a real site:

1. In the editor, open the **Checkout** page. The plugin should be added to
   the top slot automatically (`autoAdd: true`). If it isn't, click the
   **Plugins** icon, then **+ Add**, and choose *Payment Problem Popup*.
2. Publish or preview the dev site. Add a product to the cart, go to checkout,
   and add `paymentStatus=failed` to the checkout URL's query.
3. Check that:
   - the popup shows the "failed" message;
   - the parameter disappears from the address bar;
   - a refresh doesn't show the popup again;
   - the popup isn't clipped and uses the checkout colours;
   - it works at phone width.
4. Repeat with `paymentStatus=canceled`.
5. Watch the browser console for `[payment-problem]` warnings. A warning means
   a fallback was used (for example `location.query()` isn't available in
   plugins), and the browser URL was used instead.

## Release and install on the live site

```bash
npm run build                       # wix app build
npm run release                     # wix app release (choose a version type)
```

Install the released version on the live site with the app's install link
from the Wix Dev Center (*Distribute* / *Test your app*). Check that the plugin
is in the checkout's top slot, then publish the site. Then run the full PayU
sandbox check (cancel a payment and fail a payment) on the live checkout.

## Tests

```bash
npm test          # vitest
npm run typecheck # tsc --noEmit
```
