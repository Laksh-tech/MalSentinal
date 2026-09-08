import { useState } from "react";
import { Card, Pill, SlideLayout } from "@/components/deck/SlideLayout";

const datasets = {
  bcg: {
    name: "Better Call Graphs (BCG)",
    role: "Primary train / val / test",
    stats: [
      ["Applications", "10,057"],
      ["Benign", "5,986"],
      ["Malware", "4,071"],
      ["Family classes", "32"],
      ["Avg nodes / graph", "≈27,000"],
      ["Avg edges / graph", "≈58,000"],
    ],
    bars: [
      { label: "benign", v: 5986 },
      { label: "largest family", v: 900 },
      { label: "median family", v: 180 },
      { label: "rarest family", v: 21 },
    ],
    note: "Severe long-tail: the largest class is ~285× the rarest (21 samples). This is exactly why training uses effective-number class weights and P×K balanced batches.",
  },
  malnet: {
    name: "MalNet-Tiny",
    role: "Comparability benchmark",
    stats: [
      ["Graphs (test split)", "1,000"],
      ["Classes", "5"],
      ["Samples per class", "200 (balanced)"],
      ["Node/edge type", "FCG, function-level"],
      ["Used for", "AndroMesh-style comparison"],
      ["Cross-eval", "BCG model → MalNet"],
    ],
    bars: [
      { label: "benign", v: 200 },
      { label: "addisplay", v: 200 },
      { label: "adware", v: 200 },
      { label: "downloader", v: 200 },
      { label: "trojan", v: 200 },
    ],
    note: "Balanced 5-way benchmark, so it isolates representation quality from class-imbalance effects and makes results comparable with the AndroMesh baseline.",
  },
} as const;

const families = [
  "adware", "trojan", "downloader", "addisplay", "smsware", "spyware", "riskware", "dropper",
  "banker", "clicker", "ransom", "rooter", "backdoor", "exploit", "fakeapp", "monitor",
];

export function Slide3Datasets({ index, total }: { index: number; total: number }) {
  const [key, setKey] = useState<keyof typeof datasets>("bcg");
  const d = datasets[key];
  const max = Math.max(...d.bars.map((b) => b.v));

  return (
    <SlideLayout index={index} total={total} kicker="DATA" title="Two graph datasets," accentTitle="one frozen encoder">
      <div className="flex h-full flex-col">
        <div className="mb-8 flex gap-4">
          {(Object.keys(datasets) as (keyof typeof datasets)[]).map((k) => (
            <button
              key={k}
              onClick={() => setKey(k)}
              className={`slide-body rounded-lg border px-8 py-3 transition-colors ${
                key === k ? "border-primary bg-card text-primary" : "text-muted-foreground hover:border-primary/40"
              }`}
            >
              {datasets[k].name}
            </button>
          ))}
        </div>

        <div className="grid min-h-0 flex-1 grid-cols-[1fr_1fr_0.85fr] gap-8">
          <Card>
            <div className="slide-kicker text-accent">{d.role}</div>
            <div className="mt-6 space-y-3">
              {d.stats.map(([k, v]) => (
                <div key={k} className="flex items-baseline justify-between border-b border-border/60 pb-3">
                  <span className="slide-caption text-muted-foreground">{k}</span>
                  <span className="slide-body font-mono">{v}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <div className="slide-kicker text-accent">CLASS DISTRIBUTION</div>
            <div className="mt-8 space-y-6">
              {d.bars.map((b) => (
                <div key={b.label}>
                  <div className="slide-caption mb-2 flex justify-between">
                    <span>{b.label}</span>
                    <span className="font-mono text-muted-foreground">{b.v.toLocaleString()}</span>
                  </div>
                  <div className="h-4 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-500"
                      style={{ width: `${(b.v / max) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <p className="slide-caption mt-8 text-muted-foreground">{d.note}</p>
          </Card>

          <div className="flex flex-col gap-6">
            <Card className="flex-1">
              <div className="slide-kicker text-accent">FAMILY LABELS (SAMPLE OF 32)</div>
              <div className="mt-5 flex flex-wrap gap-2">
                {families.map((f) => (
                  <span
                    key={f}
                    className="slide-badge rounded-md border px-3 py-1.5 text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                  >
                    {f}
                  </span>
                ))}
                <span className="slide-badge rounded-md border border-dashed px-3 py-1.5 text-muted-foreground">
                  +16 more
                </span>
              </div>
            </Card>
            <Card className="py-6">
              <div className="slide-kicker text-accent">GRAPH SCALE</div>
              <div className="slide-body-lg mt-3 font-mono">120 → 53,000</div>
              <p className="slide-caption mt-2 text-muted-foreground">
                nodes per app in BCG — attentional pooling keeps the small malicious subgraph visible.
              </p>
              <div className="mt-4 flex gap-3">
                <Pill tone="warn">OVER-SQUASHING</Pill>
                <Pill tone="warn">LONG TAIL</Pill>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </SlideLayout>
  );
}
