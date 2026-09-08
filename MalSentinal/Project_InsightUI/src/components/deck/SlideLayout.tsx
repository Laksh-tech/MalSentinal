import type { ReactNode } from "react";

export function SlideLayout({
  kicker,
  title,
  index,
  total,
  children,
  accentTitle,
}: {
  kicker?: string;
  title?: string;
  accentTitle?: string;
  index: number;
  total: number;
  children: ReactNode;
}) {
  return (
    <div className="slide-content grid-bg bg-background text-foreground">
      <div className="absolute inset-x-0 top-0 flex items-center justify-between px-20 pt-12">
        <div className="slide-chrome flex items-center gap-4 text-muted-foreground">
          <span className="h-2.5 w-2.5 rounded-full bg-primary" />
          MALSENTINAL · MINOR PROJECT · 2026
        </div>
        <div className="slide-page text-muted-foreground">
          <span className="text-primary">{String(index).padStart(2, "0")}</span> / {String(total).padStart(2, "0")}
        </div>
      </div>

      <div className="flex h-full flex-col px-20 pb-16 pt-28">
        {(kicker || title) && (
          <header className="mb-8">
            {kicker && <div className="slide-kicker mb-5 text-accent">{kicker}</div>}
            {title && (
              <h2 className="slide-title">
                {title} {accentTitle && <span className="text-primary">{accentTitle}</span>}
              </h2>
            )}
          </header>
        )}
        <div className="min-h-0 flex-1">{children}</div>
      </div>

      <div className="absolute inset-x-0 bottom-0 h-px bg-border" />
    </div>
  );
}

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl border bg-card p-8 transition-transform duration-200 hover:-translate-y-1 ${className}`}
    >
      {children}
    </div>
  );
}

export function Pill({ children, tone = "muted" }: { children: ReactNode; tone?: "muted" | "primary" | "accent" | "ok" | "warn" }) {
  const tones: Record<string, string> = {
    muted: "border-border text-muted-foreground",
    primary: "border-primary/40 text-primary",
    accent: "border-accent/50 text-accent",
    ok: "border-ok/50 text-ok",
    warn: "border-warn/50 text-warn",
  };
  return (
    <span className={`slide-badge inline-flex items-center rounded-full border px-5 py-2 ${tones[tone]}`}>
      {children}
    </span>
  );
}
