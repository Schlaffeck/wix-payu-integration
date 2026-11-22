// Page URL access for the plugin. Uses the Wix SDK (@wix/site-location) and
// falls back to the browser URL when the SDK isn't available in this context.
import { location, queryParams } from "@wix/site-location";
import type { PageUrl } from "./payment-status";

function queryFromBrowserUrl(): Record<string, string> {
  return Object.fromEntries(new URLSearchParams(window.location.search));
}

function removeFromBrowserUrl(names: string[]): void {
  const url = new URL(window.location.href);
  names.forEach((name) => url.searchParams.delete(name));
  window.history.replaceState(window.history.state, "", url.toString());
}

export const pageUrl: PageUrl = {
  async readQuery() {
    try {
      return (await location.query()) as Record<string, unknown>;
    } catch (error) {
      console.warn("[payment-problem] location.query() failed, using the browser URL", error);
      return queryFromBrowserUrl();
    }
  },
  async removeQueryParameters(names) {
    try {
      await queryParams.remove(names);
    } catch (error) {
      console.warn("[payment-problem] queryParams.remove() failed, using the browser URL", error);
      removeFromBrowserUrl(names);
    }
  },
};
