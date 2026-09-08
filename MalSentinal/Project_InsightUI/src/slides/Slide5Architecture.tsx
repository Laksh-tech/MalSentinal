import { useState } from "react";
import { Card, Pill, SlideLayout } from "@/components/deck/SlideLayout";

const tabs = ["ML CORE", "BACKEND & API", "FRONTEND", "SCALABILITY"] as const;
type Tab = (typeof tabs)[number];

const stack = [
  ["Programming", "Python"],
  ["Deep learning", "PyTorch"],
  ["Graph learning", "PyTorch Geometric"],
  ["Encoder", "GINE + Jumping Knowledge"],
  ["Objective", "Class-balanced SupCon"],
  ["Classifier", "XGBoost"],
  ["Decompilation", "ADB + APKTool + Smali"],
  ["Visualization", "Matplotlib / UMAP / t-SNE"],
];

const endpoints = [
  ["POST", "/api/analyze", "Upload APK, returns job id"],
  ["GET", "/api/status/{job_id}", "Decompile / FCG / inference progress"],
  ["GET", "/api/result/{job_id}", "Family, confidence, risk score, explanation"],
  ["GET", "/api/graph/{job_id}", "FCG summary + attention-weighted nodes"],
  ["GET", "/api/health", "Model + toolchain readiness"],
];

export function Slide5Architecture({ index, total }: { index: number; total: number }) {
  const [tab, setTab] = useState<Tab>("ML CORE");

  return (
    <SlideLayout index={index} total={total} kicker="APPROACH & ARCHITECTURE" title="Static pipeline," accentTitle="end to end">
      <div className="flex h-full flex-col">
        {/* pipeline strip */}
        <div className="mb-8 flex items-stretch gap-3">
          {[
            "APK",
            "ADB / APKTool → Smali",
            "FCG Builder",
            "Framework pruning",
            "GINE + JK (4 layers)",
            "Attentional pooling",
            "SupCon-shaped embedding",
            "XGBoost",
            "Explainability",
          ].map((s, i, arr) => (
            <div key={s} className="flex flex-1 items-center gap-3">
              <div className="flex-1 rounded-lg border bg-card px-4 py-5 text-center transition-colors hover:border-primary">
                <div className="slide-chrome text-muted-foreground">{String(i + 1).padStart(2, "0")}</div>
                <div className="slide-caption mt-2 font-medium">{s}</div>
              </div>
              {i < arr.length - 1 && <span className="text-primary">→</span>}
            </div>
          ))}
        </div>

        <div className="mb-6 flex gap-3">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`slide-badge rounded-full border px-6 py-2.5 transition-colors ${
                tab === t ? "border-primary text-primary" : "text-muted-foreground hover:border-primary/40"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="min-h-0 flex-1">
          {tab === "ML CORE" && (
            <div className="grid h-full grid-cols-2 gap-8">
              <Card>
                <div className="slide-kicker text-accent">MODEL</div>
                <div className="mt-6 space-y-4">
                  {[
                    ["Node features", "structural / topological (degree, centrality)"],
                    ["Edge attributes", "call-relationship type (edge-aware GINE)"],
                    ["Depth", "4 × GINEConv, JK concatenation of all layers"],
                    ["Pooling", "learned attentional gating → fixed-size embedding"],
                    ["Loss", "L = L_binary + α · L_family (effective-number weights)"],
                    ["Sampling", "P classes × K samples per batch; encoder frozen at inference"],
                  ].map(([k, v]) => (
                    <div key={k} className="border-b border-border/60 pb-3">
                      <div className="slide-caption font-mono text-primary">{k}</div>
                      <div className="slide-caption mt-1 text-muted-foreground">{v}</div>
                    </div>
                  ))}
                </div>
              </Card>
              <Card>
                <div className="slide-kicker text-accent">STACK</div>
                <div className="mt-6 grid grid-cols-2 gap-x-8 gap-y-4">
                  {stack.map(([k, v]) => (
                    <div key={k} className="border-b border-border/60 pb-3">
                      <div className="slide-caption text-muted-foreground">{k}</div>
                      <div className="slide-caption mt-1 font-mono">{v}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Pill tone="primary">ENCODER</Pill>
                  <Pill tone="accent">OBJECTIVE</Pill>
                  <Pill tone="ok">CLASSIFIER</Pill>
                </div>
              </Card>
            </div>
          )}

          {tab === "BACKEND & API" && (
            <Card className="h-full">
              <div className="slide-kicker text-accent">FASTAPI SERVICE — REST SURFACE</div>
              <div className="mt-6 space-y-3">
                {endpoints.map(([m, p, d]) => (
                  <div
                    key={p}
                    className="flex items-center gap-6 rounded-lg border px-6 py-4 transition-colors hover:border-primary"
                  >
                    <span
                      className={`slide-badge w-20 rounded-md border px-3 py-1 text-center ${
                        m === "POST" ? "border-ok/50 text-ok" : "border-primary/40 text-primary"
                      }`}
                    >
                      {m}
                    </span>
                    <span className="slide-body font-mono">{p}</span>
                    <span className="slide-caption ml-auto text-muted-foreground">{d}</span>
                  </div>
                ))}
              </div>
              <p className="slide-caption mt-6 text-muted-foreground">
                The service invokes decompilation, builds the FCG, calls the frozen ML core, and returns a
                result payload: confidence · family · risk score · explanation.
              </p>
            </Card>
          )}

          {tab === "FRONTEND" && (
            <div className="grid h-full grid-cols-3 gap-8">
              {[
                ["Upload", "Drag-and-drop APK, size/type validation, job id returned."],
                ["Analysis status", "Live stage tracking: decompile → FCG → encode → classify."],
                ["Result dashboard", "Risk score gauge, predicted family, confidence, suspicious APIs and permissions with a natural-language behaviour summary."],
              ].map(([t, d]) => (
                <Card key={t}>
                  <div className="slide-kicker text-accent">{t}</div>
                  <p className="slide-body mt-5 text-muted-foreground">{d}</p>
                </Card>
              ))}
            </div>
          )}

          {tab === "SCALABILITY" && (
            <div className="grid h-full grid-cols-2 gap-8">
              <Card>
                <div className="slide-kicker text-accent">QUEUED ANALYSIS (PLANNED)</div>
                <div className="mt-6 space-y-4">
                  {[
                    ["Redis + Celery", "Decompilation is slow and CPU-bound — move it off the request path into a task queue with retries."],
                    ["Postgres", "Persist jobs, results and explanation payloads for history and audit."],
                    ["Object storage", "APK and Smali artifacts stored out of process."],
                    ["Worker pool", "Horizontally scale decompile workers separately from GPU inference workers."],
                    ["Model registry", "Versioned encoder + XGBoost checkpoints, swappable without downtime."],
                  ].map(([k, v]) => (
                    <div key={k} className="border-b border-border/60 pb-3">
                      <div className="slide-caption font-mono text-primary">{k}</div>
                      <div className="slide-caption mt-1 text-muted-foreground">{v}</div>
                    </div>
                  ))}
                </div>
              </Card>
              <Card>
                <div className="slide-kicker text-accent">SCOPE BOUNDARY</div>
                <div className="mt-6 space-y-4">
                  <div className="rounded-lg border border-ok/40 p-5">
                    <div className="slide-caption font-mono text-ok">IN SCOPE — THIS SUBMISSION</div>
                    <p className="slide-caption mt-2 text-muted-foreground">
                      Static FCG construction · GINE+JK encoder · class-balanced two-tier SupCon ·
                      frozen-embedding XGBoost (binary + family) · deterministic explainability · FastAPI
                      backend · new frontend dashboard.
                    </p>
                  </div>
                  <div className="rounded-lg border border-warn/40 p-5">
                    <div className="slide-caption font-mono text-warn">OUT OF SCOPE — FUTURE WORK</div>
                    <p className="slide-caption mt-2 text-muted-foreground">
                      Dynamic / sandbox analysis · static–dynamic cross-attention fusion · LLM/RAG
                      explainability · queue-based microservice deployment · zero-shot family detection.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </SlideLayout>
  );
}
