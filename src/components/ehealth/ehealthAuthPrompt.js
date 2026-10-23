// Lets non-React code (ehealthHelper) ask the app to show the PIN + SMS dialog.
let handler = null;

export function registerAuthPrompt(fn) {
  handler = fn;
  return () => {
    if (handler === fn) handler = null;
  };
}

export function requestAuthorization(purpose) {
  if (!handler) {
    return Promise.reject(new Error("Brak okna autoryzacji. Odśwież stronę i spróbuj ponownie."));
  }
  return handler(purpose);
}
