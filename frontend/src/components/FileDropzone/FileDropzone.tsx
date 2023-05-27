import React from "react";
import { Dropzone, FileItem, FileValidated } from "@dropzone-ui/react";

interface Props {
  setFiles: (files: FileValidated[]) => void;
  files: FileValidated[];
}

export function FileDropzone({ setFiles, files }: Props) {
  const updateFiles = (incomingFile: FileValidated[]) => {
    setFiles(incomingFile);
  };
  return (
    <Dropzone onChange={updateFiles} value={files} accept="application/pdf" >
      {files.map((file, i) => (
        <FileItem key={i} {...file} preview />
      ))}
    </Dropzone>
  );
}
