"use client";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

interface Props {
  connected: boolean;
}

export function StripeConnectButton({ connected }: Props) {
  const router = useRouter();
  const popupRef = useRef<Window | null>(null);

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

  if (connected) {
    return (
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
    );
  }

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
