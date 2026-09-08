import { createFileRoute, Link } from "@tanstack/react-router";
import { LiveDemo } from "@/components/demo/LiveDemo";

export const Route = createFileRoute("/demo")({
  head: () => ({
    meta: [
      { title: "MalSentinal — Live Demo" },
      {
        name: "description",
        content:
          "Interactive demo: run the MalSentinal graph-based malware detection pipeline on a sample APK and see the classification result live.",
      },
      { property: "og:title", content: "MalSentinal — Live Demo" },
      {
        property: "og:description",
        content:
          "Run the FCG → GINE+JK → XGBoost pipeline on a sample graph and watch the classification happen.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DemoPage,
});

function DemoPage() {
  return <LiveDemo />;
}
