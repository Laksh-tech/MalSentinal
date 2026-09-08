import { useState } from "react";
import { Card, Pill, SlideLayout } from "@/components/deck/SlideLayout";

type Row = { cls: string; p: number; r: number; f1: number; support: number; prauc?: number };

const fiveWay: Row[] = [
  { cls: "addisplay", p: 0.9296, r: 0.925, f1: 0.9273, support: 200, prauc: 0.9857 },
  { cls: "adware", p: 0.7816, r: 0.805, f1: 0.7931, support: 200, prauc: 0.8728 },
  { cls: "benign", p: 0.9851, r: 0.99, f1: 0.9875, support: 200, prauc: 0.9748 },
  { cls: "downloader", p: 0.9227, r: 0.835, f1: 0.8766, support: 200, prauc: 0.9345 },
  { cls: "trojan", p: 0.8873, r: 0.945, f1: 0.9153, support: 200, prauc: 0.9636 },
];

const binary: Row[] = [
  { cls: "Benign", p: 0.9851, r: 0.99, f1: 0.9875, support: 200 },
  { cls: "Malware", p: 0.9975, r: 0.9962, f1: 0.9969, support: 800 },
];

const cross: Row[] = [
  { cls: "addisplay", p: 0.74, r: 0.88, f1: 0.8, support: 200 },
  { cls: "adware", p: 0.68, r: 0.61, f1: 0.64, support: 200 },
  { cls: "benign", p: 0.98, r: 0.99, f1: 0.99, support: 200 },
  { cls: "downloader", p: 0.91, r: 0.74, f1: 0.82, support: 200 },
  { cls: "trojan", p: 0.75, r: 0.81, f1: 0.78, support: 200 },
];

const views = {
  "5-WAY FAMILY": {
    rows: fiveWay,
    headline: [
      ["Accuracy", "0.9000"],
      ["Macro F1", "0.9000"],
      ["Macro AUC (OvR)", "0.9823"],
      ["Cosine silhouette", "0.5974"],
    ],
    note: "Frozen GINE+JK+SupCon embeddings + XGBoost, trained and tested on MalNet-Tiny. Silhouette 0.5974 means tight, well-separated family clusters in embedding space.",
  },
  "BINARY (DERIVED)": {
    rows: binary,
    headline: [
      ["Accuracy", "0.9950"],
      ["Macro F1", "0.9922"],
      ["Malware recall", "0.9962"],
      ["Benign recall", "0.9900"],
    ],
    note: "Collapsing the 5-way prediction to benign vs malware gives 99.5% accuracy — confirming the synopsis claim that family classification is the genuinely hard task, not detection.",
  },
  "CROSS-DATASET": {
    rows: cross,
    headline: [
      ["Accuracy", "0.8100"],
      ["Macro F1", "0.8100"],
      ["Silhouette (BCG→MalNet)", "-0.3174"],
      ["Train → Test", "BCG → MalNet-Tiny"],
    ],
    note: "BCG-trained encoder, feature-padded and applied to MalNet-Tiny unseen. 0.81 macro-F1 transfers, but the negative silhouette shows the embedding geometry does not carry across datasets — domain shift, not label noise.",
  },
} as const;

type View = keyof typeof views;

function Bar({ v }: { v: number }) {
  return (
    <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
      <div
        className="h-full rounded-full bg-primary transition-all duration-500"
        style={{ width: `${v * 100}%` }}
      />
    </div>
  );
}

export function Slide6Results({ index, total }: { index: number; total: number }) {
  const [view, setView] = useState<View>("5-WAY FAMILY");
  const v = views[view];

  return (
    <SlideLayout index={index} total={total} kicker="TRAINING & EVALUATION" title="Frozen embeddings," accentTitle="XGBoost head">
      <div className="flex h-full flex-col">
        <div className="mb-7 flex gap-3">
          {(Object.keys(views) as View[]).map((k) => (
            <button
              key={k}
              onClick={() => setView(k)}
              className={`slide-badge rounded-full border px-6 py-2.5 transition-colors ${
                view === k ? "border-primary text-primary" : "text-muted-foreground hover:border-primary/40"
              }`}
            >
              {k}
            </button>
          ))}
        </div>

        <div className="mb-6 grid grid-cols-4 gap-6">
          {v.headline.map(([k, val]) => (
            <Card key={k} className="px-8 py-5">
              <div className="slide-kicker text-accent">{k}</div>
              <div className="slide-subtitle mt-2 font-mono">{val}</div>
            </Card>
          ))}
        </div>

        <div className="grid min-h-0 flex-1 grid-cols-[1.6fr_1fr] gap-8">
          <Card>
            <div className="slide-kicker text-accent">PER-CLASS REPORT</div>
            <div className="mt-5 grid grid-cols-[1.1fr_0.6fr_0.6fr_1.4fr_0.6fr] gap-4 border-b pb-3">
              {["class", "precision", "recall", "f1-score", "support"].map((h) => (
                <span key={h} className="slide-caption font-mono text-muted-foreground">
                  {h}
                </span>
              ))}
            </div>
            <div className="mt-3 space-y-3">
              {v.rows.map((r) => (
                <div
                  key={r.cls}
                  className="grid grid-cols-[1.1fr_0.6fr_0.6fr_1.4fr_0.6fr] items-center gap-4 rounded-md px-1 py-2 transition-colors hover:bg-muted"
                >
                  <span className="slide-caption font-medium">{r.cls}</span>
                  <span className="slide-caption font-mono text-muted-foreground">{r.p.toFixed(3)}</span>
                  <span className="slide-caption font-mono text-muted-foreground">{r.r.toFixed(3)}</span>
                  <div className="flex items-center gap-3">
                    <Bar v={r.f1} />
                    <span className="slide-caption w-16 font-mono">{r.f1.toFixed(3)}</span>
                  </div>
                  <span className="slide-caption font-mono text-muted-foreground">{r.support}</span>
                </div>
              ))}
            </div>
          </Card>

          <div className="flex flex-col gap-6">
            <Card className="flex-1">
              <div className="slide-kicker text-accent">READING THE RESULT</div>
              <p className="slide-body mt-4 text-muted-foreground">{v.note}</p>
              <a
                href="./demo/"
                className="slide-badge mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-primary-foreground transition-opacity hover:opacity-90"
              >
                ▶ RUN THE MODEL LIVE
              </a>
            </Card>
            <Card>
              <div className="slide-kicker text-accent">WEAKEST CLASS</div>
              <div className="slide-subtitle mt-3">adware</div>
              <p className="slide-caption mt-3 text-muted-foreground">
                F1 0.793 in-domain, 0.64 cross-dataset, PR-AUC 0.873 — it overlaps structurally with
                addisplay, the expected confusion for ad-driven families.
              </p>
              <div className="mt-5 flex gap-3">
                <Pill tone="warn">CONFUSION: ADWARE ↔ ADDISPLAY</Pill>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </SlideLayout>
  );
}
