import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

export function Deck({ slides }: { slides: ReactNode[] }) {
  const total = slides.length;
  const [index, setIndex] = useState(0);
  const [dark, setDark] = useState(false);
  const [scale, setScale] = useState(1);
  const [grid, setGrid] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const go = useCallback(
    (n: number) => setIndex((i) => Math.min(total - 1, Math.max(0, n))),
    [total],
  );

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const resize = () => {
      const r = el.getBoundingClientRect();
      setScale(Math.min(r.width / 1920, r.height / 1080));
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " " || e.key === "PageDown") {
        e.preventDefault();
        setIndex((i) => Math.min(total - 1, i + 1));
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        setIndex((i) => Math.max(0, i - 1));
      } else if (e.key.toLowerCase() === "t") {
        setDark((d) => !d);
      } else if (e.key.toLowerCase() === "g") {
        setGrid((g) => !g);
      } else if (e.key.toLowerCase() === "f") {
        if (document.fullscreenElement) document.exitFullscreen();
        else document.documentElement.requestFullscreen?.();
      } else if (e.key === "Escape") {
        setGrid(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [total]);

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-background">
      <div ref={containerRef} className="relative h-full w-full overflow-hidden">
        <div
          className="absolute left-1/2 top-1/2 origin-center"
          style={{
            width: 1920,
            height: 1080,
            marginLeft: -960,
            marginTop: -540,
            transform: `scale(${scale})`,
          }}
        >
          {slides[index]}
        </div>
      </div>

      {/* edge click zones */}
      <button
        aria-label="Previous slide"
        onClick={() => go(index - 1)}
        className="absolute inset-y-0 left-0 w-[7%] cursor-w-resize opacity-0"
      />
      <button
        aria-label="Next slide"
        onClick={() => go(index + 1)}
        className="absolute inset-y-0 right-0 w-[7%] cursor-e-resize opacity-0"
      />

      {/* progress */}
      <div className="absolute inset-x-0 top-0 h-1 bg-transparent">
        <div
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${((index + 1) / total) * 100}%` }}
        />
      </div>

      {/* controls */}
      <div className="absolute bottom-5 right-6 flex items-center gap-2">
        {[
          { label: "☰", onClick: () => setGrid((g) => !g), title: "Overview (G)" },
          { label: dark ? "☀" : "☾", onClick: () => setDark((d) => !d), title: "Theme (T)" },
          {
            label: "⛶",
            onClick: () =>
              document.fullscreenElement
                ? document.exitFullscreen()
                : document.documentElement.requestFullscreen?.(),
            title: "Fullscreen (F)",
          },
          { label: "‹", onClick: () => go(index - 1), title: "Previous" },
          { label: "›", onClick: () => go(index + 1), title: "Next" },
        ].map((b) => (
          <button
            key={b.title}
            title={b.title}
            onClick={b.onClick}
            className="flex h-10 w-10 items-center justify-center rounded-full border bg-card text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary"
          >
            {b.label}
          </button>
        ))}
      </div>

      <div className="absolute bottom-6 left-6 font-mono text-[11px] tracking-[0.18em] text-muted-foreground">
        ← → NAVIGATE · G OVERVIEW · T THEME · F FULLSCREEN
      </div>

      {grid && (
        <div className="absolute inset-0 z-20 overflow-auto bg-background/95 p-10 backdrop-blur">
          <div className="grid grid-cols-3 gap-6">
            {slides.map((s, i) => (
              <button
                key={i}
                onClick={() => {
                  go(i);
                  setGrid(false);
                }}
                className={`relative aspect-video overflow-hidden rounded-lg border text-left transition-colors ${
                  i === index ? "border-primary" : "hover:border-primary/50"
                }`}
              >
                <div
                  className="absolute left-0 top-0 origin-top-left"
                  style={{ width: 1920, height: 1080, transform: "scale(0.2)" }}
                >
                  {s}
                </div>
                <span className="absolute bottom-2 right-3 font-mono text-[11px] text-muted-foreground">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
