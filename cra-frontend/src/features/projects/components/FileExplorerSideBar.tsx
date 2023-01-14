import React, { useState } from "react";
import { useDisclosure } from "../../../hooks/useDisclosure";
import { ArrowRightCircleIcon, XCircleIcon } from "@heroicons/react/24/outline";

interface Props {
  files: {
    name: string;
    size: string;
    type: string;
    url: string;
    pages: number;
  }[];
  fileOnClick: (file: string) => void;
  initialSelectedFile: string;
}

export function FileExplorerSideBar({
  fileOnClick,
  files,
  initialSelectedFile,
}: Props) {
  const [selectedFile, setSelectedFile] = useState(initialSelectedFile);
  const { isOpen, toggle } = useDisclosure(true);
  return (
    <section className="overflow-auto bg-slate-600 pt-4 text-white max-w-3xl">
      <div className="flex justify-between px-4 items-center h-16">
        {isOpen && <div className="mr-4">Files in project</div>}
        {isOpen ? (

        <XCircleIcon onClick={toggle} className="w-6 cursor-pointer" />
        ) : (
        <ArrowRightCircleIcon onClick={toggle} className="w-6 cursor-pointer" />

        )}
      </div>
      {isOpen &&
        files.map((file) => (
          <div key={file.name}>
            <button
              onClick={() => {
                fileOnClick(file.name);
                setSelectedFile(file.name);
              }}
              className={`w-full border-t-2 border-l-neutral-500 py-4 text-left ${
                selectedFile == file.name && "font-bold"
              }`}
            >
              <span className="ml-4">{file.name}</span>
            </button>

            {file.name == selectedFile && (
              <div className="ml-4">
                <p className="text-sm">Size: {file.size}</p>
                <p className="text-sm">Type: {file.type}</p>
                <p className="text-sm">Pages: {file.pages}</p>
              </div>
            )}
          </div>
        ))}
    </section>
  );
}
