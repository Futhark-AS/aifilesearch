import { Button } from "@/components/Button";
import React, { useState } from "react";
import { SideBar } from "./SideBar";
import { ProjectFile } from "@/features/auth/types";

interface FileProps {
  file: ProjectFile;
  fileOnClick?: (file: ProjectFile) => void;
  itemOnActivate?: (result: ProjectFile) => void;
  itemOnDeactivate?: (result: ProjectFile) => void;
  active: boolean;
  last: boolean;
}

function File({
  file,
  fileOnClick,
  itemOnActivate,
  itemOnDeactivate,
  active,
  last = false,
}: FileProps) {
  return (
    <div>
      <button
        onClick={() => {
          fileOnClick && fileOnClick(file);
          active && itemOnDeactivate && itemOnDeactivate(file);
          !active && itemOnActivate && itemOnActivate(file);
        }}
        className={`w-full py-4 text-left ${active && "font-bold "}`}
      >
        <div className="mx-4 flex">
          <div className="overflow-hidden overflow-ellipsis whitespace-nowrap">
            {file.fileName}
          </div>
        </div>
      </button>

      {active && (
        <div className="ml-4">
          <p className="text-sm">Pages: {file.pages}</p>
        </div>
      )}

      {!last && <hr className="my-2" />}
    </div>
  );
}
interface Props {
  files: ProjectFile[];
  fileOnClick?: (file: ProjectFile) => void;
  fileOnActivate?: (file: ProjectFile) => void;
  fileOnDeactivate?: (file: ProjectFile) => void;
  initialSelectedFile: string;
  onUploadFileClick: () => void;
  onClose: () => void;
}

export function ProjectFilesSidebar({
  fileOnClick,
  files,
  onUploadFileClick,
  fileOnActivate,
  fileOnDeactivate,
  onClose,
}: Props) {
  const [selectedFile, setSelectedFile] = useState<number | null>(null);
  return (
    <SideBar title="Files" side="left" onClose={onClose}>
      <div>
        {files.map((file, i) => (
          <File
            active={selectedFile == i}
            file={file}
            itemOnActivate={fileOnActivate}
            itemOnDeactivate={fileOnDeactivate}
            fileOnClick={(file) => {
              fileOnClick && fileOnClick(file);
              const newSelectedFile = selectedFile == i ? null : i;
              setSelectedFile(newSelectedFile);
            }}
            key={file.fileName + i}
            last={i == files.length - 1}
          />
        ))}
        {files.length == 0 && (
          <div className="text-sm italic text-gray-500">
            No files uploaded yet
          </div>
        )}
        <Button
          variant="inverse"
          size="sm"
          className="mt-4"
          onClick={onUploadFileClick}
        >
          Upload file
        </Button>
      </div>
    </SideBar>
  );
}
