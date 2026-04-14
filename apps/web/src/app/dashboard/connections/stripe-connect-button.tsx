"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  connected: boolean;
}

export function StripeConnectButton({ connected }: Props) {
  const router = useRouter();
  const popupRef = useRef<Window | null>(null);
  const [disconnecting, setDisconnecting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    function onMessage(e: MessageEvent) {
      if (e.origin !== window.location.origin) return;
      if (e.data?.type === "stripe_connected") {
        router.refresh();
      }
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [router]);

  function openPopup() {
    const url = "/api/stripe/connect/start?popup=1";
    const w = 700;
    const h = 700;
    const left = Math.round(window.screenX + (window.outerWidth - w) / 2);
    const top = Math.round(window.screenY + (window.outerHeight - h) / 2);
    const popup = window.open(
      url,
      "stripe_connect",
      `width=${w},height=${h},left=${left},top=${top},resizable=yes,scrollbars=yes`
    );
    popupRef.current = popup;
  }

  async function disconnect() {
    setDisconnecting(true);
    try {
      await fetch("/api/stripe/connect/disconnect", { method: "POST" });
      router.refresh();
    } finally {
      setDisconnecting(false);
      setShowConfirm(false);
    }
  }

  if (!connected) {
    return (
      <button
        onClick={openPopup}
        style={{
          display: "inline-flex", alignItems: "center",
          background: "var(--cs-text, #18181b)", color: "#fff",
          padding: "8px 18px", borderRadius: 8,
          fontSize: 13, fontWeight: 600,
          border: "none", cursor: "pointer",
        }}
      >
        Connect
      </button>
    );
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      {showConfirm ? (
        <>
          <span style={{ fontSize: 12, color: "#64748b" }}>Disconnect Stripe?</span>
          <button
            onClick={disconnect}
            disabled={disconnecting}
            style={{
              fontSize: 12, fontWeight: 600, color: "#dc2626",
              background: "#fef2f2", border: "1px solid #fecaca",
              borderRadius: 6, padding: "5px 12px", cursor: "pointer",
            }}
          >
            {disconnecting ? "Disconnecting…" : "Yes, disconnect"}
          </button>
          <button
            onClick={() => setShowConfirm(false)}
            style={{
              fontSize: 12, fontWeight: 500, color: "#64748b",
              background: "none", border: "none", cursor: "pointer", padding: 0,
            }}
          >
            Cancel
          </button>
        </>
      ) : (
        <>
          <button
            onClick={openPopup}
            style={{
              fontSize: 12, color: "var(--cs-text-muted, #71717a)",
              background: "none", border: "none", cursor: "pointer",
              fontWeight: 500, padding: 0,
            }}
          >
            Reconnect →
          </button>
          <span style={{ color: "#e2e8f0" }}>|</span>
          <button
            onClick={() => setShowConfirm(true)}
            style={{
              fontSize: 12, color: "#dc2626",
              background: "none", border: "none", cursor: "pointer",
              fontWeight: 500, padding: 0,
            }}
          >
            Disconnect
          </button>
        </>
      )}
    </div>
  );
}
