import { PDFViewer } from "@/components/PdfViewer";
import React from "react";
import { PromptMatch } from "../requests";

interface Props {
  file: string | File;
  promptResult: PromptMatch;
}

export function ShowPromptResult({ file, promptResult }: Props) {
  return (
    <div>
      <h1 className="text-xl font-semibold">
        {promptResult.metadata.file_name.slice(
          promptResult.metadata.file_name.lastIndexOf("/") + 1
        )}
      </h1>
      <div>{promptResult.metadata.content}</div>
      <i className="text-xs">Page {promptResult.metadata.page_number}</i>
      <PDFViewer file={file} startPage={promptResult.metadata.page_number} />
    </div>
  );
}
