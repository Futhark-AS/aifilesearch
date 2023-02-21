import cryptoPdf from "@/assets/test-pdf.pdf"
import enfatizarPdf from "@/assets/enfatizar.pdf"
import React, { useRef } from "react";
import { PdfViewer } from "./PdfViewer";
import { exampleMatchesResponseCryptomonedasPDF, testEnfatizar } from './testdata';
import { transfromApiMatchesV1 } from '../../features/projects/requests';

const mockDataCryptomonedas = transfromApiMatchesV1({matches: exampleMatchesResponseCryptomonedasPDF})[0]
const mockDataEnfatizar = transfromApiMatchesV1({matches: testEnfatizar})[0]

const mockData = mockDataCryptomonedas
const pdf  = cryptoPdf

export function PdfViewerTest() {
  const ref = useRef(null);
  return (
    <div className="flex">
    <PdfViewer
      file={pdf}
      highlightedBox={{
        boundingBox: {
          height: mockData.highlightBoundingBox.height*1.5,
          width: mockData.highlightBoundingBox.width*1.5,
          x: mockData.highlightBoundingBox.x*1.5,
          y: mockData.highlightBoundingBox.y*1.5,
        },
        pageNumber: mockData.pageNumber,
      }}
      ref={ref}
    />
    </div>
  );
}
