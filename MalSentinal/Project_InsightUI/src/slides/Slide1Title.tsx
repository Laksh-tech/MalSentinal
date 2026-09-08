import { Pill } from "@/components/deck/SlideLayout";

export function Slide1Title({ index, total }: { index: number; total: number }) {
  return (
    <div className="slide-content grid-bg bg-background text-foreground">
      <div className="absolute inset-x-0 top-0 flex items-center justify-between px-20 pt-12">
        <div className="slide-chrome flex items-center gap-4 text-muted-foreground">
          <span className="h-2.5 w-2.5 rounded-full bg-primary" />
          MALSENTINAL · MINOR PROJECT SYNOPSIS · 2024–28
        </div>
        <div className="slide-page text-muted-foreground">
          <span className="text-primary">{String(index).padStart(2, "0")}</span> / {String(total).padStart(2, "0")}
        </div>
      </div>

      <div className="grid h-full grid-cols-[1.35fr_0.85fr] items-center gap-16 px-20 pb-24 pt-28">
        <div>
          <div className="slide-kicker mb-8 flex items-center gap-6 text-accent">
            IPS ACADEMY, INDORE
            <span className="h-px w-24 bg-accent/50" />
          </div>
          <h1 className="slide-title-lg">
            MalSentinal
          </h1>
          <h2 className="slide-subtitle mt-6 max-w-[1000px] text-muted-foreground">
            Graph-Based <span className="text-primary">Android Malware Detection</span> and Family
            Classification
          </h2>

          <p className="slide-body mt-10 max-w-[900px] border-l-4 border-primary pl-8 text-muted-foreground">
            A static Function Call Graph pipeline — APK → Smali → FCG → GINE+JK encoder → supervised
            contrastive embeddings → XGBoost family prediction, with a deterministic explainability layer.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <Pill tone="primary">FCG · GINE + JK</Pill>
            <Pill tone="accent">SUPCON</Pill>
            <Pill>XGBOOST</Pill>
            <Pill tone="ok">STATIC BASELINE B1</Pill>
          </div>

          <div className="slide-chrome mt-10 flex items-center gap-4 text-muted-foreground">
            <span className="h-2.5 w-2.5 rounded-full bg-ok" />
            STATUS: <span className="text-ok">STATIC PIPELINE TRAINED &amp; EVALUATED</span> · DYNAMIC +
            CROSS-ATTENTION = FUTURE WORK
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-10">
          <div className="slide-kicker text-accent">PRESENTED BY</div>
          <div className="mt-4 flex items-baseline justify-between border-b pb-4">
            <span className="slide-body-lg">Lakshya Singh Kushwah</span>
            <span className="slide-chrome text-muted-foreground">0808DS241074</span>
          </div>

          <div className="slide-kicker mt-10 text-accent">UNDER THE GUIDANCE OF</div>
          <div className="slide-body-lg mt-4 border-b pb-4">Mr. Pankaj Pateriya</div>

          <div className="slide-kicker mt-10 text-accent">DEPARTMENT</div>
          <div className="slide-body mt-4 text-muted-foreground">
            CSE — Data Science
            <br />
            IES, IPS Academy, Indore
          </div>

          <div className="slide-kicker mt-10 text-accent">DEGREE</div>
          <div className="slide-caption mt-3 text-muted-foreground">
            B.Tech (CSE — Data Science), RGPV Bhopal · 2024–28
          </div>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 h-px bg-border" />
    </div>
  );
}
