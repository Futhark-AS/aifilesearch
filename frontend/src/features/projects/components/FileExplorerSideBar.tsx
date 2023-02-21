import { Spinner } from "@/components/Spinner";
import React, { useState } from "react";
import { SideBar } from "./SideBar";
import { extractFileName } from "../utils";

type FileT = {
  name: string;
  size: string;
  type: string;
  url: string;
  pages: number;
};

interface Props {
  files: FileT[];
  loadingFiles: string[];
  fileOnClick: (fileName: string) => void;
  initialSelectedFile: string;
}

function File({
  file,
  fileOnClick,
  active,
  loading,
}: {
  file: FileT;
  fileOnClick?: (file: FileT) => void;
  active: boolean;
  loading?: boolean;
}) {
  return (
    <div>
      <button
        onClick={() => {
          fileOnClick && fileOnClick(file);
        }}
        className={`w-full border-t-2 border-l-neutral-500 py-4 text-left ${
          active && "font-bold "
        } ${loading && "animate-pulse"}`}
      >
        <div className="mx-4">
          <span>{extractFileName(file.name)}</span>
          {loading && <Spinner size="sm" className=" ml-2 inline" />}
        </div>
      </button>

      {active && (
        <div className="ml-4">
          <p className="text-sm">Size: {file.size}</p>
          <p className="text-sm">Type: {file.type}</p>
          <p className="text-sm">Pages: {file.pages}</p>
        </div>
      )}
    </div>
  );
}

export function FileExplorerSideBar({
  fileOnClick,
  files,
  loadingFiles,
}: Props) {
  const [selectedFile, setSelectedFile] = useState<number | null>(null);
  return (
    <SideBar title="Files in project" side="left">
      <div>
        {files.map((file, i) => (
          <File
            active={selectedFile == i}
            file={file}
            fileOnClick={(file) => {
              fileOnClick(file.name);
              const newSelectedFile = selectedFile == i ? null : i;
              setSelectedFile(newSelectedFile);
            }}
            key={file.name + i}
          />
        ))}
        {loadingFiles.map((file) => (
          <File
            active={false}
            file={{ name: file, size: "", type: "", url: "", pages: 0 }}
            key={"loading" + file}
            loading
          />
        ))}
      </div>
    </SideBar>
  );
}
