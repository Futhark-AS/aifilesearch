import { Button } from "@/components/Button";
import { ProjectFile } from "@/features/auth/types";
import { Card, Loader, Table } from "@mantine/core";
import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useFiles } from "../requests";
import { encodePdfName } from "../utils";
import { UploadFilesBox } from "./UploadFilesBox";
import { ProjectPage } from "./ProjectPage";

interface FileProps {
  file: ProjectFile;
  fileOnClick?: (file: ProjectFile) => void;
}

function File({ file, fileOnClick }: FileProps) {
  return (
    <Card className="mb-2 max-w-[250px] transform px-4 transition duration-150 hover:scale-105 hover:cursor-pointer">
      <button
        onClick={() => {
          fileOnClick && fileOnClick(file);
        }}
        className={`p-4 text-left`}
      >
        <div className="overflow-hidden overflow-ellipsis whitespace-nowrap">
          <h3 className="mb-4 text-lg font-semibold">{file.fileName}</h3>
          {/* table with metadata */}
          <Table fontSize={"xs"}>
            <tbody>
              <tr>
                <td>Created at:</td>
                <td>{file.uploadedDate || "Unknown"}</td>
              </tr>
              <tr>
                <td>Num pages</td>
                <td>{file.pages}</td>
              </tr>
              <tr>
                <td>Num paragraphs</td>
                <td>{file.numParagraphs || "Unknown"}</td>
              </tr>
              <tr>
                <td>Price</td>
                <td>{file.price}</td>
              </tr>
            </tbody>
          </Table>
        </div>
      </button>
    </Card>
  );
}

export function ProjectFiles() {
  const { id: projectName } = useParams<{ id: string }>() as { id: string };
  const navigate = useNavigate();
  const [uploadFilesOpen, setUploadFilesOpen] = useState(false);

  const { files, isLoading } = useFiles(projectName);
  const [fileUploadLoading, setFileUploadLoading] = useState(false);

  return (
    <ProjectPage title="Project Files">
      <Button
        variant="inverse"
        size="sm"
        className="mt-4"
        onClick={() => setUploadFilesOpen(true)}
      >
        Upload new file
      </Button>
      {isLoading ? (
        <div className="text-sm italic text-gray-500">Loading files...</div>
      ) : (
        <div className="auto-responsive grid mt-6">
          {files
            // .flatMap((file) => Array(8).fill(file))
            .map((file, i) => (
              <File
                file={file}
                fileOnClick={(file) => {
                  const name = encodePdfName(file.blobName);
                  navigate(`/app/projects/${projectName}/pdf/${name}`);
                }}
                key={file.fileName + i}
              />
            ))}
          {files.length == 0 && (
            <div className="text-sm italic text-gray-500">
              No files uploaded yet
            </div>
          )}
          {fileUploadLoading && (
            <div className="flex justify-center">
              <Loader size="xl" />
            </div>
          )}
        </div>
      )}
      <UploadFilesBox
        open={uploadFilesOpen}
        setOpen={setUploadFilesOpen}
        setUploading={setFileUploadLoading}
      />
    </ProjectPage>
  );
}
