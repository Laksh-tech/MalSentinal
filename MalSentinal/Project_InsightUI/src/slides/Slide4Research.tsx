import { useState } from "react";
import { Card, Pill, SlideLayout } from "@/components/deck/SlideLayout";

const papers = [
  {
    n: "01",
    title: "Better Call Graphs (BCG)",
    year: "2026",
    approach: "Large-scale Android FCG dataset",
    take: "Primary dataset. Evaluates GCN/GIN/GraphSAGE on FCGs and reports that family classification is substantially harder than binary detection; flags duplicate leakage and temporal drift.",
    tag: "DATASET",
  },
  {
    n: "02",
    title: "CFG-Level Representation Learning with GIN",
    year: "2022",
    approach: "CFG + GIN",
    take: "Methodological grounding for using GIN as a graph representation encoder for malware.",
    tag: "METHOD",
  },
  {
    n: "03",
    title: "AndroMesh — base paper",
    year: "2025",
    approach: "FCG + GraphSAGE-JK (local) + Exphormer (global)",
    take: "Architectural template: 93.5% accuracy / 98.57% AUC on MalNet-Tiny, JK against over-smoothing, and a feature-dimension + aggregation ablation methodology this project mirrors.",
    tag: "BASE PAPER",
  },
  {
    n: "04",
    title: "KronoDroid",
    year: "—",
    approach: "Static + dynamic features, timestamps",
    take: "Motivates the future dynamic branch and temporal drift evaluation. Not used in the static college scope.",
    tag: "FUTURE",
  },
  {
    n: "05",
    title: "HiGraph",
    year: "—",
    approach: "FCG containing local CFGs",
    take: "Shows value of hierarchical inter/intra-procedural representation — future work.",
    tag: "FUTURE",
  },
  {
    n: "06",
    title: "Benchmarking Android Malware Detection",
    year: "—",
    approach: "Traditional ML + deep models",
    take: "Supports multi-baseline benchmarking rather than assuming deep learning wins by default.",
    tag: "METHOD",
  },
  {
    n: "07",
    title: "VOLTRON",
    year: "—",
    approach: "API graphs + VGAE / Siamese / zero-shot",
    take: "Motivates future unknown-family and few-shot detection beyond a closed-set classifier.",
    tag: "FUTURE",
  },
];

const gaps = [
  "Family classification is far harder than binary detection.",
  "Huge FCGs (≈27k nodes) over-squash the tiny malicious subgraph in framework boilerplate.",
  "Long-tailed families break contrastive learning — rare classes may get no positive pair in a batch.",
  "Deep message passing over-smooths; 4 hops can't reach a 20-hop call path.",
  "Most detectors stop at a confidence score, with no structured explanation.",
];

export function Slide4Research({ index, total }: { index: number; total: number }) {
  const [open, setOpen] = useState(2);

  return (
    <SlideLayout index={index} total={total} kicker="RESEARCH BACKBONE" title="Eight papers," accentTitle="five research gaps">
      <div className="grid h-full grid-cols-[1.45fr_1fr] gap-12">
        <div className="space-y-2.5">
          {papers.map((p, i) => (
            <button
              key={p.n}
              onClick={() => setOpen(i)}
              onMouseEnter={() => setOpen(i)}
              className={`w-full rounded-lg border px-6 py-4 text-left transition-all ${
                open === i ? "border-primary bg-card" : "hover:border-primary/40"
              }`}
            >
              <div className="flex items-center gap-5">
                <span className="slide-chrome text-muted-foreground">{p.n}</span>
                <span className="slide-body font-medium">{p.title}</span>
                <span
                  className={`slide-badge ml-auto rounded-full border px-4 py-1 ${
                    p.tag === "BASE PAPER"
                      ? "border-primary/50 text-primary"
                      : p.tag === "FUTURE"
                        ? "border-warn/50 text-warn"
                        : "text-muted-foreground"
                  }`}
                >
                  {p.tag}
                </span>
              </div>
              {open === i && (
                <div className="mt-4 border-l-2 border-primary pl-5">
                  <div className="slide-caption font-mono text-accent">{p.approach}</div>
                  <p className="slide-caption mt-2 text-muted-foreground">{p.take}</p>
                </div>
              )}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-6">
          <Card className="flex-1">
            <div className="slide-kicker text-accent">RESEARCH GAP</div>
            <ul className="mt-6 space-y-5">
              {gaps.map((g) => (
                <li key={g} className="flex gap-4">
                  <span className="mt-3 h-2 w-2 shrink-0 rounded-full bg-danger" />
                  <span className="slide-caption text-muted-foreground">{g}</span>
                </li>
              ))}
            </ul>
          </Card>
          <Card>
            <div className="slide-kicker text-accent">WHAT THIS PROJECT ANSWERS</div>
            <p className="slide-body mt-4 text-muted-foreground">
              Can a class-balanced supervised contrastive objective on FCG embeddings make family-level
              structure separable — and be shipped as an explainable tool?
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Pill tone="primary">B1-S BINARY</Pill>
              <Pill tone="primary">B1-F FAMILY</Pill>
              <Pill>B1-A…E ABLATION</Pill>
            </div>
          </Card>
        </div>
      </div>
    </SlideLayout>
  );
}
