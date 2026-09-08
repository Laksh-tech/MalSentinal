import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";

// ---- Types ----
type SampleId = "benign" | "trojan" | "adware";

type GNode = {
  id: string;
  label: string;
  x: number;
  y: number;
  framework: boolean;
  attention: number; // 0..1
  suspicious: boolean;
};

type Sample = {
  id: SampleId;
  name: string;
  verdict: "BENIGN" | "MALWARE";
  family: string;
  behaviour: string;
  nodeCount: number;
  edgeCount: number;
  prunedCount: number;
  embedDim: number;
  probabilities: { cls: string; p: number }[];
  nodes: GNode[];
  edges: [string, string][];
  suspiciousApis: string[];
  permissions: string[];
};

// ---- Sample data (three representative graphs) ----
const SAMPLES: Sample[] = [
  {
    id: "benign",
    name: "com.example.calculator",
    verdict: "BENIGN",
    family: "benign",
    behaviour: "No anomalous behaviour — standard utility app",
    nodeCount: 184,
    edgeCount: 412,
    prunedCount: 96,
    embedDim: 128,
    probabilities: [
      { cls: "benign", p: 0.9875 },
      { cls: "addisplay", p: 0.0061 },
      { cls: "trojan", p: 0.0034 },
      { cls: "downloader", p: 0.0021 },
      { cls: "adware", p: 0.0009 },
    ],
    suspiciousApis: [],
    permissions: ["android.permission.INTERNET"],
    nodes: [
      { id: "n1", label: "onCreate", x: 120, y: 160, framework: false, attention: 0.04, suspicious: false },
      { id: "n2", label: "calculate", x: 300, y: 100, framework: false, attention: 0.03, suspicious: false },
      { id: "n3", label: "formatResult", x: 300, y: 220, framework: false, attention: 0.02, suspicious: false },
      { id: "n4", label: "updateDisplay", x: 480, y: 160, framework: false, attention: 0.05, suspicious: false },
      { id: "n5", label: "Activity.onCreate", x: 120, y: 320, framework: true, attention: 0, suspicious: false },
      { id: "n6", label: "View.setText", x: 480, y: 300, framework: true, attention: 0, suspicious: false },
      { id: "n7", label: "Math.add", x: 300, y: 340, framework: true, attention: 0, suspicious: false },
      { id: "n8", label: "onClick", x: 120, y: 60, framework: false, attention: 0.06, suspicious: false },
    ],
    edges: [
      ["n8", "n1"], ["n1", "n2"], ["n1", "n3"], ["n2", "n7"], ["n3", "n4"], ["n4", "n6"], ["n1", "n5"],
    ],
  },
  {
    id: "trojan",
    name: "com.free.smsfwd.trojan",
    verdict: "MALWARE",
    family: "trojan",
    behaviour: "SMS interception — reads incoming SMS, forwards to remote server",
    nodeCount: 3427,
    edgeCount: 8914,
    prunedCount: 2104,
    embedDim: 128,
    probabilities: [
      { cls: "trojan", p: 0.9153 },
      { cls: "benign", p: 0.0451 },
      { cls: "downloader", p: 0.0223 },
      { cls: "adware", p: 0.0108 },
      { cls: "addisplay", p: 0.0065 },
    ],
    suspiciousApis: [
      "android.telephony.SmsMessage.getMessageBody()",
      "android.telephony.SmsManager.sendTextMessage()",
      "org.apache.http.client.HttpClient.execute()",
    ],
    permissions: [
      "android.permission.READ_SMS",
      "android.permission.SEND_SMS",
      "android.permission.INTERNET",
      "android.permission.READ_PHONE_STATE",
    ],
    nodes: [
      { id: "n1", label: "onReceive", x: 100, y: 150, framework: false, attention: 0.18, suspicious: false },
      { id: "n2", label: "readSms", x: 270, y: 90, framework: false, attention: 0.94, suspicious: true },
      { id: "n3", label: "parseMessage", x: 270, y: 230, framework: false, attention: 0.31, suspicious: false },
      { id: "n4", label: "sendSms", x: 440, y: 150, framework: false, attention: 0.89, suspicious: true },
      { id: "n5", label: "httpPost", x: 440, y: 290, framework: false, attention: 0.82, suspicious: true },
      { id: "n6", label: "getDeviceId", x: 100, y: 310, framework: false, attention: 0.76, suspicious: true },
      { id: "n7", label: "BroadcastReceiver", x: 100, y: 50, framework: true, attention: 0, suspicious: false },
      { id: "n8", label: "SmsMessage", x: 270, y: 350, framework: true, attention: 0, suspicious: false },
      { id: "n9", label: "HttpClient", x: 580, y: 220, framework: true, attention: 0, suspicious: false },
      { id: "n10", label: "TelephonyManager", x: 100, y: 390, framework: true, attention: 0, suspicious: false },
    ],
    edges: [
      ["n7", "n1"], ["n1", "n2"], ["n1", "n3"], ["n2", "n8"], ["n3", "n4"], ["n4", "n5"], ["n5", "n9"],
      ["n1", "n6"], ["n6", "n10"],
    ],
  },
  {
    id: "adware",
    name: "com.game.popupads",
    verdict: "MALWARE",
    family: "adware",
    behaviour: "Aggressive ad popups — overlays ads outside app context",
    nodeCount: 2103,
    edgeCount: 5467,
    prunedCount: 1340,
    embedDim: 128,
    probabilities: [
      { cls: "adware", p: 0.7931 },
      { cls: "addisplay", p: 0.1524 },
      { cls: "trojan", p: 0.0312 },
      { cls: "benign", p: 0.0151 },
      { cls: "downloader", p: 0.0082 },
    ],
    suspiciousApis: [
      "android.webkit.WebView.loadUrl()",
      "android.view.WindowManager.addView()",
      "com.google.ads.AdView.loadAd()",
    ],
    permissions: [
      "android.permission.INTERNET",
      "android.permission.SYSTEM_ALERT_WINDOW",
      "android.permission.WAKE_LOCK",
    ],
    nodes: [
      { id: "n1", label: "onCreate", x: 100, y: 150, framework: false, attention: 0.12, suspicious: false },
      { id: "n2", label: "loadAd", x: 270, y: 90, framework: false, attention: 0.88, suspicious: true },
      { id: "n3", label: "showOverlay", x: 270, y: 250, framework: false, attention: 0.91, suspicious: true },
      { id: "n4", label: "loadUrl", x: 440, y: 150, framework: false, attention: 0.74, suspicious: true },
      { id: "n5", label: "keepAlive", x: 440, y: 310, framework: false, attention: 0.58, suspicious: false },
      { id: "n6", label: "Activity.onCreate", x: 100, y: 300, framework: true, attention: 0, suspicious: false },
      { id: "n7", label: "WebView", x: 440, y: 50, framework: true, attention: 0, suspicious: false },
      { id: "n8", label: "WindowManager", x: 270, y: 370, framework: true, attention: 0, suspicious: false },
      { id: "n9", label: "AdView", x: 580, y: 90, framework: true, attention: 0, suspicious: false },
    ],
    edges: [
      ["n1", "n2"], ["n1", "n3"], ["n2", "n9"], ["n2", "n4"], ["n4", "n7"], ["n3", "n8"], ["n1", "n5"], ["n1", "n6"],
    ],
  },
];

// ---- Pipeline stages ----
const STAGES = [
  { id: "decompile", label: "Decompile APK → Smali", detail: "APKTool + ADB decompilation; manifest parsed for permissions." },
  { id: "fcg", label: "Build Function Call Graph", detail: "Methods → nodes, call instructions → directed edges." },
  { id: "prune", label: "Prune framework nodes", detail: "android.*, java.*, com.google.* namespaces removed." },
  { id: "encode", label: "GINE + JK encoding", detail: "4-layer GINEConv + Jumping Knowledge + attentional pooling → 128-dim embedding." },
  { id: "classify", label: "XGBoost classification", detail: "Frozen embedding → binary + 5-way family prediction." },
  { id: "explain", label: "Attention-based explanation", detail: "Attention weights map to suspicious APIs and behaviour label." },
] as const;

export function LiveDemo() {
  const [sampleId, setSampleId] = useState<SampleId>("trojan");
  const [stage, setStage] = useState(-1); // -1 idle, 0..5 running, 6 done
  const [running, setRunning] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const sample = useMemo(() => SAMPLES.find((s) => s.id === sampleId)!, [sampleId]);

  // theme toggle (reuse deck dark mode)
  const [dark, setDark] = useState(false);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  // cleanup timers
  useEffect(() => {
    return () => timers.current.forEach(clearTimeout);
  }, []);

  const reset = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setStage(-1);
    setRunning(false);
  }, []);

  const run = useCallback(() => {
    reset();
    setRunning(true);
    setStage(0);
    const delays = [0, 900, 1700, 2500, 3300, 4100];
    delays.forEach((d, i) => {
      const t = setTimeout(() => {
        setStage(i);
        if (i === STAGES.length - 1) {
          const t2 = setTimeout(() => {
            setStage(STAGES.length);
            setRunning(false);
          }, 900);
          timers.current.push(t2);
        }
      }, d);
      timers.current.push(t);
    });
  }, [reset]);

  // reset when sample changes
  useEffect(() => {
    reset();
  }, [sampleId, reset]);

  const showGraph = stage >= 1; // FCG built
  const showPruned = stage >= 2;
  const showEmbed = stage >= 3;
  const showResult = stage >= 4;
  const showExplain = stage >= 5;
  const done = stage >= STAGES.length;

  const topProb = [...sample.probabilities].sort((a, b) => b.p - a.p)[0]!;
  const isMalware = sample.verdict === "MALWARE";

  return (
    <div className="grid-bg relative flex h-screen flex-col overflow-y-auto bg-background text-foreground">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-border px-8 py-5">
        <Link
          to="/"
          className="inline-flex items-center gap-3 font-mono text-sm tracking-wider text-muted-foreground transition-colors hover:text-primary"
        >
          <span>←</span> BACK TO DECK
        </Link>
        <div className="flex items-center gap-3 font-mono text-sm tracking-wider text-muted-foreground">
          <span className="h-2.5 w-2.5 rounded-full bg-primary" />
          MALSENTINAL · LIVE DEMO
        </div>
        <button
          onClick={() => setDark((d) => !d)}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
          title="Toggle theme"
        >
          {dark ? "☀" : "☾"}
        </button>
      </header>

      {/* Main */}
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-6 py-8">
        {/* Title */}
        <div className="mb-8">
          <div className="font-mono text-xs tracking-[0.18em] text-accent">INTERACTIVE PIPELINE</div>
          <h1 className="mt-3 font-[var(--font-display)] text-4xl font-bold tracking-tight md:text-5xl">
            Run the model on a <span className="text-primary">sample graph</span>
          </h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Pick a sample APK and watch the full static-analysis pipeline run end-to-end: decompilation → Function Call
            Graph → GINE+JK encoding → XGBoost classification → attention-based explanation.
          </p>
        </div>

        {/* Sample selector */}
        <div className="mb-6 flex flex-wrap gap-3">
          {SAMPLES.map((s) => (
            <button
              key={s.id}
              onClick={() => setSampleId(s.id)}
              className={`rounded-lg border px-5 py-3 text-left transition-all ${
                sampleId === s.id
                  ? "border-primary bg-card"
                  : "border-border bg-transparent hover:border-primary/40"
              }`}
            >
              <div className="font-mono text-sm font-medium">{s.name}</div>
              <div className="mt-1 font-mono text-xs text-muted-foreground">
                {s.verdict} · {s.family}
              </div>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Left: Graph + pipeline */}
          <div className="flex flex-col gap-4">
            {/* Graph canvas */}
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="font-mono text-xs tracking-wider text-accent">FUNCTION CALL GRAPH</span>
                <span className="font-mono text-xs text-muted-foreground">
                  {showPruned
                    ? `${sample.nodeCount - sample.prunedCount} nodes · ${sample.edgeCount - Math.round(sample.edgeCount * 0.4)} edges`
                    : showGraph
                      ? `${sample.nodeCount} nodes · ${sample.edgeCount} edges`
                      : "awaiting decompilation"}
                </span>
              </div>
              <div className="relative h-[300px] overflow-hidden rounded-lg border border-border bg-background">
                {!showGraph && (
                  <div className="flex h-full items-center justify-center font-mono text-sm text-muted-foreground">
                    {stage === 0 ? "decompiling APK → Smali…" : "select a sample and run"}
                  </div>
                )}
                {showGraph && (
                  <svg viewBox="0 0 680 430" className="h-full w-full">
                    {/* edges */}
                    {sample.edges.map(([from, to], i) => {
                      const fn = sample.nodes.find((n) => n.id === from)!;
                      const tn = sample.nodes.find((n) => n.id === to)!;
                      const prunedEdge =
                        showPruned && (fn.framework || tn.framework);
                      return (
                        <line
                          key={i}
                          x1={fn.x}
                          y1={fn.y}
                          x2={tn.x}
                          y2={tn.y}
                          stroke="var(--color-border)"
                          strokeWidth={1.5}
                          strokeOpacity={prunedEdge ? 0.1 : 0.5}
                          strokeDasharray={prunedEdge ? "3 3" : undefined}
                        />
                      );
                    })}
                    {/* nodes */}
                    {sample.nodes.map((n) => {
                      const isPruned = showPruned && n.framework;
                      const isHot = showExplain && n.suspicious;
                      const r = isHot ? 11 : 8;
                      return (
                        <g key={n.id} opacity={isPruned ? 0.12 : 1} style={{ transition: "opacity 0.4s" }}>
                          {isHot && (
                            <circle
                              cx={n.x}
                              cy={n.y}
                              r={r + 6}
                              fill="var(--color-danger)"
                              fillOpacity={0.15}
                            />
                          )}
                          <circle
                            cx={n.x}
                            cy={n.y}
                            r={r}
                            fill={
                              isHot
                                ? "var(--color-danger)"
                                : n.framework
                                  ? "var(--color-muted)"
                                  : "var(--color-primary)"
                            }
                          />
                          <text
                            x={n.x}
                            y={n.y - r - 5}
                            textAnchor="middle"
                            fontSize={11}
                            fontFamily="var(--font-mono)"
                            fill="var(--color-muted-foreground)"
                          >
                            {n.label}
                          </text>
                          {showExplain && n.attention > 0.5 && (
                            <text
                              x={n.x}
                              y={n.y + r + 14}
                              textAnchor="middle"
                              fontSize={10}
                              fontFamily="var(--font-mono)"
                              fill="var(--color-danger)"
                            >
                              attn {n.attention.toFixed(2)}
                            </text>
                          )}
                        </g>
                      );
                    })}
                  </svg>
                )}
              </div>
            </div>

            {/* Pipeline stages */}
            <div className="rounded-xl border border-border bg-card p-4">
              <span className="mb-3 block font-mono text-xs tracking-wider text-accent">PIPELINE</span>
              <div className="space-y-2">
                {STAGES.map((s, i) => {
                  const active = stage === i;
                  const passed = stage > i;
                  return (
                    <div
                      key={s.id}
                      className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 transition-all ${
                        active
                          ? "border-primary bg-background"
                          : passed
                            ? "border-border opacity-60"
                            : "border-border opacity-30"
                      }`}
                    >
                      <span
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border font-mono text-xs ${
                          active
                            ? "border-primary text-primary"
                            : passed
                              ? "border-ok text-ok"
                              : "border-border text-muted-foreground"
                        }`}
                      >
                        {passed ? "✓" : i + 1}
                      </span>
                      <div className="min-w-0">
                        <div className="font-mono text-sm font-medium">{s.label}</div>
                        {active && (
                          <div className="mt-0.5 text-xs text-muted-foreground">{s.detail}</div>
                        )}
                      </div>
                      {active && (
                        <span className="ml-auto h-2 w-2 animate-pulse rounded-full bg-primary" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right: Controls + results */}
          <div className="flex flex-col gap-4">
            {/* Run button */}
            <div className="rounded-xl border border-border bg-card p-4">
              <button
                onClick={running ? reset : run}
                disabled={stage === -1 && false}
                className={`w-full rounded-lg px-6 py-4 font-mono text-sm font-semibold tracking-wider transition-all ${
                  running
                    ? "border border-border bg-muted text-muted-foreground"
                    : "bg-primary text-primary-foreground hover:opacity-90"
                }`}
              >
                {running ? "■ STOP" : done ? "↻ RUN AGAIN" : "▶ RUN ANALYSIS"}
              </button>
              {done && (
                <div className="mt-3 text-center font-mono text-xs text-muted-foreground">
                  pipeline complete · {sample.nodeCount - sample.prunedCount} active nodes
                </div>
              )}
            </div>

            {/* Embedding preview */}
            {showEmbed && (
              <div className="rounded-xl border border-border bg-card p-4">
                <span className="mb-3 block font-mono text-xs tracking-wider text-accent">
                  FROZEN EMBEDDING · 128-DIM
                </span>
                <div className="flex flex-wrap gap-1">
                  {Array.from({ length: 64 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-4 w-2 rounded-sm transition-all duration-300"
                      style={{
                        backgroundColor: `var(--color-primary)`,
                        opacity: 0.15 + ((Math.sin(i * 1.3 + sample.id.length * 7) + 1) / 2) * 0.7,
                        transitionDelay: `${i * 8}ms`,
                      }}
                    />
                  ))}
                </div>
                <div className="mt-2 font-mono text-xs text-muted-foreground">
                  {showResult ? "→ XGBoost head" : "encoding…"}
                </div>
              </div>
            )}

            {/* Classification result */}
            {showResult && (
              <div className="rounded-xl border border-border bg-card p-4">
                <span className="mb-3 block font-mono text-xs tracking-wider text-accent">
                  XGBOOST CLASSIFICATION
                </span>
                {/* Verdict */}
                <div
                  className={`mb-4 flex items-center gap-4 rounded-lg border p-4 ${
                    isMalware
                      ? "border-danger/50 bg-danger/5"
                      : "border-ok/50 bg-ok/5"
                  }`}
                >
                  <span
                    className={`font-mono text-3xl font-bold ${
                      isMalware ? "text-danger" : "text-ok"
                    }`}
                  >
                    {sample.verdict}
                  </span>
                  {isMalware && (
                    <div>
                      <div className="font-mono text-xs text-muted-foreground">PREDICTED FAMILY</div>
                      <div className="font-mono text-lg font-semibold text-foreground">{sample.family}</div>
                    </div>
                  )}
                  <div className="ml-auto text-right">
                    <div className="font-mono text-xs text-muted-foreground">CONFIDENCE</div>
                    <div className="font-mono text-lg font-semibold text-foreground">
                      {(topProb.p * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>

                {/* Probability bars */}
                <div className="space-y-2">
                  {sample.probabilities.map((pr) => {
                    const isTop = pr.cls === topProb.cls;
                    return (
                      <div key={pr.cls} className="flex items-center gap-3">
                        <span
                          className={`w-20 font-mono text-xs ${isTop ? "font-bold text-foreground" : "text-muted-foreground"}`}
                        >
                          {pr.cls}
                        </span>
                        <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-muted">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ${
                              isTop
                                ? isMalware
                                  ? "bg-danger"
                                  : "bg-ok"
                                : "bg-primary"
                            }`}
                            style={{ width: `${pr.p * 100}%` }}
                          />
                        </div>
                        <span className="w-12 font-mono text-xs text-muted-foreground">
                          {(pr.p * 100).toFixed(1)}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Explanation */}
            {showExplain && (
              <div className="rounded-xl border border-border bg-card p-4">
                <span className="mb-3 block font-mono text-xs tracking-wider text-accent">
                  ATTENTION-BASED EXPLANATION
                </span>
                <div className="mb-3 rounded-lg border border-border bg-background px-4 py-3">
                  <div className="font-mono text-xs text-muted-foreground">BEHAVIOUR LABEL</div>
                  <div className="mt-1 text-sm font-medium text-foreground">{sample.behaviour}</div>
                </div>
                {sample.suspiciousApis.length > 0 ? (
                  <>
                    <div className="mb-2 font-mono text-xs text-muted-foreground">SUSPICIOUS APIs (attention-weighted)</div>
                    <div className="space-y-1.5">
                      {sample.suspiciousApis.map((api) => (
                        <div
                          key={api}
                          className="flex items-center gap-2 rounded-md border border-danger/30 bg-danger/5 px-3 py-2 font-mono text-xs text-foreground"
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-danger" />
                          {api}
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 font-mono text-xs text-muted-foreground">
                      DECLARED PERMISSIONS: {sample.permissions.join(" · ")}
                    </div>
                  </>
                ) : (
                  <div className="font-mono text-xs text-muted-foreground">
                    No high-attention suspicious nodes detected.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer note */}
        <footer className="mt-8 border-t border-border pt-4">
          <p className="font-mono text-xs text-muted-foreground">
            Demo runs a client-side simulation of the static-analysis pipeline with pre-computed model outputs.
            Real inference uses the trained GINE+JK encoder and XGBoost head — see Slide 6 for full metrics.
          </p>
        </footer>
      </main>
    </div>
  );
}
