import React from "react";
import { PromptMatch } from "../requests";
import { PdfViewer } from "@/components/PdfViewer";

interface Props {
  file: string;
  promptResult: PromptMatch;
  highlightText?: string;
}

export const extractFileName = (filePath: string) =>
  filePath.slice(filePath.lastIndexOf("/") + 1);

export function ShowPromptResult({ file, promptResult, highlightText }: Props) {
  return (
    <div className="flex w-full justify-center">
      <PdfViewer
        file={file}
        startPage={promptResult.metadata.page_number}
        selectText={highlightText}
      />
    </div>
  );
}
