import { ReactJSXElement } from "@emotion/react/types/jsx-namespace";
import React, { useCallback, useRef } from "react";
import { useState, useEffect } from "react";
// import default react-pdf entry
import { TextLayerItemInternal } from "react-pdf";
import { Document, Page } from "react-pdf/dist/esm/entry.webpack5";
// import pdf worker as a url, see `next.config.js` and `pdf-worker.js`
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import { Button, TextInput } from "@mantine/core";

interface Props {
  file: string | File;
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

export function PDFViewer({ file }: Props) {
  const [numPages, setNumPages] = useState<number>(0);
  const [searchText, setSearchText] = useState("");
  const pageRefs = useRef<{ [x: number]: HTMLDivElement }>({});
  const inputRef = useRef<HTMLInputElement>(null);
  const offsetInpRef = useRef<HTMLInputElement>(null);

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

  const START = 30;

  return (
    <div>
      <button onClick={() => goToPage(Number(inputRef.current?.value))}>
        JUMP
      </button>
      <Button
        variant="outline"
        onClick={() =>
          goToPageAndOffset(
            Number(inputRef.current?.value),
            Number(offsetInpRef.current?.value)
          )
        }
      >
        JUMP TO OFFSET
      </Button>
      <TextInput ref={inputRef} defaultValue="3" label="Page" />
      <TextInput ref={offsetInpRef} defaultValue="10" label="offset" />
      <Document file={file} onLoadSuccess={onDocumentLoadSuccess}>
        {Array.from({ length: 10 }, (_, index) => (
          <div key={index} ref={(el) => el && (pageRefs.current[index] = el)}>
            <Page
              pageNumber={START + index + 1}
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
