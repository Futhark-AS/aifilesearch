import React from "react";
import { PromptMatch } from "../requests";
import { PdfViewer } from "@/components/PdfViewer";

interface Props {
  file: string;
  promptResult: PromptMatch;
}

export const extractFileName = (filePath: string) =>
  filePath.slice(filePath.lastIndexOf("/") + 1);

export function ShowPromptResult({ file, promptResult }: Props) {
  return (
    <div className="w-full flex justify-center">
      <PdfViewer file={file} startPage={promptResult.metadata.page_number} />
    </div>
  );
}
