import { PDFViewer } from "@/components/PdfViewer";
import React from "react";
import { PromptMatch } from "../requests";

interface Props {
  file: string | File;
  promptResult: PromptMatch;
}

export const extractFileName = (filePath: string) =>
  filePath.slice(filePath.lastIndexOf("/") + 1);

export function ShowPromptResult({ file, promptResult }: Props) {
  return (
    <div>
      <h1 className="text-xl font-semibold">
        {extractFileName(promptResult.metadata.file_name)}
      </h1>
      <div>{promptResult.metadata.content}</div>
      <i className="text-xs">Page {promptResult.metadata.page_number}</i>
      <PDFViewer file={file} startPage={promptResult.metadata.page_number} />
    </div>
  );
}
