"use client";

import { useState, useEffect } from "react";
import MagicAuthModal from "@/lib/auth/MagicAuthModal";
import { getStoredUser, clearAuth } from "@/lib/auth/useMagicAuth";
import type { AuthUser } from "@/lib/auth/useMagicAuth";
import { SITE_CONFIG } from "@/lib/store";
import { redeemGuestCode } from "@/lib/shared/useGate";

export default function AuthButton() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState("");
  const [redeeming, setRedeeming] = useState(false);

  useEffect(() => {
    setUser(getStoredUser());
  }, []);

  async function handleRedeem() {
    if (!code.trim()) return;
    setRedeeming(true);
    setCodeError("");
    const res = await redeemGuestCode(SITE_CONFIG.site, code.trim());
    setRedeeming(false);
    if (res.ok) {
      window.location.reload();
    } else {
      setCodeError(res.error ?? "Invalid code");
    }
  }

  if (user) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <span style={{ fontSize: "12px", color: "rgba(148,163,184,0.8)" }}>
          {user.email}
        </span>
        <button
          onClick={() => { clearAuth(); setUser(null); }}
          style={{
            fontSize: "11px",
            padding: "4px 10px",
            borderRadius: "6px",
            border: "1px solid rgba(51,65,85,0.5)",
            background: "transparent",
            color: "rgba(148,163,184,0.7)",
            cursor: "pointer",
          }}
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setShowAuth(true)}
        style={{
          fontSize: "12px",
          fontWeight: 600,
          padding: "6px 14px",
          borderRadius: "8px",
          border: `1px solid ${SITE_CONFIG.accentColor}55`,
          background: `${SITE_CONFIG.accentColor}15`,
          color: SITE_CONFIG.accentColor,
          cursor: "pointer",
          transition: "background 150ms",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.background = `${SITE_CONFIG.accentColor}25`;
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.background = `${SITE_CONFIG.accentColor}15`;
        }}
      >
        Sign in free
      </button>
      {!showCodeInput ? (
        <button
          onClick={() => setShowCodeInput(true)}
          style={{
            background: "none",
            border: "none",
            color: "rgba(148,163,184,0.7)",
            fontSize: "11px",
            cursor: "pointer",
            padding: "4px 6px",
            textDecoration: "underline",
          }}
        >
          Have a code?
        </button>
      ) : (
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <input
            value={code}
            onChange={(e) => { setCode(e.target.value); setCodeError(""); }}
            placeholder="Enter code"
            style={{
              width: "110px",
              padding: "6px 8px",
              borderRadius: "6px",
              border: "1px solid rgba(51,65,85,0.5)",
              background: "transparent",
              color: "#fff",
              fontSize: "11px",
            }}
          />
          <button
            onClick={handleRedeem}
            disabled={redeeming || !code.trim()}
            style={{
              fontSize: "11px",
              fontWeight: 600,
              padding: "6px 10px",
              borderRadius: "6px",
              border: "none",
              background: SITE_CONFIG.accentColor,
              color: "#fff",
              cursor: redeeming ? "default" : "pointer",
              opacity: redeeming ? 0.7 : 1,
            }}
          >
            {redeeming ? "…" : "Redeem"}
          </button>
        </div>
      )}
      {codeError && (
        <span style={{ fontSize: "11px", color: "#f87171" }}>{codeError}</span>
      )}
      <MagicAuthModal
        isOpen={showAuth}
        onClose={() => setShowAuth(false)}
        onSuccess={(u) => { setUser(u); setShowAuth(false); }}
        site={SITE_CONFIG.site}
        accentColor={SITE_CONFIG.accentColor}
      />
    </>
  );
}
