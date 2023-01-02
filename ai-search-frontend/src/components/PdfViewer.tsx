import React from "react";

import { Document, Page } from "react-pdf";

const PdfViewer = ({
  url,
  width,
  pageNumber,
}: {
  url: string;
  width: number;
  pageNumber: number;
}) => (
  <Document file={url}>
    <Page pageIndex={pageNumber} width={width} />
  </Document>
);

export default PdfViewer;
