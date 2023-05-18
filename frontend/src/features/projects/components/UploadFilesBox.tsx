import { Button } from "@/components/Button";
import { FileDropzone } from "@/components/FileDropzone";
import { selectUser } from "@/features/auth/authSlice";
import { useAppSelector } from "@/redux/hooks";
import { showError } from "@/utils/showError";
import { FileValidated } from "@dropzone-ui/react";
import { Modal } from "@mantine/core";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { handleFileUpload } from "../projectAPI";

type FileInfo = {
  name: string;
  size: number;
  pages: number;
  price: number;
};

const extractFileInfo = (file: FileValidated): FileInfo => {
  // talk with backend to get the price and pages
  return {
    name: "File 1",
    size: 1200,
    pages: 10,
    price: 10,
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
    setConfirmationOpened(false)
    setFiles([]);
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
      onClose={() => setOpen(false)}
      opened={open}
      title={<div className="text-lg font-semibold">Upload files</div>}
    >
      <Modal
        onClose={() => setConfirmationOpened(false)}
        opened={confirmationOpened}
        title={
          <div className="text-lg font-semibold">
            Do you really want to upload these files?
          </div>
        }
        centered={true}
      >
        <div>
          {/* <div>
            Total price: {fileInfo.reduce((acc, file) => acc + file.price, 0)}
          </div>
          <div>Remaining balance: 100</div> */}
          Your balance will be updated after the files are uploaded.
        </div>
        <div className="mt-2 flex">
          <Button
            className="mr-2"
            variant="primary"
            onClick={handleFilesUpload}
          >
            Yes
          </Button>
          <Button variant="danger" onClick={() => setConfirmationOpened(false)}>
            No
          </Button>
        </div>
      </Modal>
      <FileDropzone setFiles={updateFiles} files={files} />
      {/* <div className="my-4 rounded-md p-4 shadow-md">
        <h4 className="mt-4 text-sm font-semibold">File info</h4>
        <Table verticalSpacing="xs" fontSize="xs">
          <thead>
            <tr>
              <th>File Name</th>
              <th>Pages</th>
              <th>Price</th>
            </tr>
          </thead>

          <tbody>
            {fileInfo.map((file, i) => (
              <tr key={file.name}>
                <td>{file.name}</td>
                <td>{file.pages}</td>
                <td>{file.price}</td>
              </tr>
            ))}
          </tbody>
        </Table>
        {files.length == 0 && (
          <div className="mb-4 text-center text-sm italic text-gray-500">
            No files uploaded yet
          </div>
        )}
      </div> */}

      {/* For each file, show number of pages and total price */}
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
