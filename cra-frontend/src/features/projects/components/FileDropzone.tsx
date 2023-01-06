import React from "react";
import { Dropzone, FileItem, FileValidated } from "@dropzone-ui/react";

interface Props {
  setFiles: (files: FileValidated[]) => void;
  files: FileValidated[];
  hiddenWhenInactive: boolean
}

export function FileDropzone({ setFiles, files, hiddenWhenInactive }: Props) {
  const updateFiles = (incomingFile: FileValidated[]) => {
    setFiles(incomingFile);
  };
  return (
    <Dropzone onChange={updateFiles} value={files}>
      {files.map((file, i) => (
        <FileItem key={i} {...file} preview />
      ))}
    </Dropzone>
  );
}
