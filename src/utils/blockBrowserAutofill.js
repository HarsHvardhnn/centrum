/**
 * Staff type patients' addresses and personal data into this app; the browser must not offer to save or
 * fill them ("Zapisać adres?"). Chrome ignores autocomplete="off" for addresses but leaves a field alone
 * when the value is one it does not know. The sign-in screens keep their normal behaviour.
 */
const SIGN_IN_PATHS = ["/logowanie", "/zapomniane-haslo", "/login"];
const SKIP_TYPES = new Set(["password", "hidden", "file", "checkbox", "radio", "button", "submit", "reset", "range", "color"]);
const FIELDS = "input, textarea, select, form";
const VALUE = "cm7-no-autofill";

function mark(element) {
  if (!element.matches?.(FIELDS)) return;
  if (SKIP_TYPES.has(String(element.getAttribute("type") || "").toLowerCase())) return;
  if (SIGN_IN_PATHS.includes(window.location.pathname.replace(/\/+$/, ""))) return;
  const value = element.tagName === "FORM" ? "off" : VALUE;
  if (element.getAttribute("autocomplete") === value) return;
  element.setAttribute("autocomplete", value);
  element.setAttribute("data-lpignore", "true");
  element.setAttribute("data-1p-ignore", "true");
}

export default function blockBrowserAutofill(root = document) {
  const sweep = (node) => {
    if (node.nodeType !== 1) return;
    mark(node);
    node.querySelectorAll(FIELDS).forEach(mark);
  };
  sweep(root.documentElement);
  new MutationObserver((changes) => {
    changes.forEach((change) => change.addedNodes.forEach(sweep));
  }).observe(root.documentElement, { childList: true, subtree: true });
  // A field that was reused after navigating away from the sign-in screen is caught on focus.
  root.addEventListener("focusin", (event) => mark(event.target), true);
}
