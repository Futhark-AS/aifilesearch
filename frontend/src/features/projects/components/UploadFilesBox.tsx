import { Button } from "@/components/Button";
import { FileDropzone } from "@/components/FileDropzone";
import { selectUser } from "@/features/auth/authSlice";
import { useAppSelector } from "@/redux/hooks";
import { showError } from "@/utils/showError";
import { FileValidated } from "@dropzone-ui/react";
import { Modal } from "@mantine/core";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { handleFileUpload, pdfNumberOfPages } from "../projectAPI";

type FileInfo = {
  name: string;
  pages: number;
  price: number;
};

const extractFileInfo = async (file: FileValidated): Promise<FileInfo> => {
  // talk with backend to get the price and pages
  const pages = await pdfNumberOfPages(file.file);
  const price = pages * 1.5 * 100 / 1000;
  return {
    name: file.file.name,
    pages: pages,
    price: price,
  };
};

interface Props {
  open: boolean;
  setOpen(open: boolean): void;
}

export function UploadFilesBox({ open, setOpen }: Props) {
  const { id: projectName } = useParams<{ id: string }>() as { id: string };
  const user = useAppSelector((state) => selectUser(state));
  const [files, setFiles] = useState<FileValidated[]>([]);
  const [fileInfo, setFileInfo] = useState<FileInfo[]>([]);

  const close = () => {
    setOpen(false);
    setConfirmationOpened(false);
    setFiles([]);
  };
  const getFilePrice = () => {
    return fileInfo.reduce((acc, file) => acc + file.price, 0);
  };

  const updateFiles = (incomingFile: FileValidated[]) => {
    setFiles(incomingFile);
  };

  useEffect(() => {
    const fetchFileInfo = async () => {
      const fileInfo = await Promise.all(files.map(extractFileInfo));
      setFileInfo(fileInfo);
    };
    fetchFileInfo();
  }, [files]);

  const [confirmationOpened, setConfirmationOpened] = useState(false);

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

  const handleFilesUpload = async () => {
    // call backend with files to upload

    try {
      handleFileUpload(
        files.map((file) => file.file),
        user.uid,
        projectName
      );
    } catch (error) {
      showError(
        "Unfortunately, there occured an error while uploading the file. Please try again later."
      );
    }

    close();
  };

  // Return a box absolutely positioned in the middle of the page. This box should not be blurred from body element.
  return (
    <Modal
      centered
      onClose={() => {
        setOpen(false);
        // remove files
        setFiles([]);
      }}
      opened={open}
      title={<div className="text-lg font-semibold">Upload files</div>}
    >
      <Modal
        onClose={() => setConfirmationOpened(false)}
        opened={confirmationOpened}
        title={<div className="text-lg font-semibold">Confirmation</div>}
        centered={true}
      >
        <div>
          <div className="text-sm text-gray-600">
            Total price: {getFilePrice()} credits
          </div>
          {
            user.credits < getFilePrice() ? (
              <div className="text-sm text-red-600">
                You dont have enough credits to buy these files. 
              </div>
            ) : (
              <div className="text-sm text-gray-500">
                Your remaining balance after buying: {getFilePrice() - Number(user.credits)}
              </div>
            ) 
          }
        </div>
        <div className="mt-2 flex">
          <Button
            className="mr-2"
            variant="primary"
            onClick={handleFilesUpload}
            disabled={user.credits < getFilePrice()}
          >
            Upload
          </Button>
          <Button variant="danger" onClick={() => setConfirmationOpened(false)}>
            Cancel
          </Button>
        </div>
      </Modal>
      <FileDropzone setFiles={updateFiles} files={files} />
      <Button
        onClick={() => {
          setConfirmationOpened(true);
        }}
        disabled={files.length == 0}
        className="mx-auto block"
      >
        Upload Files
      </Button>
    </Modal>
  );
}
