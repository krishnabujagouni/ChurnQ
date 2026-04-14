"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface HeroAction {
  text: string;
  href: string;
  icon?: React.ReactNode;
  variant?: "default" | "outline" | "secondary" | "ghost" | "link";
}

interface HeroProps {
  badge?: { text: string };
  title: string;
  description: string;
  actions: HeroAction[];
  children?: React.ReactNode;
}

export function HeroSection({ badge, title, description, actions, children }: HeroProps) {
  return (
    <section style={{ background: "#fff", borderBottom: "1px solid var(--cs-border)", padding: "80px 24px 0" }}>
      <div style={{ maxWidth: 1120, margin: "0 auto", display: "flex", flexDirection: "column", alignItems: "center", gap: 24, textAlign: "center" }}>

        {badge && (
          <Badge variant="outline" style={{ fontSize: 12, fontWeight: 600, padding: "4px 12px" }}>
            {badge.text}
          </Badge>
        )}

        <h1 style={{ fontSize: "clamp(2rem, 4.5vw, 3.25rem)", fontWeight: 700, letterSpacing: "-0.035em", lineHeight: 1.1, color: "var(--cs-text)", maxWidth: 780, margin: 0 }}>
          {title}
        </h1>

        <p style={{ fontSize: "clamp(1rem, 1.5vw, 1.125rem)", color: "var(--cs-text-secondary)", maxWidth: 520, lineHeight: 1.6, margin: 0 }}>
          {description}
        </p>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
          {actions.map((action, i) => (
            <Button key={i} variant={action.variant ?? "default"} size="lg" asChild>
              <a href={action.href} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {action.icon}
                {action.text}
              </a>
            </Button>
          ))}
        </div>

        {children && (
          <div style={{ marginTop: 16, width: "100%", display: "flex", justifyContent: "center" }}>
            {children}
          </div>
        )}
      </div>
    </section>
  );
}
