import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Deck } from "./components/deck/Deck";
import { Slide1Title } from "./slides/Slide1Title";
import { Slide2Overview } from "./slides/Slide2Overview";
import { Slide3Datasets } from "./slides/Slide3Datasets";
import { Slide4Research } from "./slides/Slide4Research";
import { Slide5Architecture } from "./slides/Slide5Architecture";
import { Slide6Results } from "./slides/Slide6Results";
import { Slide7Next } from "./slides/Slide7Next";
import "./styles.css";

const slides = [
  <Slide1Title key="1" index={1} total={7} />,
  <Slide2Overview key="2" index={2} total={7} />,
  <Slide3Datasets key="3" index={3} total={7} />,
  <Slide4Research key="4" index={4} total={7} />,
  <Slide5Architecture key="5" index={5} total={7} />,
  <Slide6Results key="6" index={6} total={7} />,
  <Slide7Next key="7" index={7} total={7} />,
];

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Deck slides={slides} />
  </StrictMode>,
);
