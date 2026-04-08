import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";

function fmt(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 });
}

function fmtDate(d: Date) {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function offerBadge(type: string | null) {
  const map: Record<string, { label: string; color: string; bg: string }> = {
    discount:  { label: "Discount",   color: "#0369a1", bg: "#e0f2fe" },
    pause:     { label: "Pause",      color: "#7c3aed", bg: "#f5f3ff" },
    extension: { label: "Extension",  color: "#059669", bg: "#ecfdf5" },
    downgrade: { label: "Downgrade",  color: "#d97706", bg: "#fffbeb" },
    empathy:   { label: "Empathy",    color: "#64748b", bg: "#f1f5f9" },
  };
  const s = map[type ?? ""] ?? { label: type ?? "—", color: "#64748b", bg: "#f1f5f9" };
  return (
    <span style={{
      fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 99,
      color: s.color, background: s.bg, whiteSpace: "nowrap",
    }}>
      {s.label}
    </span>
  );
}

async function getBillingData(tenantId: string) {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [billed, pending, allTime] = await Promise.all([
    // Billed this month
    prisma.saveSession.findMany({
      where: {
        tenantId,
        offerAccepted: true,
        feeBilledAt: { gte: startOfMonth },
      },
      orderBy: { feeBilledAt: "desc" },
      select: {
        sessionId: true, subscriberId: true, subscriberEmail: true,
        offerType: true, savedValue: true, feeCharged: true,
        feeBilledAt: true, stripeChargeId: true, subscriptionMrr: true,
      },
    }),
    // Pending — accepted but not yet billed
    prisma.saveSession.findMany({
      where: {
        tenantId,
        offerAccepted: true,
        feeBilledAt: null,
      },
      orderBy: { createdAt: "desc" },
      select: {
        sessionId: true, subscriberId: true, subscriberEmail: true,
        offerType: true, savedValue: true, feeCharged: true,
        createdAt: true, subscriptionMrr: true,
      },
    }),
    // All-time total
    prisma.saveSession.aggregate({
      where: { tenantId, offerAccepted: true, feeBilledAt: { not: null } },
      _sum: { feeCharged: true },
    }),
  ]);

  const billedThisMonth = billed.reduce((s, r) => s + Number(r.feeCharged ?? 0), 0);
  const pendingTotal = pending.reduce((s, r) => s + Number(r.feeCharged ?? 0), 0);
  const allTimeTotal = Number(allTime._sum.feeCharged ?? 0);

  return { billed, pending, billedThisMonth, pendingTotal, allTimeTotal, startOfMonth };
}

export default async function BillingPage() {
  const { userId, orgId } = auth();
  if (!userId) redirect("/sign-in");

  const tenant = orgId
    ? await prisma.tenant.findUnique({ where: { clerkOrgId: orgId } })
    : await prisma.tenant.findUnique({ where: { clerkUserId: userId! } });

  if (!tenant) redirect("/dashboard");

  const { billed, pending, billedThisMonth, pendingTotal, allTimeTotal, startOfMonth } =
    await getBillingData(tenant.id);

  const stripeConnected = !!tenant.stripeConnectId;

  return (
    <div style={{ width: "100%", maxWidth: 900 }}>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: "#0f172a" }}>Billing</h1>
        <p style={{ color: "#64748b", fontSize: 13, margin: "4px 0 0" }}>
          ChurnShield charges 15% of the MRR retained per successful save. You only pay when it works.
        </p>
      </div>

      {/* Stripe not connected warning */}
      {!stripeConnected && (
        <div style={{
          background: "#fffbeb", border: "1px solid #fcd34d", borderRadius: 12,
          padding: "14px 18px", marginBottom: 24, fontSize: 13, color: "#92400e",
          display: "flex", alignItems: "center", gap: 10,
        }}>
          <span>⚠</span>
          <span>
            <strong>Stripe not connected.</strong> ChurnShield cannot charge fees until you{" "}
            <a href="/dashboard/connections" style={{ color: "#92400e", fontWeight: 600 }}>connect your Stripe account →</a>
          </span>
        </div>
      )}

      {/* Summary cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 32 }}>
        {[
          {
            label: `Charged this month`,
            sub: `Since ${startOfMonth.toLocaleDateString("en-US", { month: "long", day: "numeric" })}`,
            value: fmt(billedThisMonth),
            color: "#0f172a",
          },
          {
            label: "Pending",
            sub: "Accepted saves awaiting invoice.paid",
            value: fmt(pendingTotal),
            color: pendingTotal > 0 ? "#d97706" : "#0f172a",
          },
          {
            label: "All-time charged",
            sub: "Total fees billed since account created",
            value: fmt(allTimeTotal),
            color: "#0f172a",
          },
        ].map((c) => (
          <div key={c.label} style={{
            background: "#fff", border: "1px solid #e2e8f0",
            borderRadius: 14, padding: "20px 24px",
          }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>
              {c.label}
            </div>
            <div style={{ fontSize: 26, fontWeight: 700, color: c.color, letterSpacing: "-0.02em" }}>
              {c.value}
            </div>
            <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>{c.sub}</div>
          </div>
        ))}
      </div>

      {/* Pending fees */}
      {pending.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
            Pending charges
            <span style={{ fontSize: 11, fontWeight: 600, background: "#fffbeb", color: "#d97706", border: "1px solid #fcd34d", borderRadius: 99, padding: "2px 8px" }}>
              {pending.length}
            </span>
          </div>
          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, overflow: "hidden" }}>
            <div style={{ padding: "10px 20px", background: "#f8fafc", borderBottom: "1px solid #e2e8f0", display: "grid", gridTemplateColumns: "1fr 100px 100px 110px", gap: 12 }}>
              {["Subscriber", "Offer", "MRR saved", "Est. fee"].map(h => (
                <span key={h} style={{ fontSize: 11, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</span>
              ))}
            </div>
            {pending.map((row, i) => (
              <div key={row.sessionId} style={{
                padding: "14px 20px",
                borderBottom: i < pending.length - 1 ? "1px solid #f1f5f9" : "none",
                display: "grid", gridTemplateColumns: "1fr 100px 100px 110px", gap: 12, alignItems: "center",
              }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: "#0f172a" }}>
                    {row.subscriberEmail ?? row.subscriberId}
                  </div>
                  <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>
                    Saved {fmtDate(row.createdAt)} · waiting for payment
                  </div>
                </div>
                <div>{offerBadge(row.offerType)}</div>
                <div style={{ fontSize: 13, fontWeight: 500, color: "#0f172a" }}>
                  {fmt(Number(row.savedValue ?? row.subscriptionMrr))}
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#d97706" }}>
                  {fmt(Number(row.feeCharged ?? 0))}
                </div>
              </div>
            ))}
            <div style={{ padding: "12px 20px", background: "#fffbeb", borderTop: "1px solid #fcd34d", display: "flex", justifyContent: "flex-end", gap: 8, alignItems: "center" }}>
              <span style={{ fontSize: 12, color: "#92400e" }}>Total pending</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: "#92400e" }}>{fmt(pendingTotal)}</span>
            </div>
          </div>
          <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 8 }}>
            Pending fees are charged automatically after the subscriber's next invoice pays in Stripe.
          </p>
        </div>
      )}

      {/* Billed this month */}
      <div>
        <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
          Charged this month
          {billed.length > 0 && (
            <span style={{ fontSize: 11, fontWeight: 600, background: "#ecfdf5", color: "#059669", border: "1px solid #86efac", borderRadius: 99, padding: "2px 8px" }}>
              {billed.length}
            </span>
          )}
        </div>

        {billed.length === 0 ? (
          <div style={{
            background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14,
            padding: "48px 24px", textAlign: "center",
          }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>💳</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#0f172a", marginBottom: 6 }}>No charges yet this month</div>
            <div style={{ fontSize: 13, color: "#64748b" }}>
              Fees appear here as soon as a saved subscriber's invoice pays in Stripe.
            </div>
          </div>
        ) : (
          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, overflow: "hidden" }}>
            <div style={{ padding: "10px 20px", background: "#f8fafc", borderBottom: "1px solid #e2e8f0", display: "grid", gridTemplateColumns: "1fr 100px 100px 120px 130px", gap: 12 }}>
              {["Subscriber", "Offer", "MRR saved", "Fee charged", "Date"].map(h => (
                <span key={h} style={{ fontSize: 11, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</span>
              ))}
            </div>
            {billed.map((row, i) => (
              <div key={row.sessionId} style={{
                padding: "14px 20px",
                borderBottom: i < billed.length - 1 ? "1px solid #f1f5f9" : "none",
                display: "grid", gridTemplateColumns: "1fr 100px 100px 120px 130px", gap: 12, alignItems: "center",
              }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: "#0f172a" }}>
                    {row.subscriberEmail ?? row.subscriberId}
                  </div>
                  {row.stripeChargeId && (
                    <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2, fontFamily: "monospace" }}>
                      {row.stripeChargeId}
                    </div>
                  )}
                </div>
                <div>{offerBadge(row.offerType)}</div>
                <div style={{ fontSize: 13, color: "#0f172a" }}>
                  {fmt(Number(row.savedValue ?? row.subscriptionMrr))}
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#059669" }}>
                  {fmt(Number(row.feeCharged ?? 0))}
                </div>
                <div style={{ fontSize: 12, color: "#64748b" }}>
                  {row.feeBilledAt ? fmtDate(row.feeBilledAt) : "—"}
                </div>
              </div>
            ))}
            <div style={{ padding: "12px 20px", background: "#f0fdf4", borderTop: "1px solid #86efac", display: "flex", justifyContent: "flex-end", gap: 8, alignItems: "center" }}>
              <span style={{ fontSize: 12, color: "#166534" }}>Total charged this month</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: "#166534" }}>{fmt(billedThisMonth)}</span>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
