import React from "react";
import { HighlightedBox, PdfViewer } from "./PdfViewer";

const hb = {
  boundingBox: {
    x: 96.2304,
    y: 98.91839999999999,
    width: 618.6912,
    height: 52.694399999999995,
  },
  pageNumber: 1,
  type: "image",
  content:
    "2022 (MMXXII) was a common year starting on Saturday of the Gregorian calendar, the 2022nd year of the Common Era (CE) and Anno Domini (AD) designations, the 22nd year of the 3rd millennium and the 21st century, and the 3rd year of the 2020s decade.",
} as HighlightedBox;

const file =
  "https://nlpsearchapi.blob.core.windows.net/users/sid%3A53dc3748787d48b74d937ec95256a515/highlightbox/2022.pdf?st=2023-05-30T18%3A15%3A05Z&se=2023-05-30T20%3A15%3A05Z&sp=r&sv=2018-03-28&sr=b&sig=c11mAmm7ghd7kVwLPGeexmYp8ChiJP4q6du3Dn82OHk%3D";

export const TestPdf = () => {
  return <PdfViewer file={file} highlightedBox={hb} />;
};
