import React from "react";
import { useState } from "react";
// import default react-pdf entry
import { Document, Page } from "react-pdf/dist/esm/entry.webpack5";
// import pdf worker as a url, see `next.config.js` and `pdf-worker.js`

interface Props {
  file: string | File;
}

export function PDFViewer({ file }: Props) {
  const [numPages, setNumPages] = useState<number>(0);

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
        <Page
          key={`page_${index + 1}`}
          pageNumber={index + 1}
          renderAnnotationLayer={false}
          renderTextLayer={true}
        />
      ))}
    </Document>
  );
}
