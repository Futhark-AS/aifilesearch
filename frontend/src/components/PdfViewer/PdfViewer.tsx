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
import { HighlightBoundingBox } from './types';

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
        console.log(canvasElementsRef.current)
        const canvas = canvasElementsRef.current[page.pageNumber - 1];

        const ctx = canvas?.getContext("2d");

        if (!canvas || !ctx) return showError("Could not highlight text");

        const xPercent = highlightedBox.boundingBox.x / page.originalWidth
        const yPercent = highlightedBox.boundingBox.y / page.originalHeight

        const x = xPercent * page.width
        const y = yPercent * page.height

        const width = xPercent * highlightedBox.boundingBox.width
        const height = xPercent * highlightedBox.boundingBox.height

console.log("xPercent" + xPercent, "yPercent" + yPercent, "x" + x, "y" + y, "width" + width, "height" + height)

        const ratio = canvas.width / page.originalWidth;

        console.log("ratio" + ratio)

        // highlightBoundingBox({ x, y, width: highlightedBox.boundingBox.width, height: highlightedBox.boundingBox.height }, ctx, 1);
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
        {/* {pdf && pageViewports ? (
          <List
            width={}
            height={getHeight()}
            estimatedItemSize={getHeight()}
            itemCount={pdf.numPages}
            itemSize={getPageHeight}
            ref={(listRef) => listRef && onListRendered(listRef)}
          >
            {({ index, style }) => (
              <div style={style}> */}
                <Page
                  onRenderSuccess={onPdfPageRenderSuccess}
                  pageIndex={((highlightedBox?.pageNumber || 1) - 1) || 0}
                  // width={getWidth()}
                  canvasRef={(el) => {
                    canvasElementsRef.current[((highlightedBox?.pageNumber || 1) - 1) || 0] = el;
                  }}
                />
              {/* </div>
            )}
          </List>
        ) : (
          <div>There was an error</div>
        )} */}
      </Document>
    </div>
  );
});
