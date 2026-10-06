"use client";
import { useEffect, useState } from "react";
import { CONSENT_KEY, installErrorLog, track } from "@/lib/telemetry";

function grant(on: boolean, tries = 0) {
  try {
    const g = (window as unknown as { gtag?: (...a: unknown[]) => void }).gtag;
    if (g) g("consent", "update", { analytics_storage: on ? "granted" : "denied" });
    else if (tries < 20) setTimeout(() => grant(on, tries + 1), 500); // GA snippet loads afterInteractive
  } catch {}
}

export default function ConsentBanner() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    installErrorLog();
    try {
      const v = localStorage.getItem(CONSENT_KEY);
      if (!v) setShow(true);
      else if (v === "accepted") { grant(true); track("page_view", { path: location.pathname }); }
    } catch {}
  }, []);
  if (!show) return null;
  const choose = (ok: boolean) => {
    try { localStorage.setItem(CONSENT_KEY, ok ? "accepted" : "declined"); } catch {}
    grant(ok);
    if (ok) track("page_view", { path: location.pathname });
    setShow(false);
  };
  const btn = { minHeight: 44, minWidth: 88, padding: "0 16px", borderRadius: 10, fontWeight: 600, cursor: "pointer", fontSize: 14 } as const;
  return (
    <div role="dialog" aria-label="Cookie consent" style={{ position: "fixed", left: 12, right: 12, bottom: 12, zIndex: 60, maxWidth: 560, margin: "0 auto", background: "#12141c", color: "#f4f5f8", border: "1px solid rgba(255,255,255,.18)", borderRadius: 14, padding: 14, display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", boxShadow: "0 8px 30px rgba(0,0,0,.4)" }}>
      <p style={{ flex: "1 1 220px", margin: 0, fontSize: 13, lineHeight: 1.45 }}>
        Anonymous analytics only, no ads. Allow usage stats to help improve this site?
      </p>
      <div style={{ display: "flex", gap: 8 }}>
        <button type="button" onClick={() => choose(false)} style={{ ...btn, background: "transparent", color: "#f4f5f8", border: "1px solid rgba(255,255,255,.35)" }}>Decline</button>
        <button type="button" onClick={() => choose(true)} style={{ ...btn, background: "#f4f5f8", color: "#12141c", border: "1px solid #f4f5f8" }}>Accept</button>
      </div>
    </div>
  );
}
