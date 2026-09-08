import { Card, Pill, SlideLayout } from "@/components/deck/SlideLayout";

const progress = [
  ["FCG pipeline (APK → Smali → PyG graph)", 100],
  ["GINE + JK encoder with attentional pooling", 100],
  ["Class-balanced two-tier SupCon training", 100],
  ["Frozen-embedding XGBoost evaluation", 100],
  ["Cross-dataset generalization study", 90],
  ["Explainability layer (APIs / permissions)", 65],
  ["React dashboard (upload + results)", 40],
];

const next = [
  ["Full BCG 32-way run", "Extend the current MalNet-Tiny evaluation to the full 32-family BCG matrix with confusion matrices and per-family metrics."],
  ["Close the adware gap", "Pooling and objective ablation (B1-A…E): mean vs max vs attention, with/without SupCon, with/without balanced sampling."],
  ["Domain-shift fix", "The -0.3174 cross-dataset silhouette needs feature alignment before BCG embeddings transfer to MalNet."],
  ["Ship the dashboard", "Wire upload → status → result payload against the existing FastAPI endpoints."],
];

const future = [
  "Dynamic system-call / network / crypto feature encoding (KronoDroid)",
  "Static–dynamic fusion via cross-attention",
  "Exphormer-style global attention branch alongside local GINE+JK",
  "Hierarchical FCG + CFG modelling (HiGraph)",
  "Zero-/few-shot novel family detection (VOLTRON)",
  "LLM/RAG-assisted explainability reporting",
];

export function Slide7Next({ index, total }: { index: number; total: number }) {
  return (
    <SlideLayout index={index} total={total} kicker="PROGRESS · NEXT STEPS · CONCLUSION" title="Where the project" accentTitle="stands today">
      <div className="grid h-full grid-cols-[1fr_1fr_0.9fr] gap-8">
        <Card>
          <div className="slide-kicker text-accent">COMPLETION</div>
          <div className="mt-7 space-y-5">
            {progress.map(([label, pct]) => (
              <div key={label as string}>
                <div className="slide-caption mb-2 flex justify-between">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="font-mono">{pct}%</span>
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className={`h-full rounded-full ${(pct as number) === 100 ? "bg-ok" : "bg-primary"}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="slide-kicker text-accent">NEXT STEPS</div>
          <div className="mt-7 space-y-5">
            {next.map(([t, d], i) => (
              <div key={t as string} className="flex gap-5 border-b border-border/60 pb-4">
                <span className="slide-chrome mt-1 text-primary">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <div className="slide-caption font-medium">{t}</div>
                  <div className="slide-caption mt-1 text-muted-foreground">{d}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <div className="flex flex-col gap-6">
          <Card>
            <div className="slide-kicker text-accent">FUTURE SCOPE</div>
            <ul className="mt-5 space-y-3">
              {future.map((f) => (
                <li key={f} className="flex gap-3">
                  <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-warn" />
                  <span className="slide-caption text-muted-foreground">{f}</span>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="flex-1 py-5">
            <div className="flex items-center gap-4">
              <div className="slide-kicker text-accent">CONCLUSION</div>
              <Pill tone="ok">BASELINE B1 VALIDATED</Pill>
            </div>
            <p className="slide-caption mt-3 text-muted-foreground">
              The static FCG baseline works: <span className="text-foreground">99.5%</span> binary accuracy
              and <span className="text-foreground">0.90</span> macro-F1 across five families — from frozen,
              contrastively shaped embeddings.
            </p>
          </Card>
        </div>
      </div>
    </SlideLayout>
  );
}
