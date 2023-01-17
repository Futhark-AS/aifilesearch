import React, { useEffect, useRef, useState } from "react";
import {
  VariableSizeList as List,
  ListChildComponentProps,
} from "react-window";

import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import { Document, Page } from "react-pdf/dist/esm/entry.webpack5";

type ViewPort = RenderParameters["viewport"];

import {
  PDFDocumentProxy,
  RenderParameters,
} from "pdfjs-dist/types/src/display/api";

const width = 400;
const height = width * 1.5;

function Row({ index, style }: ListChildComponentProps) {
  return (
    <div style={style}>
      <Page
        onRenderSuccess={(page) =>
          console.log(`Page ${page.pageNumber} rendered`)
        }
        pageIndex={index}
        width={width}
      />
    </div>
  );
}

interface Props {
  file: string;
  startPage: number;
}

export function PdfViewer({ file, startPage }: Props) {
  const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null);
  const [pageViewports, setPageViewports] = useState<ViewPort[] | null>(null);
  const listRef = useRef<List | null>(null);
  const [rendered, setRendered] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);

  useEffect(() => {
    if (listRef.current && !hasScrolled) {
      listRef.current.scrollToItem(startPage, "start");
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
          {Row}
        </List>
      ) : null}
    </Document>
  );
}
