import { useScrollIntoView } from "@mantine/hooks";
import React, { useCallback } from "react";
import { useState, useEffect } from "react";
// import default react-pdf entry
import { TextLayerItemInternal } from "react-pdf";
import { Document, Page } from "react-pdf/dist/esm/entry.webpack5";
// import pdf worker as a url, see `next.config.js` and `pdf-worker.js`
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";

interface Props {
  file: string | File;
}
function highlightPattern(text: string, pattern: string) {
  return text.replace(pattern, (value) => `<mark>${value}</mark>`);
}

export function PDFViewer({ file }: Props) {
  const [numPages, setNumPages] = useState<number>(0);
  const [searchText, setSearchText] = useState(
    "realizar transacciones directas entre sí, sin necesidad de que los bancos actúen"
  );
  useEffect(() => {
    scrollTo({ top: 5000 });
  }, []);

  const textRenderer = useCallback<
    (layer: TextLayerItemInternal) => JSX.Element
  >(
    (textItem) => {
      console.log(textItem);
      const result = highlightPattern(textItem.str, searchText);
      console.log(result);
      return <div>hei</div>;
    },
    [searchText]
  );

  function onDocumentLoadSuccess({
    numPages: nextNumPages,
  }: {
    numPages: number;
  }) {
    setNumPages(nextNumPages);
  }

  return (
    <Document file={file} onLoadSuccess={onDocumentLoadSuccess}>
      {Array.from({ length: numPages }, (_, index) => (
        <div key={index}>
          <Page
            pageNumber={index + 1}
            renderAnnotationLayer={true}
            renderTextLayer={true}
            customTextRenderer={textRenderer}
          />
          <div>Page {index + 1}</div>
        </div>
      ))}
    </Document>
  );
}
