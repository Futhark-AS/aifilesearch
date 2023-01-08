import { FileValidated } from "@dropzone-ui/react";
import React, { useEffect, useState } from "react";
import { FileDropzone } from "./FileDropzone";
import { Modal } from "@mantine/core";

interface Props {
  setFiles: (files: FileValidated[]) => void;
  files: FileValidated[];
}

export function FileDropzonePassive({
  setFiles,
  files,
}: Props) {
  const updateFiles = (incomingFile: FileValidated[]) => {
    setFiles(incomingFile);
  };

  const [opened, setOpened] = useState(false);
  useEffect(() => {
    const handleDragIn = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setOpened(true);
    };

    document.addEventListener("dragenter", handleDragIn);

    return () => {
      document.removeEventListener("dragenter", handleDragIn);
    };
  }, []);
  // Return a box absolutely positioned in the middle of the page. This box should not be blurred from body element.
  return (
    <Modal
      centered
      onClose={() => setOpened(false)}
      opened={opened}
      title={<div className="text-lg font-semibold">Drag in files</div>}
    >
      <FileDropzone setFiles={updateFiles} files={files} hiddenWhenInactive />
    </Modal>
  );
}
