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

import { PromptMatch } from "@/features/projects/requests";
import { highlightBoundingBox } from "@/features/projects/utils";
import { showError } from "@/utils/showError";
import { PDFDocumentProxy } from "pdfjs-dist/types/src/display/api";
import { PDFPageProxy } from "react-pdf";
import { useMeasure } from "react-use";
import { ViewPort, getPageViewports, isDefinedHTMLObjectRef } from "./utils";

const FALLBACK_WIDTH = 600;
interface Props {
  file: string;
  highlightedBox: {
    boundingBox: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
    pageNumber: number;
  } | null;
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
  const getHeight = useCallback(
    () => parentHeight || FALLBACK_WIDTH * 1.5,
    [parentHeight]
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
        page.pageNumber == highlightedBox.pageNumber // highlight on same page
      ) {
        console.log(canvasElementsRef);

        //BRING BACK!
        const canvas = canvasElementsRef.current[highlightedBox.pageNumber-1];

        const ctx = canvas?.getContext("2d");

        console.log(canvas)

        if (!ctx) return showError("Could not highlight text");

        highlightBoundingBox(highlightedBox.boundingBox, ctx, 1);
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
      throw new Error("getPageHeight() called too early");
    }

    const pageViewport = pageViewports[pageIndex];
    const scale = getWidth() / pageViewport.width;
    const actualHeight = pageViewport.height * scale;

    return actualHeight;
  }

  return (
    <div className="mx-auto w-[80ch] border-2 border-sky-500">
      <Document file={file} onLoadSuccess={onDocumentLoadSuccess}>
        {pdf && pageViewports ? (
          <List
            width={getWidth()}
            height={getHeight()}
            estimatedItemSize={getHeight()}
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
