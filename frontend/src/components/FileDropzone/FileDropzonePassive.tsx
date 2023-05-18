import { Dropzone, FileItem, FileValidated } from "@dropzone-ui/react";
import { Modal } from "@mantine/core";
import React, { useEffect, useState } from "react";
import { useQuery } from "react-query";
import { Button } from "../Button";

import { useParams } from "react-router-dom";
import { extractFileName } from "@/features/projects/utils";

interface Props {
  setFiles: (files: FileValidated[]) => void;
  files: FileValidated[];
  handleFileUpload: () => void;
  open: boolean;
  setOpen(open: boolean): void;
  handleFilesCheckOut: () => Promise<{
    clientSecret: string;
    data: {
      name: string;
      price: number;
    }[];
  }>;
}

export function FileDropzonePassive({
  setFiles,
  files,
  handleFileUpload,
  handleFilesCheckOut,
  open,
  setOpen,
}: Props) {
  const updateFiles = (incomingFile: FileValidated[]) => {
    setFiles(incomingFile);
  };

  const [clientSecret, setClientSecret] = useState("");
  const { id: projectName } = useParams<{ id: string }>() as { id: string };
  const [prices, setPrices] = useState<{ name: string; price: number }[]>([]);

  useEffect(() => {
    const handleDragIn = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setOpen(true);
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
      onClose={() => setOpen(false)}
      opened={open}
      title={<div className="text-lg font-semibold">Upload files</div>}
    >
      <Dropzone onChange={updateFiles} value={files}>
        {files.map((file, i) => (
          <FileItem key={i} {...file} preview />
        ))}
      </Dropzone>
      <Button
        onClick={async () => {
          const res = await handleFilesCheckOut();
          setClientSecret(res.clientSecret);
          setPrices(res.data);
        }}
      >
        Check Out
      </Button>
      <div>
        {prices && (
          // Loop over price of each file and display it, and then display the total price
          <div>
            <h3 className="text-lg font-semibold">Price Estimation</h3>
            {prices.map((price, i) => (
              <div key={i}>
                {extractFileName(price.name)} - {price.price}
              </div>
            ))}
            <div>
              Total:{" "}
              {prices.reduce((acc, curr) => {
                return acc + curr.price;
              }, 0)}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
