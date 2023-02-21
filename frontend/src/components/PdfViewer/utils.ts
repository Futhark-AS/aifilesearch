import {
  PDFDocumentProxy,
  RenderParameters,
} from "pdfjs-dist/types/src/display/api";
import { Ref } from "react";

export type ViewPort = RenderParameters["viewport"];

export const getPageViewports = async (
  pdf: PDFDocumentProxy
): Promise<ViewPort[]> => {
  const pageNumbers = Array.from(new Array(pdf.numPages)).map(
    (_, index) => index + 1
  );

  const nextPageViewports: ViewPort[] = [];
  for (const pageNumber of pageNumbers) {
    const page = await pdf.getPage(pageNumber);
    nextPageViewports.push(page.getViewport({ scale: 1 }));
  }

  console.log(nextPageViewports);

  return nextPageViewports;
};

// See https://stackoverflow.com/questions/65876809/property-current-does-not-exist-on-type-instance-htmldivelement-null
// Helper to narrow down the type of ref to be a React.RefObject<HTMLElement> and check if ref is set
export const isDefinedHTMLObjectRef = (ref: React.Ref<HTMLElement>): ref is {current: HTMLElement} => {
  return ref != null && "current" in ref && ref.current !== null;
};
