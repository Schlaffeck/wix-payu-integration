// Site plugin for the Wix eCommerce Checkout page (slot `checkout:top`).
//
// After a failed or canceled payment the site backend sends the buyer back to
// checkout with ?paymentStatus=failed|canceled. This element removes the flag
// and shows a popup. Otherwise it renders nothing.
//
// Checkout sets plugin props both as element properties and as kebab-case
// attributes (checkoutId / checkout-id, slotBrand / slot-brand, ...).
import { takePaymentProblemFromUrl, type PaymentProblem } from "../../../../shared/payment-status";
import { pageUrl } from "../../../../shared/page-url";
import { slotBrandStyle } from "../../../../shared/slot-brand";

const CLOSE_BUTTON_LABEL = "Zamknij";
const STYLE_ELEMENT_ID = "payment-problem-style";
const TITLE_ID = "payment-problem-title";
const MESSAGE_ID = "payment-problem-message";

// Global styles: the dialog is rendered into <body>, outside the slot, so the
// slot's layout can't clip the overlay.
const STYLES = `
.payment-problem-backdrop {
  position: fixed;
  inset: 0;
  z-index: 2147483000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background: rgba(0, 0, 0, 0.45);
  box-sizing: border-box;
}
.payment-problem-dialog {
  width: 100%;
  max-width: 420px;
  padding: 24px;
  border-radius: var(--pp-radius);
  background: var(--pp-background);
  color: var(--pp-text);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.25);
  box-sizing: border-box;
  font: inherit;
}
.payment-problem-title {
  margin: 0 0 8px;
  font-size: 20px;
  line-height: 1.3;
  font-weight: 600;
  color: inherit;
}
.payment-problem-message {
  margin: 0 0 20px;
  font-size: 16px;
  line-height: 1.5;
  color: inherit;
}
.payment-problem-button {
  display: block;
  width: 100%;
  min-height: 44px;
  padding: 10px 16px;
  border: 0;
  border-radius: var(--pp-radius);
  background: var(--pp-button);
  color: var(--pp-button-text);
  font: inherit;
  font-size: 16px;
  cursor: pointer;
}
.payment-problem-button:focus-visible {
  outline: 2px solid var(--pp-focus);
  outline-offset: 2px;
}
`;

class PaymentProblemElement extends HTMLElement {
  static get observedAttributes() {
    return ["slot-brand"];
  }

  private brand: unknown = undefined;
  private started = false;
  private backdrop: HTMLDivElement | null = null;
  private previousFocus: HTMLElement | null = null;
  private previousBodyOverflow = "";

  set slotBrand(brand: unknown) {
    this.brand = brand;
    this.applyBrand();
  }

  get slotBrand(): unknown {
    return this.brand;
  }

  attributeChangedCallback(name: string, _oldValue: string | null, newValue: string | null) {
    if (name === "slot-brand") {
      this.slotBrand = newValue;
    }
  }

  connectedCallback() {
    if (this.started) {
      return;
    }
    this.started = true;
    takePaymentProblemFromUrl(pageUrl)
      .then((paymentProblem) => paymentProblem && this.open(paymentProblem))
      .catch((error) => console.warn("[payment-problem] could not read the page URL", error));
  }

  get isOpen(): boolean {
    return this.backdrop !== null;
  }

  open(paymentProblem: PaymentProblem) {
    if (this.backdrop) {
      return;
    }
    addStylesOnce();

    const backdrop = document.createElement("div");
    backdrop.className = "payment-problem-backdrop";
    backdrop.addEventListener("click", (event) => event.target === backdrop && this.close());

    const dialog = document.createElement("div");
    dialog.className = "payment-problem-dialog";
    dialog.setAttribute("role", "alertdialog");
    dialog.setAttribute("aria-modal", "true");
    dialog.setAttribute("aria-labelledby", TITLE_ID);
    dialog.setAttribute("aria-describedby", MESSAGE_ID);
    dialog.dataset.paymentStatus = paymentProblem.paymentStatus;

    const title = document.createElement("h2");
    title.id = TITLE_ID;
    title.className = "payment-problem-title";
    title.textContent = paymentProblem.title;

    const message = document.createElement("p");
    message.id = MESSAGE_ID;
    message.className = "payment-problem-message";
    message.textContent = paymentProblem.message;

    const closeButton = document.createElement("button");
    closeButton.type = "button";
    closeButton.className = "payment-problem-button";
    closeButton.textContent = CLOSE_BUTTON_LABEL;
    closeButton.addEventListener("click", () => this.close());

    dialog.append(title, message, closeButton);
    backdrop.append(dialog);
    this.backdrop = backdrop;
    this.applyBrand();

    this.previousFocus = document.activeElement as HTMLElement | null;
    this.previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.body.append(backdrop);
    document.addEventListener("keydown", this.onKeyDown);
    closeButton.focus();
  }

  close() {
    if (!this.backdrop) {
      return;
    }
    document.removeEventListener("keydown", this.onKeyDown);
    this.backdrop.remove();
    this.backdrop = null;
    document.body.style.overflow = this.previousBodyOverflow;
    this.previousFocus?.focus?.();
    this.previousFocus = null;
  }

  private onKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      this.close();
    } else if (event.key === "Tab") {
      // The close button is the only control: keep focus inside the dialog.
      event.preventDefault();
      this.backdrop?.querySelector<HTMLButtonElement>("button")?.focus();
    }
  };

  private applyBrand() {
    if (!this.backdrop) {
      return;
    }
    for (const [name, value] of Object.entries(slotBrandStyle(this.brand))) {
      this.backdrop.style.setProperty(name, value);
    }
  }
}

function addStylesOnce() {
  if (document.getElementById(STYLE_ELEMENT_ID)) {
    return;
  }
  const style = document.createElement("style");
  style.id = STYLE_ELEMENT_ID;
  style.textContent = STYLES;
  document.head.append(style);
}

export default PaymentProblemElement;
