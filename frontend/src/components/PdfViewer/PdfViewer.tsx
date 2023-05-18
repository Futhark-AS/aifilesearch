import React, {
  Ref,
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { VariableSizeList as List } from "react-window";

import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import { Document, Page } from "react-pdf/dist/esm/entry.webpack5";

import { highlightBoundingBox } from "@/features/projects/utils";
import { showError } from "@/utils/showError";
import { PDFDocumentProxy } from "pdfjs-dist/types/src/display/api";
import { PDFPageProxy } from "react-pdf";
import { useMeasure } from "react-use";
import { ViewPort, getPageViewports, isDefinedHTMLObjectRef } from "./utils";

const FALLBACK_WIDTH = 600;
export type HighlightedBox =
  | {
      pageNumber: number;
      type: "text";
      content: string;
    }
  | {
      pageNumber: number;
      type: "image";
      content: string;
      boundingBox: {
        x: number;
        y: number;
        width: number;
        height: number;
      };
    };

interface Props {
  file: string;
  highlightedBox: HighlightedBox | null;
}

export const PdfViewer = forwardRef(function PdfViewer(
  { file, highlightedBox }: Props,
  parentRef: Ref<HTMLElement>
) {
  const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null);
  const [pageViewports, setPageViewports] = useState<ViewPort[] | null>(null);
  const canvasElementsRef = useRef<(HTMLCanvasElement | null)[]>([]);
  const [setRef, { width: parentWidth, height: parentHeight }] = useMeasure();

  const getWidth = useCallback(
    () => parentWidth || FALLBACK_WIDTH,
    [parentWidth]
  );

  // Scroll to the page that contains the prompt result if a prompt is given, when the list is loaded
  const onListRendered = useCallback(
    (listElem: List) => {
      if (highlightedBox) {
        listElem.scrollToItem(highlightedBox.pageNumber - 1, "start");
      }
    },
    [highlightedBox]
  );

  const onPdfPageRenderSuccess = useCallback(
    (page: PDFPageProxy) => {
      // If given a result to highlight If the page is the one that contains the prompt result, highlight the text
      if (
        highlightedBox &&
        highlightedBox.type == "image" &&
        page.pageNumber == highlightedBox.pageNumber // highlight on same page
      ) {
        const canvas = canvasElementsRef.current[page.pageNumber - 1];

        const ctx = canvas?.getContext("2d");

        if (!canvas || !ctx) return showError("Could not highlight text");

        const CONSTANT_RATIO = 1.5;

        const ratio = CONSTANT_RATIO * (page.width / page.originalWidth);
        const { x, y, width, height } = highlightedBox.boundingBox;

        // highlightBoundingBox({ x, y, width: highlightedBox.boundingBox.width, height: highlightedBox.boundingBox.height }, ctx, 1);
        highlightBoundingBox(
          {
            x: x * ratio,
            y: y * ratio,
            width: width * ratio,
            height: height * ratio,
          },
          ctx
        );
      }
    },
    [highlightedBox]
  );

  // Use ref for deciding width if its given.
  useEffect(() => {
    if (isDefinedHTMLObjectRef(parentRef)) {
      setRef(parentRef.current);
    }
  }, [parentRef, setRef]);

  /**
   * React-Window cannot get item size using async getter, therefore we need to
   * calculate them ahead of time.
   */
  useEffect(() => {
    setPageViewports(null);
    if (pdf) {
      getPageViewports(pdf)
        .then((data) => setPageViewports(data))
        .catch((error) => {
          console.log(error);
          showError("Could not load PDF");
        });
    }
  }, [pdf]);

  function onDocumentLoadSuccess(nextPdf: PDFDocumentProxy) {
    setPdf(nextPdf);
  }

  function getPageHeight(pageIndex: number) {
    if (!pageViewports) {
      return 0; // called to early, before pageViewports are calculated
    }

    const pageViewport = pageViewports[pageIndex];

    if (!pageViewport) return 0;

    const scale = getWidth() / pageViewport.width;
    const actualHeight = pageViewport.height * scale;

    return actualHeight;
  }

  return (
    <div>
      <Document file={file} onLoadSuccess={onDocumentLoadSuccess}>
        {pdf && pageViewports ? (
          <List
            width={getWidth()}
            height={getPageHeight(0)}
            estimatedItemSize={getPageHeight(0)}
            itemCount={pdf.numPages}
            itemSize={getPageHeight}
            ref={(listRef) => listRef && onListRendered(listRef)}
          >
            {({ index, style }) => (
              <div style={style}>
                <Page
                  onRenderSuccess={onPdfPageRenderSuccess}
                  pageIndex={index}
                  width={getWidth()}
                  canvasRef={(el) => {
                    canvasElementsRef.current[index] = el;
                  }}
                />
              </div>
            )}
          </List>
        ) : (
          <div>There was an error</div>
        )}
      </Document>
    </div>
  );
});
