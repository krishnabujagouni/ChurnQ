import { HugeiconsIcon } from "@hugeicons/react";
import {
  SourceCodeIcon,
  BubbleChatSparkIcon,
  Analytics01Icon,
  CheckmarkCircle01Icon,
} from "@hugeicons/core-free-icons";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface Step {
  step: string;
  icon: typeof SourceCodeIcon;
  accentColor: string;
  accentBg: string;
  title: string;
  description: string;
  detail: string;
}

const STEPS: Step[] = [
  {
    step: "01",
    icon: SourceCodeIcon,
    accentColor: "#18181b",
    accentBg: "#f4f4f5",
    title: "Paste in one script tag",
    description:
      "Copy the snippet from your dashboard and drop it into your app. It finds your cancel button automatically — no backend work, no webhook config.",
    detail: "Works with React, Next.js, plain HTML, anything.",
  },
  {
    step: "02",
    icon: BubbleChatSparkIcon,
    accentColor: "#18181b",
    accentBg: "#f4f4f5",
    title: "ChurnQ talks to the subscriber",
    description:
      "When someone clicks cancel, a short AI conversation opens. It listens to their reason and makes a relevant offer — discount, pause, plan change, or a clean exit.",
    detail: "You decide what offers are available and how far they go.",
  },
  {
    step: "03",
    icon: Analytics01Icon,
    accentColor: "#18181b",
    accentBg: "#f4f4f5",
    title: "You see what happened",
    description:
      "Saves, failed payment recoveries, and at-risk subscribers all show up in your dashboard. You see exactly what was said and what worked.",
    detail: "We take 15% of what we save. Nothing if the subscriber cancels anyway.",
  },
];

export function HowItWorks() {
  return (
    <section className="py-24 bg-white border-t border-[#e4e4e7]">
      <div className="lnd-shell">
        {/* header */}
        <div className="flex flex-col items-center gap-3 text-center mb-12">
          <Badge
            variant="outline"
            className="text-xs font-semibold tracking-wide px-3 py-1"
          >
            How it works
          </Badge>
          <h2 className="max-w-lg text-3xl font-bold tracking-tight text-[#09090b] md:text-4xl leading-tight">
            You can be live in about five minutes.
          </h2>
          <p className="text-muted-foreground max-w-md text-base leading-relaxed">
            One script tag, no backend work, no webhook setup. ChurnQ handles everything from there.
          </p>
        </div>

        {/* step cards */}
        <div className="grid gap-6 md:grid-cols-3">
          {STEPS.map((s) => (
            <Card
              key={s.step}
              className="grid grid-rows-[auto_1fr_auto] border-[#e4e4e7] shadow-none"
            >
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between mb-4">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: s.accentBg }}
                  >
                    <HugeiconsIcon
                      icon={s.icon}
                      size={20}
                      strokeWidth={1.5}
                      style={{ color: s.accentColor }}
                    />
                  </div>
                  <span
                    className="text-xs font-bold tracking-widest px-2.5 py-1 rounded-full"
                    style={{
                      color: s.accentColor,
                      background: s.accentBg,
                    }}
                  >
                    {s.step}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-[#09090b] leading-snug">
                  {s.title}
                </h3>
              </CardHeader>

              <CardContent className="pt-0">
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {s.description}
                </p>
              </CardContent>

              <div className="px-6 pb-6">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/60 border border-[#e4e4e7]">
                  <HugeiconsIcon
                    icon={CheckmarkCircle01Icon}
                    size={13}
                    strokeWidth={1.5}
                    style={{ color: "#059669", flexShrink: 0 }}
                  />
                  <span className="text-xs text-muted-foreground">{s.detail}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
