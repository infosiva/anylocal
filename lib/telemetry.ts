// Consent-gated anonymous usage ping + structured error log. No PII, no IP, no new deps.
export const CONSENT_KEY = "anylocal_consent_v1";

export function track(event: string, props: Record<string, string | number> = {}) {
  try {
    if (localStorage.getItem(CONSENT_KEY) !== "accepted") return;
    navigator.sendBeacon?.("/api/usage", JSON.stringify({ event, ...props, ts: Date.now() }));
  } catch {}
}

/** Server-side structured error line. */
export function logError(scope: string, err: unknown) {
  console.error(JSON.stringify({ level: "error", scope, msg: err instanceof Error ? err.message : String(err), ts: new Date().toISOString() }));
}

/** Client: report uncaught errors (message only, truncated, no URL/user data) to /api/usage. */
export function installErrorLog() {
  const send = (msg: string) => {
    try { navigator.sendBeacon?.("/api/usage", JSON.stringify({ event: "error", msg: msg.slice(0, 200), ts: Date.now() })); } catch {}
  };
  window.addEventListener("error", (e) => send(e.message || "error"));
  window.addEventListener("unhandledrejection", (e) => send(String((e.reason as Error)?.message ?? e.reason ?? "rejection")));
}
