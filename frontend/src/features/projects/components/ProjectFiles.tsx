import { Button } from "@/components/Button";
import { ProjectFile } from "@/features/auth/types";
import { useAppDispatch } from "@/redux/hooks";
import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PromptMatch, useFiles } from "../requests";
import { Card } from "@mantine/core";
import { encodePdfName } from "../utils";
import { UploadFilesBox } from "./UploadFilesBox";

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
    <Card className="mb-2 flex w-full transform px-4 transition duration-150 hover:scale-105 hover:cursor-pointer">
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
    </Card>
  );
}

export function ProjectFiles() {
  const { id: projectName } = useParams<{ id: string }>() as { id: string };
  const [selectedFile, setSelectedFile] = useState<number | null>(null);
  const navigate = useNavigate();
  const [uploadFilesOpen, setUploadFilesOpen] = useState(false);

  const { files, isLoading } = useFiles(projectName);

  return (
    <div className="flex h-full flex-col">
      <div className="flex justify-between">
        <h2 className="text-left text-3xl font-extrabold leading-normal text-gray-700">
          All Files
        </h2>
      </div>
      {isLoading ? (
        <div className="text-sm italic text-gray-500">Loading files...</div>
      ) : (
        <div>
          {files.map((file, i) => (
            <File
              active={selectedFile == i}
              file={file}
              fileOnClick={(file) => {
                const name = encodePdfName(file.blobName);
                navigate(`/app/projects/${projectName}/pdf/${name}`);

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
        </div>
      )}
      <Button
        variant="inverse"
        size="sm"
        className="mt-4"
        onClick={() => setUploadFilesOpen(true)}
      >
        Upload file
      </Button>
      <UploadFilesBox open={uploadFilesOpen} setOpen={setUploadFilesOpen} />
    </div>
  );
}
