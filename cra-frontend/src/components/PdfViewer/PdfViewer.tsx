import React, { useCallback, useEffect, useRef, useState } from "react";
import { VariableSizeList as List } from "react-window";

import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import { Document, Page } from "react-pdf/dist/esm/entry.webpack5";

type ViewPort = RenderParameters["viewport"];

import {
  PDFDocumentProxy,
  RenderParameters,
} from "pdfjs-dist/types/src/display/api";
import { TextLayerItemInternal } from "react-pdf";

const width = 400;
const height = width * 1.5;

interface Props {
  file: string;
  startPage: number;
  selectText?: string;
}

function highlightPattern(pdfLine: string, text: string) {
  const textToHighlight = pdfLine.trim();
  // 1. If a line is contained in the text, highlight the whole line
  if (text.includes(textToHighlight)) {
    return `<mark>${textToHighlight}</mark>`;
  }

  // 2. If some part of the pdfLine is contained in the text, highlight it as long as it as long as:
  // - it is at least one whole word

  // - it is the start or the end of the text
  let highlightedLine = textToHighlight;
  let match;
  const pattern = new RegExp(`(\\b${text}\\b)`, "gi");
  while ((match = pattern.exec(textToHighlight)) !== null) {
    // Check if the match starts at the beginning of the line or ends at the end of the line
    if (match.index === 0 || match.index + match[0].length === textToHighlight.length) {
      highlightedLine = highlightedLine.replace(
        match[0],
        `<mark>${match[0]}</mark>`
      );
    }
  }
  return highlightedLine;
}

export function PdfViewer({ file, startPage, selectText }: Props) {
  const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null);
  const [pageViewports, setPageViewports] = useState<ViewPort[] | null>(null);
  const listRef = useRef<List | null>(null);
  const [rendered, setRendered] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);

  const textRenderer = useCallback(
    (textItem: TextLayerItemInternal) =>
      highlightPattern(
        textItem.str,
        selectText || ""
      ) as unknown as JSX.Element,
    [selectText]
  );

  useEffect(() => {
    if (listRef.current && !hasScrolled) {
      listRef.current.scrollToItem(startPage-1, "start");
      setHasScrolled(true);
    }
  }, [rendered, hasScrolled, startPage]);

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

  return (
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
                onRenderSuccess={(page) =>
                  console.log(`Page ${page.pageNumber} rendered`)
                }
                pageIndex={index}
                customTextRenderer={textRenderer}
                width={width}
              />
            </div>
          )}
        </List>
      ) : null}
    </Document>
  );
}
