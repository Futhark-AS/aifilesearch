import React, { useState } from "react";
import { useDisclosure } from "../../../hooks/useDisclosure";
import { ArrowRightCircleIcon, XCircleIcon } from "@heroicons/react/24/outline";
import { Spinner } from "@/components/Spinner";

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
  fileOnClick: (file: string) => void;
  initialSelectedFile: string;
}

function File({
  file,
  fileOnClick,
  active,
  loading,
}: {
  file: FileT;
  fileOnClick: (file: FileT) => void;
  active: boolean;
  loading?: boolean;
}) {
  return (
    <div>
      <button
        onClick={() => {
          fileOnClick(file);
        }}
        className={`w-full border-t-2 border-l-neutral-500 py-4 text-left ${
          active && "font-bold "
        } ${loading && "animate-pulse"}`}
      >
        <div className="mx-4">
          <span>{file.name}</span>
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
  const { isOpen, toggle } = useDisclosure(true);
  return (
    <section className="max-w-3xl overflow-auto bg-slate-600 pt-4 text-white">
      <div className="flex h-16 items-center justify-between px-4">
        {isOpen && <div className="mr-4">Files in project</div>}
        {isOpen ? (
          <XCircleIcon onClick={toggle} className="w-6 cursor-pointer" />
        ) : (
          <ArrowRightCircleIcon
            onClick={toggle}
            className="w-6 cursor-pointer"
          />
        )}
      </div>
      {isOpen &&
        files
          .map((file, i) => (
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
          ))
          .concat(
            loadingFiles.map((file, i) => (
              <File
                active={false}
                file={{ name: file, size: "", type: "", url: "", pages: 0 }}
                fileOnClick={() => null}
                key={"loading" + file}
                loading
              />
            ))
          )}
    </section>
  );
}
