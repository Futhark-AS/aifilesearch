import React, { useEffect, useRef, useState } from "react";
import { VariableSizeList as List } from "react-window";

import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import { Document, Page } from "react-pdf/dist/esm/entry.webpack5";

type ViewPort = RenderParameters["viewport"];

import { PromptMatch } from "@/features/projects/requests";
import {
  PDFDocumentProxy,
  RenderParameters,
} from "pdfjs-dist/types/src/display/api";

const width = 400;
const height = width * 1.5;

interface Props {
  file: string;
  promptResult: PromptMatch;
}

type BoundingBox = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  x3: number;
  y3: number;
  x4: number;
  y4: number;
};

function highlightBoundingBox(bb: BoundingBox, ctx: CanvasRenderingContext2D) {
  const { x1, x2, x3, x4, y1, y2, y3, y4 } = bb;
  console.log("hello");
  console.log("drawing: ", x1, y1, x2, y2);
  console.log(bb);

  const inchToPixel = 96

  const x = x1 * inchToPixel
  const y = y1 * inchToPixel
  const width = (x2 - x1) * inchToPixel
  const height = (y3 - y1) * inchToPixel
  console.log(x, y, width, height)
  ctx.save();
  ctx.globalAlpha = 0.2;
  ctx.fillStyle = "yellow";
  ctx.fillRect(x, y, width, height);
  ctx.restore();
}

function test() {
  console.log("testing testing");
}

// function highlightPattern(pdfLine: string, text: string) {
//   const textToHighlight = pdfLine.trim();
//   // 1. If a line is contained in the text, highlight the whole line
//   if (text.includes(textToHighlight)) {
//     return `<mark>${textToHighlight}</mark>`;
//   }

//   // 2. If some part of the pdfLine is contained in the text, highlight it as long as it as long as:
//   // - it is at least one whole word

//   // - it is the start or the end of the text
//   let highlightedLine = textToHighlight;
//   let match;
//   const pattern = new RegExp(`(\\b${text}\\b)`, "gi");
//   while ((match = pattern.exec(textToHighlight)) !== null) {
//     // Check if the match starts at the beginning of the line or ends at the end of the line
//     if (
//       match.index === 0 ||
//       match.index + match[0].length === textToHighlight.length
//     ) {
//       highlightedLine = highlightedLine.replace(
//         match[0],
//         `<mark>${match[0]}</mark>`
//       );
//     }
//   }
//   return highlightedLine;
// }

export function PdfViewer({ file, promptResult }: Props) {
  const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null);
  const [pageViewports, setPageViewports] = useState<ViewPort[] | null>(null);
  const listRef = useRef<List | null>(null);
  const [rendered, setRendered] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);

  const canvasElementsRef = useRef<(HTMLCanvasElement | null)[]>([]);

  // const textRenderer = useCallback(
  //   (textItem: TextLayerItemInternal) =>
  //     highlightPattern(
  //       textItem.str,
  //       selectText || ""
  //     ) as unknown as JSX.Element,
  //   [selectText]
  // );

  useEffect(() => {
    if (listRef.current && !hasScrolled) {
      listRef.current.scrollToItem(
        promptResult.metadata.page_number - 1,
        "start"
      );
      setHasScrolled(true);
    }
  }, [rendered, hasScrolled, promptResult.metadata.page_number]);

  /**
   * React-Window cannot get item size using async getter, therefore we need to
   * calculate them ahead of time.
   */
  useEffect(() => {
    setPageViewports(null);

    if (!pdf) {
      return;
    }

    (async () => {
      const pageNumbers = Array.from(new Array(pdf.numPages)).map(
        (_, index) => index + 1
      );

      const nextPageViewports: ViewPort[] = [];
      for (const pageNumber of pageNumbers) {
        const page = await pdf.getPage(pageNumber);
        nextPageViewports.push(page.getViewport({ scale: 1 }));
      }

      setPageViewports(nextPageViewports);
    })();
  }, [pdf]);

  function onDocumentLoadSuccess(nextPdf: PDFDocumentProxy) {
    setPdf(nextPdf);
  }

  function getPageHeight(pageIndex: number) {
    if (!pageViewports) {
      throw new Error("getPageHeight() called too early");
    }

    const pageViewport = pageViewports[pageIndex];
    const scale = width / pageViewport.width;
    const actualHeight = pageViewport.height * scale;

    return actualHeight;
  }

  // canvasElementsRef.current.forEach((el, i) => {
  //   if (el) {
  //     const ctx = el.getContext("2d");
  //     if (ctx) {
  //       console.log(ctx);
  //       ctx.fillStyle = "red";
  //       ctx?.fillRect(20, 20, 150, 100);
  //       ctx?.arc(100, 75, 50, 0, 2 * Math.PI);
  //     } else {
  //       console.log("no ctx");
  //     }
  //   } else {
  //     console.log("no canvas", i);
  //   }
  // });

  return (
    <div>
      <Document file={file} onLoadSuccess={onDocumentLoadSuccess}>
        {pdf && pageViewports ? (
          <List
            width={width}
            height={height}
            estimatedItemSize={height}
            itemCount={pdf.numPages}
            itemSize={getPageHeight}
            ref={listRef}
            onItemsRendered={() => setRendered(true)}
          >
            {({ index, style }) => (
              <div style={style}>
                <Page
                  onRenderSuccess={(page) => {
                    console.log(`Page ${page.pageNumber} rendered`);

                    if (index == promptResult.metadata.page_number - 1) {
                      const canvas =
                        canvasElementsRef.current[
                          promptResult.metadata.page_number - 1
                        ];
                      const ctx = canvas?.getContext("2d");
                      const boundingBox = promptResult.metadata.bounding_box[0];


                      if(ctx) {

                      highlightBoundingBox(
                        {
                          x1: boundingBox[0].x,
                          y1: boundingBox[0].y,
                          x2: boundingBox[1].x,
                          y2: boundingBox[1].y,
                          x3: boundingBox[2].x,
                          y3: boundingBox[2].y,
                          x4: boundingBox[3].x,
                          y4: boundingBox[3].y,
                        },
                        ctx
                      );
                      } else {
                        // TODO: add notification for not being able to highlight match
                        console.error("No context found for canvas")
                      }
                    }
                  }}
                  pageIndex={index}
                  width={width}
                  canvasRef={(el) => {
                    canvasElementsRef.current[index] = el;
                  }}
                />
              </div>
            )}
          </List>
        ) : null}
      </Document>
    </div>
  );
}
