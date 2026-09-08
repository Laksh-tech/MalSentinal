import { createFileRoute } from "@tanstack/react-router";
import { Deck } from "@/components/deck/Deck";
import { Slide1Title } from "@/slides/Slide1Title";
import { Slide2Overview } from "@/slides/Slide2Overview";
import { Slide3Datasets } from "@/slides/Slide3Datasets";
import { Slide4Research } from "@/slides/Slide4Research";
import { Slide5Architecture } from "@/slides/Slide5Architecture";
import { Slide6Results } from "@/slides/Slide6Results";
import { Slide7Next } from "@/slides/Slide7Next";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MalSentinal — Graph-Based Android Malware Detection" },
      {
        name: "description",
        content:
          "Minor project presentation: Function Call Graph based Android malware detection and family classification using GINE+JK, supervised contrastive learning and XGBoost.",
      },
      { property: "og:title", content: "MalSentinal — Graph-Based Android Malware Detection" },
      {
        property: "og:description",
        content:
          "FCG → GINE+JK → SupCon → XGBoost. Static Android malware detection and 32-family classification, presented as an interactive deck.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const TOTAL = 7;

function Index() {
  return (
    <Deck
      slides={[
        <Slide1Title key="1" index={1} total={TOTAL} />,
        <Slide2Overview key="2" index={2} total={TOTAL} />,
        <Slide3Datasets key="3" index={3} total={TOTAL} />,
        <Slide4Research key="4" index={4} total={TOTAL} />,
        <Slide5Architecture key="5" index={5} total={TOTAL} />,
        <Slide6Results key="6" index={6} total={TOTAL} />,
        <Slide7Next key="7" index={7} total={TOTAL} />,
      ]}
    />
  );
}
