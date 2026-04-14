"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AnimatedNavigationTabs } from "@/components/ui/animated-navigation-tabs";
import { HeroSection } from "@/components/ui/hero-section";
import { BentoGrid, type BentoItem } from "@/components/ui/bento-grid";
import { HowItWorks } from "@/components/blocks/how-it-works";
import { PricingCard } from "@/components/ui/pricing-card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Feature108 } from "@/components/blocks/shadcnblocks-com-feature108";
import { ModemAnimatedFooter } from "@/components/ui/modem-animated-footer";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Shield01Icon,
  CheckmarkCircle01Icon,
  Cancel01Icon,
  Menu01Icon,
  BubbleChatIcon,
  CreditCardIcon,
  ChartLineData01Icon,
  Robot01Icon,
  Settings02Icon,
  Mail01Icon,
} from "@hugeicons/core-free-icons";

function useMobileNav() {
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const q = window.matchMedia("(max-width: 768px)");
    const sync = () => setIsMobile(q.matches);
    sync();
    q.addEventListener("change", sync);
    return () => q.removeEventListener("change", sync);
  }, []);
  useEffect(() => {
    if (!isMobile) setOpen(false);
  }, [isMobile]);
  return { open, setOpen, isMobile };
}

/* ─── Mock AI chat card (hero visual) ──────────────────────────────────── */
function ChatCard() {
  return (
    <div style={{
      background: "#ffffff",
      borderRadius: 20,
      border: "1px solid #e4e4e7",
      boxShadow: "0 2px 4px rgba(0,0,0,0.04), 0 16px 48px rgba(0,0,0,0.10)",
      padding: 20,
      maxWidth: 320,
      width: "100%",
      fontFamily: "inherit",
    }}>
      {/* header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, paddingBottom: 14, borderBottom: "1px solid #f0f0f0" }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: "#f4f4f5", border: "1px solid #e4e4e7", display: "flex", alignItems: "center", justifyContent: "center", color: "#09090b" }}>
          <HugeiconsIcon icon={Shield01Icon} size={18} strokeWidth={1.5} aria-hidden />
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#09090b" }}>Aria · Retention Assistant</div>
          <div style={{ fontSize: 11, color: "#059669", fontWeight: 600, display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#059669" }} aria-hidden /> Active
          </div>
        </div>
      </div>
      {/* messages */}
      {[
        { role: "ai",   text: "Before you go — can I ask what's not working for you?" },
        { role: "user", text: "It's just too expensive right now." },
        { role: "ai",   text: "That's fair. I can do 40% off for the next 3 months — that brings it down to $17/mo. No contract, cancel any time." },
      ].map((m, i) => (
        <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start", marginBottom: 8 }}>
          <div style={{
            background: m.role === "user" ? "#3f3f46" : "#ffffff",
            color: m.role === "user" ? "#ffffff" : "#09090b",
            padding: "9px 14px",
            borderRadius: m.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
            fontSize: 12.5,
            lineHeight: 1.6,
            maxWidth: "85%",
            border: m.role === "ai" ? "1px solid #e4e4e7" : "none",
          }}>{m.text}</div>
        </div>
      ))}
      {/* offer button */}
      <button type="button" style={{
        width: "100%",
        marginTop: 10,
        background: "#d1fae5",
        color: "#059669",
        border: "1px solid #a7f3d0",
        borderRadius: 12,
        padding: "12px 14px",
        fontSize: 13,
        fontWeight: 600,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        fontFamily: "inherit",
        letterSpacing: "-0.01em",
      }}>
        <HugeiconsIcon icon={CheckmarkCircle01Icon} size={16} strokeWidth={1.5} aria-hidden />
        Claim 40% off — stay subscribed
      </button>
    </div>
  );
}


/* ═══════════════════════════════════════════════════════════════════════════
   PAGE
═══════════════════════════════════════════════════════════════════════════ */
const NAV_TABS = [
  { id: 1, tile: "Product", href: "#product" },
  { id: 2, tile: "Features", href: "#features" },
  { id: 3, tile: "Pricing", href: "#pricing" },
];

export default function LandingPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { open: navOpen, setOpen: setNavOpen, isMobile } = useMobileNav();

  return (
    <div style={{ fontFamily: "var(--cs-font)", overflowX: "hidden", background: "var(--cs-bg)" }}>

      {/* ── NAV ────────────────────────────────────────────────────────── */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 100,
        background: "#ffffff",
        borderBottom: "1px solid var(--cs-border)",
      }}>
        <div style={{
          padding: "0 5vw",
          height: 60,
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 8, fontWeight: 800, fontSize: 18, letterSpacing: "-0.4px", color: "var(--cs-text)", textDecoration: "none" }}>
            <style>{`
              @keyframes cs-tri-spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
              .cs-nav-logo-tri { animation: cs-tri-spin 2.4s cubic-bezier(0.37, 0, 0.63, 1) infinite; }
            `}</style>
            <svg className="cs-nav-logo-tri" width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden>
              <polygon points="14,2 26,24 2,24" fill="none" stroke="#e4e4e7" strokeWidth="2.5" strokeLinejoin="round" />
              <polygon points="14,2 26,24 2,24" fill="none" stroke="#09090b" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" strokeDasharray="24 60" strokeDashoffset="0" />
            </svg>
            <span style={{ color: "var(--cs-accent)" }}>ChurnQ</span>
          </Link>
          <div className="lnd-desktop items-center" style={{ gap: 0 }}>
            <div style={{ "--primary": "240 6% 10%", "--muted-foreground": "240 4% 46%" } as React.CSSProperties}>
              <AnimatedNavigationTabs items={NAV_TABS} activeHref={pathname} />
            </div>
            <Link href="/sign-in" style={{ fontSize: 13, fontWeight: 500, color: "var(--cs-text-secondary)", padding: "10px 12px", borderRadius: 8, textDecoration: "none" }}>Log in</Link>
            <Link href="/sign-up" style={{
              fontSize: 13, fontWeight: 600, color: "#fff",
              background: "var(--cs-accent)",
              padding: "8px 16px", borderRadius: 99, textDecoration: "none",
              marginLeft: 8,
              boxShadow: "0 1px 4px rgba(0,0,0,0.18)",
            }}>Get started free</Link>
          </div>
          <button
            type="button"
            className="lnd-mobile-toggle"
            aria-expanded={navOpen}
            aria-label={navOpen ? "Close menu" : "Open menu"}
            onClick={() => setNavOpen(!navOpen)}
          >
            {navOpen ? <HugeiconsIcon icon={Cancel01Icon} size={20} strokeWidth={1.5} /> : <HugeiconsIcon icon={Menu01Icon} size={20} strokeWidth={1.5} />}
          </button>
        </div>
        <div className="lnd-mobile-panel" data-open={isMobile && navOpen ? "true" : "false"}>
          <Link href="#product" className="lnd-link" onClick={() => setNavOpen(false)}>Product</Link>
          <Link href="#features" className="lnd-link" onClick={() => setNavOpen(false)}>Features</Link>
          <Link href="#pricing" className="lnd-link" onClick={() => setNavOpen(false)}>Pricing</Link>
          <Link href="/sign-in" className="lnd-link" onClick={() => setNavOpen(false)}>Log in</Link>
          <Link href="/sign-up" style={{
            fontSize: 13, fontWeight: 600, color: "#fff",
            background: "var(--cs-accent)",
            padding: "12px 16px", borderRadius: 10, textDecoration: "none", textAlign: "center",
          }} onClick={() => setNavOpen(false)}>Get started free</Link>
        </div>
      </nav>

      {/* ── HERO ────────────────────────────────────────────────────────── */}
      <HeroSection
        badge={{
          text: "Built for SaaS founders",
        }}
        title="Most subscribers who cancel would have stayed."
        description="ChurnQ talks to them the moment they click cancel, figures out what's wrong, and makes the right offer. It also chases failed payments and flags at-risk accounts before they leave. One script tag to install, no monthly fee."
        actions={[
          { text: "Get started free", href: "/sign-up", variant: "default" },
        ]}
      >
        <ChatCard />
      </HeroSection>

      {/* ── BASELINE METRICS ─────────────────────────────────────────────── */}
      <section style={{ background: "var(--cs-surface)", borderBottom: "1px solid var(--cs-border)" }}>
        <div className="lnd-shell" style={{ padding: "56px 0" }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: 0,
          }}>
            {[
              { n: "40%", l: "Fewer cancellations", sub: "across typical cohorts" },
              { n: "$2.4k", l: "MRR kept per month", sub: "founder-reported average" },
              { n: "5 min", l: "Setup to first save", sub: "median time to go live" },
              { n: "15%", l: "Of revenue we save you", sub: "nothing if we save nothing" },
            ].map((row, i) => (
              <div key={row.n} style={{
                padding: "0 28px",
                borderLeft: i > 0 ? "1px solid var(--cs-border)" : undefined,
              }}>
                <div style={{ fontSize: 32, fontWeight: 800, color: "var(--cs-text)", letterSpacing: "-0.04em", lineHeight: 1 }}>{row.n}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--cs-text-secondary)", marginTop: 8, lineHeight: 1.5 }}>{row.l}</div>
                <div style={{ fontSize: 11, color: "var(--cs-text-muted)", marginTop: 4 }}>{row.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>



{/* ── PRODUCT FEATURES (tabbed) ───────────────────────────────────── */}
      <div id="product" style={{ scrollMarginTop: 72 }}>
        <Feature108
          heading="Four things that stop revenue from walking out the door."
          description="Cancel flows, payment recovery, churn prediction, and cancellation insights — all connected, all in one dashboard."
          tabs={[
            {
              value: "cancel",
              icon: <HugeiconsIcon icon={BubbleChatIcon} size={16} strokeWidth={1.5} className="shrink-0" />,
              label: "Cancel flows",
              content: {
                badge: "AI conversation",
                title: "When someone clicks cancel, ChurnQ talks to them.",
                description: "Instead of a form that rubber-stamps the cancellation, your subscriber gets a short conversation. The AI asks what's wrong, listens to the answer, and makes a relevant offer — a discount, a pause, a plan change, or just a clean exit if that's what they need.",
                bullets: [
                  "Adapts the offer based on the reason: price, missing features, not using it, switching to a competitor.",
                  "You control what offers are on the table, how deep discounts can go, and what tone it uses.",
                  "Every conversation is logged so you can see exactly what was said and what worked.",
                ],
                stat: "40%+",
                statLabel: "Of cancel attempts turn into saves in typical cohorts",
                buttonText: "See how it works",
                buttonHref: "#features",
              },
            },
            {
              value: "payments",
              icon: <HugeiconsIcon icon={CreditCardIcon} size={16} strokeWidth={1.5} className="shrink-0" />,
              label: "Payment recovery",
              content: {
                badge: "Failed payment handling",
                title: "A lot of churn is just a card that failed.",
                description: "When a payment fails, most tools send the same generic email to everyone. ChurnQ writes the message based on why it failed — expired card, insufficient funds, bank block — and retries at the right time. Most people just forgot to update their card.",
                bullets: [
                  "Different messages for different failure reasons, not one blast that reads like spam.",
                  "Retry timing you can tune to match how your billing processor behaves.",
                  "Recovered payments show up next to your voluntary saves so you see the full picture.",
                ],
                stat: "35%",
                statLabel: "Of involuntary churn recovered in early cohorts",
                buttonText: "See how it works",
                buttonHref: "#features",
              },
            },
            {
              value: "prediction",
              icon: <HugeiconsIcon icon={ChartLineData01Icon} size={16} strokeWidth={1.5} className="shrink-0" />,
              label: "Churn prediction",
              content: {
                badge: "Daily risk scores",
                title: "Know who's about to leave before they do.",
                description: "Every day, ChurnQ scores your subscribers based on how they're behaving — logins dropping off, usage declining, payment issues piling up. The ones most likely to cancel float to the top so you can reach out before they've made up their mind.",
                bullets: [
                  "Scores update daily from signals in your existing data, no extra tracking needed.",
                  "Focus your outreach on the accounts where a conversation would actually change something.",
                  "At-risk alerts sit alongside your saves and recovery data — one place, not three tools.",
                ],
                stat: "Days earlier",
                statLabel: "Catch at-risk accounts before they reach the cancel button",
                buttonText: "See how it works",
                buttonHref: "#features",
              },
            },
            {
              value: "feedback",
              icon: <HugeiconsIcon icon={Robot01Icon} size={16} strokeWidth={1.5} className="shrink-0" />,
              label: "Feedback & AI analyst",
              content: {
                badge: "Cancellation insights",
                title: "Find out why people are actually leaving.",
                description: "Every cancel conversation goes into a log. ChurnQ reads them weekly and tells you what themes are coming up — price complaints, missing features, competitor names. You can also just ask it questions and get answers from your real data, not industry averages.",
                bullets: [
                  "Weekly summary of what your churning subscribers actually said, grouped by theme.",
                  "Ask questions in plain English: 'Why do annual subscribers cancel at month 11?'",
                  "Useful for product decisions, not just retention — these are your most honest customers.",
                ],
                stat: "3×",
                statLabel: "Faster from feedback signal to product decision (team-reported)",
                buttonText: "See how it works",
                buttonHref: "#features",
              },
            },
          ]}
        />
      </div>

      {/* ── HOW IT WORKS ────────────────────────────────────────────────── */}
      <HowItWorks />

      {/* ── FEATURES ────────────────────────────────────────────────────── */}
      <section id="features" style={{ background: "var(--cs-bg)", padding: "96px 0", borderTop: "1px solid var(--cs-border)", scrollMarginTop: 72 }}>
        <div className="lnd-shell">
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div style={{ display: "inline-block", background: "#f4f4f5", color: "#18181b", fontSize: 12, fontWeight: 600, padding: "6px 14px", borderRadius: 99, marginBottom: 14, letterSpacing: "0.02em", border: "1px solid #e4e4e7" }}>Features</div>
            <h2 style={{ fontSize: "clamp(26px, 3.5vw, 36px)", fontWeight: 700, color: "var(--cs-text)", margin: 0, letterSpacing: "-0.03em" }}>
              What's inside
            </h2>
            <p style={{ fontSize: 15, color: "var(--cs-text-secondary)", margin: "14px auto 0", maxWidth: 520, lineHeight: 1.6 }}>
              Everything talks to each other. A save in the cancel flow, a recovered payment, a risk score — they all feed the same dashboard.
            </p>
          </div>

          <BentoGrid
            items={([
              {
                title: "Cancel flow agent",
                meta: "41% saves last month",
                description: "A real conversation, not a form. The AI reads what the subscriber says and responds to it.",
                colSpan: 2,
                hasPersistentHover: true,
                tags: ["AI conversation", "Instant"],
                cta: "See it live →",
                visual: (
                  <div style={{ background: "#f8fafc", border: "1px solid #e4e4e7", borderRadius: 12, padding: 14, fontSize: 12 }}>
                    <div style={{ fontSize: 10, fontWeight: 600, color: "#94a3b8", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.06em" }}>Live session · 2 min ago</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      <div style={{ alignSelf: "flex-start", background: "#fff", border: "1px solid #e4e4e7", borderRadius: "12px 12px 12px 3px", padding: "7px 11px", maxWidth: "85%", color: "#18181b", lineHeight: 1.5 }}>Before you go — what's not working for you?</div>
                      <div style={{ alignSelf: "flex-end", background: "#18181b", borderRadius: "12px 12px 3px 12px", padding: "7px 11px", maxWidth: "85%", color: "#fff", lineHeight: 1.5 }}>It's too expensive right now.</div>
                      <div style={{ alignSelf: "flex-start", background: "#fff", border: "1px solid #e4e4e7", borderRadius: "12px 12px 12px 3px", padding: "7px 11px", maxWidth: "85%", color: "#18181b", lineHeight: 1.5 }}>I can do 40% off for 3 months — brings it to $17/mo. No contract.</div>
                    </div>
                    <div style={{ marginTop: 10, background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 8, padding: "8px 12px", fontSize: 11, fontWeight: 600, color: "#166534" }}>
                      Offer accepted — subscriber stayed
                    </div>
                  </div>
                ),
              },
              {
                title: "Payment recovery",
                meta: "35% of failed cards recovered",
                description: "Writes the message based on why the card failed, then retries at the right time.",
                tags: ["Failed cards", "Smart retry"],
                visual: (
                  <div style={{ background: "#f8fafc", border: "1px solid #e4e4e7", borderRadius: 12, padding: 14 }}>
                    <div style={{ fontSize: 26, fontWeight: 800, color: "#18181b", letterSpacing: "-0.03em", lineHeight: 1 }}>$1,840</div>
                    <div style={{ fontSize: 12, color: "#64748b", marginTop: 4, marginBottom: 12 }}>recovered from failed cards · last 30 days</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      {[
                        { label: "Expired card", count: 6, pct: 50 },
                        { label: "Bank block", count: 4, pct: 33 },
                        { label: "Insufficient funds", count: 2, pct: 17 },
                      ].map(r => (
                        <div key={r.label} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11 }}>
                          <div style={{ width: 90, color: "#52525b", flexShrink: 0 }}>{r.label}</div>
                          <div style={{ flex: 1, height: 4, background: "#e4e4e7", borderRadius: 99 }}>
                            <div style={{ width: `${r.pct}%`, height: "100%", background: "#18181b", borderRadius: 99 }} />
                          </div>
                          <div style={{ color: "#94a3b8", width: 14, textAlign: "right" }}>{r.count}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ),
              },
              {
                title: "Churn prediction",
                meta: "Updated daily",
                description: "Scores every subscriber daily. The ones most likely to cancel rise to the top.",
                tags: ["Risk scores", "Early warning"],
                visual: (
                  <div style={{ background: "#f8fafc", border: "1px solid #e4e4e7", borderRadius: 12, padding: 14 }}>
                    <div style={{ fontSize: 10, fontWeight: 600, color: "#94a3b8", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.06em" }}>At-risk today · 17 subscribers</div>
                    {[
                      { id: "acme_corp", score: 91, label: "High" },
                      { id: "user_4821", score: 84, label: "High" },
                      { id: "studio_inc", score: 67, label: "Med" },
                    ].map(s => (
                      <div key={s.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #f0f0f0", fontSize: 12 }}>
                        <span style={{ color: "#18181b", fontFamily: "monospace" }}>{s.id}</span>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <span style={{ color: s.label === "High" ? "#dc2626" : "#d97706", fontWeight: 600, fontSize: 11 }}>{s.label}</span>
                          <span style={{ color: "#94a3b8", fontSize: 11 }}>{s.score}</span>
                        </div>
                      </div>
                    ))}
                    <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 8 }}>+14 more flagged this week</div>
                  </div>
                ),
              },
              {
                title: "Weekly cancellation digest",
                meta: "In your inbox every Monday",
                description: "Reads all your cancel transcripts and tells you what themes are coming up — no manual tagging, no spreadsheets.",
                colSpan: 2,
                tags: ["Themes", "Inbox"],
                visual: (
                  <div style={{ background: "#f8fafc", border: "1px solid #e4e4e7", borderRadius: 12, padding: 14 }}>
                    <div style={{ fontSize: 10, fontWeight: 600, color: "#94a3b8", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.06em" }}>Week of Apr 7 · 23 cancellations</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                      {[
                        { theme: "Price too high", count: 9, pct: 39 },
                        { theme: "Missing features", count: 6, pct: 26 },
                        { theme: "Not using it enough", count: 5, pct: 22 },
                        { theme: "Switched to competitor", count: 3, pct: 13 },
                      ].map(t => (
                        <div key={t.theme} style={{ background: "#fff", border: "1px solid #e4e4e7", borderRadius: 8, padding: "8px 10px" }}>
                          <div style={{ fontSize: 12, fontWeight: 600, color: "#18181b" }}>{t.count} <span style={{ fontWeight: 400, color: "#64748b" }}>({t.pct}%)</span></div>
                          <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>{t.theme}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ),
              },
              {
                title: "Ask your data",
                meta: "Plain English answers",
                description: "Type a question and get an answer from your actual transcripts — not a benchmark, not a guess.",
                colSpan: 2,
                tags: ["Your data", "AI analyst"],
                visual: (
                  <div style={{ background: "#f8fafc", border: "1px solid #e4e4e7", borderRadius: 12, padding: 14 }}>
                    <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 6, fontStyle: "italic" }}>Why do annual subscribers cancel at month 9?</div>
                    <div style={{ fontSize: 12, color: "#18181b", lineHeight: 1.7, background: "#fff", border: "1px solid #e4e4e7", borderRadius: 8, padding: "10px 12px" }}>
                      Of 14 annual cancellations at month 9, <strong>8 mentioned the reporting features</strong> — specifically the lack of CSV export. 4 cited budget cuts after a company restructure. The remaining 2 named a competitor by name.
                    </div>
                    <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 8 }}>Based on 14 transcripts · Apr 2025 cohort</div>
                  </div>
                ),
              },
              {
                title: "You control the rules",
                meta: "Fully configurable",
                description: "Set which offers are available, how deep discounts go, which segments see what, and what tone the AI uses. It should feel like your product, not a bolt-on.",
                icon: <HugeiconsIcon icon={Settings02Icon} size={16} strokeWidth={1.5} style={{ color: "#18181b" }} />,
                status: "Config",
                tags: ["Guardrails", "Segments"],
              },
            ] as BentoItem[])}
          />
        </div>
      </section>

      {/* ── PRICING ─────────────────────────────────────────────────────── */}
      <section id="pricing" style={{ background: "#fff", padding: "96px 0", borderTop: "1px solid var(--cs-border)", scrollMarginTop: 72 }}>
        <div className="lnd-shell" style={{ maxWidth: 900 }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <div style={{ display: "inline-block", background: "#f4f4f5", color: "#18181b", fontSize: 12, fontWeight: 600, padding: "6px 14px", borderRadius: 99, marginBottom: 14, letterSpacing: "0.02em", border: "1px solid #e4e4e7" }}>Pricing</div>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 800, color: "#09090b", margin: "0 0 12px", letterSpacing: "-0.03em" }}>
              No monthly fee. Ever.
            </h2>
            <p style={{ color: "#64748b", fontSize: 16, margin: 0 }}>We charge 15% of the revenue we actually save you. If we save nothing, you pay nothing.</p>
          </div>

          <PricingCard
            title="Performance pricing"
            description="Every feature is included. We only make money when you keep a subscriber you would have lost."
            price={15}
            priceSuffix="%"
            priceSubtitle="of the revenue we save you"
            features={[
              {
                title: "What you get",
                items: [
                  "AI cancel flow conversations, unlimited",
                  "Failed payment recovery emails",
                  "Daily churn risk scores",
                  "Weekly cancellation digest",
                  "AI analyst — ask questions about your data",
                  "Full dashboard and session history",
                ],
              },
              {
                title: "How we charge",
                items: [
                  "15% of MRR we recover for you",
                  "No save, no charge",
                  "No monthly subscription",
                  "No setup fee",
                ],
              },
            ]}
            buttonText="Get started free"
            onButtonClick={() => router.push("/sign-up")}
          />

          <p style={{ textAlign: "center", marginTop: 24, fontSize: 13, color: "#64748b" }}>
            Processing a lot of volume?{" "}
            <a href="mailto:hello@churnq.com" style={{ color: "#18181b", fontWeight: 600, textDecoration: "none" }}>Get in touch and we'll work something out.</a>
          </p>
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────────────────────────── */}
      <section id="faq" style={{ background: "#fff", padding: "96px 0", borderTop: "1px solid var(--cs-border)", scrollMarginTop: 72 }}>
        <div className="lnd-shell" style={{ maxWidth: 760 }}>
          <div style={{ textAlign: "center", marginBottom: 52 }}>
            <div style={{ display: "inline-block", background: "#f4f4f5", color: "#18181b", fontSize: 12, fontWeight: 600, padding: "6px 14px", borderRadius: 99, marginBottom: 14, letterSpacing: "0.02em", border: "1px solid #e4e4e7" }}>FAQ</div>
            <h2 style={{ fontSize: "clamp(26px, 4vw, 38px)", fontWeight: 800, color: "#09090b", margin: "0 0 12px", letterSpacing: "-0.03em" }}>
              Common questions
            </h2>
            <p style={{ color: "#64748b", fontSize: 16, margin: 0 }}>
              Things people usually ask before signing up.
            </p>
          </div>

          <Accordion type="single" collapsible className="w-full" defaultValue="q1">
            {[
              {
                id: "q1",
                q: "How is ChurnQ different from Churnkey?",
                a: "Mainly the pricing model. Churnkey charges a flat monthly fee whether it saves anyone or not — you're paying regardless of results. ChurnQ only charges when we actually keep a subscriber: 15% of what we save, nothing if we don't. The other difference is the cancel flow itself. Churnkey uses configurable forms and templates. ChurnQ has a live AI conversation that reads what the subscriber says and responds to it — it's not a decision tree.",
              },
              {
                id: "q2",
                q: "Is there a monthly fee?",
                a: "No. No monthly fee, no setup fee, no subscription. We only charge a 15% cut of the MRR we recover for you. If a subscriber cancels anyway, we get nothing from that interaction.",
              },
              {
                id: "q3",
                q: "What's the best cancel flow tool for SaaS?",
                a: "Honestly, the one that costs you nothing when it doesn't work. Most tools charge you a flat fee and hope you don't notice the save rate. With ChurnQ, if we're not saving subscribers, we're not making money — so we have a real reason to make it work. That said, the right tool depends on your product. We're a good fit for subscription SaaS where a 5-minute setup matters and you want performance pricing.",
              },
              {
                id: "q4",
                q: "How is a live AI conversation better than a form?",
                a: "A form shows the same options to everyone. An AI conversation responds to what the subscriber actually says. If they say 'it's too expensive', the AI can offer a discount. If they say 'I'm not using it enough', it might suggest a pause. The response fits the reason, which is why save rates are higher than with static flows.",
              },
              {
                id: "q5",
                q: "Which billing platforms does it work with?",
                a: "Stripe right now. You connect your Stripe account during setup, drop the script tag into your product, and ChurnQ handles the rest. Paddle support is on the roadmap.",
              },
              {
                id: "q6",
                q: "How long before I see results?",
                a: "Usually within the first day someone tries to cancel. The AI doesn't need a warm-up period — it works from the first conversation. Save rates tend to settle into a steady range after the first couple of weeks once it's seen enough of your subscribers.",
              },
              {
                id: "q7",
                q: "What if someone still cancels anyway?",
                a: "You don't pay anything. No save means no fee. We don't charge for the attempt, only for the result.",
              },
              {
                id: "q8",
                q: "Can I switch from another tool easily?",
                a: "Yes. Remove your current cancel-flow script, add ours. No data migration, no setup call, no paperwork. Most people are live in under an hour.",
              },
            ].map(({ id, q, a }) => (
              <AccordionItem
                key={id}
                value={id}
                className="rounded-xl border border-[#e4e4e7] bg-white px-5 py-1 mb-3 last:mb-0"
              >
                <AccordionTrigger className="text-[15px] text-[#09090b] font-semibold py-4 hover:no-underline">
                  {q}
                </AccordionTrigger>
                <AccordionContent className="text-[#475569] text-sm leading-relaxed pb-4">
                  {a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <p style={{ textAlign: "center", marginTop: 40, fontSize: 14, color: "#64748b" }}>
            Still have questions?{" "}
            <a href="mailto:hello@churnq.com" style={{ color: "#18181b", fontWeight: 600, textDecoration: "none" }}>
              Email us →
            </a>
          </p>
        </div>
      </section>



      <ModemAnimatedFooter
        brandName="ChurnQ"
        brandDescription="ChurnQ talks to subscribers who try to cancel, chases failed payments, and tells you who's at risk before they leave. No monthly fee — we only charge when we save revenue."
        socialLinks={[
          {
            icon: <HugeiconsIcon icon={Mail01Icon} size={20} strokeWidth={1.5} />,
            href: "mailto:hello@churnq.com",
            label: "Email ChurnQ",
          },
        ]}
        navLinks={[
          { href: "#product", label: "Overview" },
          { href: "#features", label: "Features" },
          { href: "#pricing", label: "Pricing" },
          { href: "mailto:hello@churnq.com", label: "Contact" },
          { href: "/privacy", label: "Privacy" },
          { href: "/cookie-policy", label: "Cookies" },
          { href: "/terms", label: "Terms" },
        ]}
        brandIcon={
          <svg width="48" height="48" viewBox="0 0 512 512" fill="none" aria-hidden>
            <line x1="68" y1="400" x2="256" y2="88" stroke="#d4d4d8" strokeWidth="28" strokeLinecap="round"/>
            <line x1="68" y1="400" x2="444" y2="400" stroke="#d4d4d8" strokeWidth="28" strokeLinecap="round"/>
            <line x1="256" y1="88" x2="444" y2="400" stroke="#18181b" strokeWidth="28" strokeLinecap="round"/>
          </svg>
        }
      />
    </div>
  );
}
