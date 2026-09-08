import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Card, Pill, SlideLayout } from "@/components/deck/SlideLayout";

const steps = [
  {
    id: "upload",
    label: "APK Upload",
    sub: "React dashboard",
    detail:
      "User drops an APK into the dashboard. The upload is handed to the FastAPI service and an analysis job id is returned for status polling.",
  },
  {
    id: "decompile",
    label: "Decompile",
    sub: "ADB + APKTool → Smali",
    detail:
      "APK is decompiled to Smali intermediate representation; AndroidManifest is parsed for declared permissions and components.",
  },
  {
    id: "fcg",
    label: "Build FCG",
    sub: "methods = nodes, calls = edges",
    detail:
      "Method definitions become nodes, call instructions become directed edges. Node features are structural/topological; edge attributes encode call type. Framework namespaces (android.*, java.*, com.google.*) are pruned.",
  },
  {
    id: "encode",
    label: "Encode",
    sub: "GINE + Jumping Knowledge",
    detail:
      "A 4-layer GINEConv stack with Jumping Knowledge and attentional pooling turns a graph of ~120 to ~53,000 nodes into one fixed-size embedding.",
  },
  {
    id: "classify",
    label: "Classify",
    sub: "frozen embedding → XGBoost",
    detail:
      "The encoder is frozen at inference. XGBoost predicts benign vs malware and the malware family from the embedding.",
  },
  {
    id: "explain",
    label: "Explain",
    sub: "APIs · permissions · behaviour",
    detail:
      "Attention-weighted nodes map back to suspicious APIs and permissions, producing a short behaviour label (e.g. 'SMS interception', 'overlay attack') instead of a bare confidence score.",
  },
];

export function Slide2Overview({ index, total }: { index: number; total: number }) {
  const [active, setActive] = useState(2);

  return (
    <SlideLayout
      index={index}
      total={total}
      kicker="WHAT THE PROJECT IS"
      title="An APK analyser,"
      accentTitle="not a notebook result"
    >
      <div className="grid h-full grid-cols-[1.5fr_1fr] gap-14">
        <div>
          <p className="slide-body max-w-[1000px] text-muted-foreground">
            Conventional pipelines flatten an app into permission counts and API frequencies. MalSentinal
            keeps the <span className="text-foreground">relational structure</span> of the program — its
            Function Call Graph — and learns directly on it.
          </p>

          <div className="mt-7 space-y-2.5">
            {steps.map((s, i) => (
              <button
                key={s.id}
                onMouseEnter={() => setActive(i)}
                onClick={() => setActive(i)}
                className={`flex w-full items-center gap-6 rounded-lg border px-6 py-3 text-left transition-all ${
                  active === i
                    ? "border-primary bg-card translate-x-2"
                    : "border-border bg-transparent hover:border-primary/40"
                }`}
              >
                <span
                  className={`slide-chrome flex h-11 w-11 shrink-0 items-center justify-center rounded-full border ${
                    active === i ? "border-primary text-primary" : "text-muted-foreground"
                  }`}
                >
                  {i + 1}
                </span>
                <span className="slide-body font-medium">{s.label}</span>
                <span className="slide-caption ml-auto font-mono text-muted-foreground">{s.sub}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <Card className="flex-1">
            <div className="slide-kicker text-accent">STEP {active + 1}</div>
            <div className="slide-subtitle mt-4">{steps[active]?.label}</div>
            <p className="slide-body mt-6 text-muted-foreground">{steps[active]?.detail}</p>
          </Card>

          <Card>
            <div className="slide-kicker text-accent">DELIVERED AS</div>
            <div className="mt-5 flex flex-wrap gap-3">
              <Pill tone="ok">FASTAPI BACKEND</Pill>
              <Pill tone="primary">REACT DASHBOARD</Pill>
              <Pill>TRAINED ML CORE</Pill>
              <Pill tone="warn">EXPLAINABILITY</Pill>
            </div>
            <p className="slide-caption mt-6 text-muted-foreground">
              Upload an APK → get a risk score, predicted family and a human-readable reason.
            </p>
            <Link
              to="/demo"
              className="slide-badge mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-primary-foreground transition-opacity hover:opacity-90"
            >
              ▶ TRY THE LIVE DEMO
            </Link>
          </Card>
        </div>
      </div>
    </SlideLayout>
  );
}
