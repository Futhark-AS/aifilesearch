import { ReactJSXElement } from "@emotion/react/types/jsx-namespace";
import React, { useCallback, useRef, useState } from "react";
// import default react-pdf entry
import { TextLayerItemInternal } from "react-pdf";
import { Document, Page } from "react-pdf/dist/esm/entry.webpack5";
// import pdf worker as a url, see `next.config.js` and `pdf-worker.js`
import { Button, TextInput } from "@mantine/core";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";

interface Props {
  file: string | File;
  startPage: number;
}
function highlightPattern(text: string, pattern: string) {
  console.log(text, pattern);
  return text.replace(pattern, (value) => `<mark>${value}</mark>`);
}

function jumpToPdfBoundingBox() {
  const element = document.querySelector(".react-pdf__Page__textContent");
  if (!element) return;
  const { top } = element.getBoundingClientRect();
  window.scrollTo({ top });
}

export function PDFViewer({ file, startPage }: Props) {
  const [numPages, setNumPages] = useState<number>(0);
  const [searchText, setSearchText] = useState("");
  const pageRefs = useRef<{ [x: number]: HTMLDivElement }>({});

  // useEffect(() => {
  //   scrollTo({ top: 5000 });
  // }, []);

  function onDocumentLoadSuccess({
    numPages: nextNumPages,
  }: {
    numPages: number;
  }) {
    setNumPages(nextNumPages);
  }

  const textRenderer = useCallback(
    (textItem: TextLayerItemInternal) => {
      return highlightPattern(
        textItem.str,
        searchText
      ) as unknown as ReactJSXElement;
    },
    [searchText]
  );

  const goToPage = (pageNumber: number) => {
    pageRefs.current[pageNumber - 1].scrollIntoView({ behavior: "auto" });
  };

  const goToPageAndOffset = (pageNumber: number, offset: number) => {
    const page = pageRefs.current[pageNumber - 1];
    page.scrollTop = offset;
    page.scrollIntoView({ behavior: "auto" });
  };

  return (
    <div>
      <Document file={file} onLoadSuccess={onDocumentLoadSuccess}>
        {Array.from({ length: 5 }, (_, index) => (
          <div key={index} ref={(el) => el && (pageRefs.current[index] = el)}>
            <Page
              pageNumber={Math.max(startPage - 5 + index + 1, 1+index)}
              renderAnnotationLayer={true}
              renderTextLayer={true}
              customTextRenderer={textRenderer}
            />
            <div>Page {index + 1}</div>
          </div>
        ))}
      </Document>
    </div>
  );
}
