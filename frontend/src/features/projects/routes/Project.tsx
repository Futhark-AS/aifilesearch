import { Button } from "@/components/Button";
import { PdfViewer } from "@/components/PdfViewer";
import { Spinner } from "@/components/Spinner";
import { selectUser } from "@/features/auth/authSlice";
import { useAppSelector } from "@/redux/hooks";
import { FileValidated } from "@dropzone-ui/react";
import { Card, TextInput } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import React, { useState } from "react";
import { useQuery } from "react-query";
import { useParams } from "react-router-dom";
import { FileExplorerSideBar } from "../components/FileExplorerSideBar";
import { handleFileUpload } from "../projectAPI";
import {
  PromptMatch,
  getBlobUri,
  getFiles,
  searchProjectWithPromptReq,
} from "../requests";
import { FileDropzonePassive } from "@/components/FileDropzone";
import { extractFileName } from "../utils";
import { PromptResultSideBar } from "../components";

const Project = () => {
  const user = useAppSelector((state) => selectUser(state));

  const { id: projectName } = useParams<{ id: string }>();
  const { data: projectFiles, refetch: refetchFiles } = useQuery("files", () =>
    getFiles()
  );

  const [searchValue, setSearchValue] = useState("");
  const [searchResults, setSearchResults] = useState<PromptMatch[]>([]);

  const [filesUploading, setFilesUploading] = useState(false);

  const [filesUpload, setFilesUpload] = useState<FileValidated[]>([]);

  // The currently showing result in the pdf viewer
  const [activeResult, setActiveResult] = useState<{
    fileUrl: string;
    fileSearchResult: PromptMatch; // highlight info
  } | null>(null);

  const [resultsLoading, setResultsLoading] = useState(false);

  const showResultInPdf = async (result: PromptMatch) => {
    const fileUrl = await getBlobUri(result.metadata.file_name);

    setActiveResult({
      fileUrl,
      fileSearchResult: result,
    });
  };

  const onSearch = async (e: React.ChangeEvent<HTMLFormElement>) => {
    e.preventDefault();
    setResultsLoading(true);

    if (!projectName) {
      console.error("Illegal component state: projectName is undefined");
      showNotification({
        title: "Error",
        message: "Unfortunately, an error occurred. Please try again later.",
        color: "red",
      });
      return setResultsLoading(false);
    }

    const res = await searchProjectWithPromptReq(
      searchValue,
      projectName,
      user.uid
    );

    setResultsLoading(false);
    setSearchResults(res);
  };

  const setCompleted = () => {
    setFilesUploading(false);
    refetchFiles();
  };

  const handleFileUploadOnClick = async () => {
    setFilesUploading(true);

    if (!projectName) {
      console.error("Illegal component state: projectName is undefined");
      // TODO: show error to user
      return setResultsLoading(false);
    }

    handleFileUpload(
      filesUpload.map((file) => file.file),
      user.uid,
      projectName,
      setCompleted
    );
    setFilesUpload([]);
  };

  return (
    <>
      <main className="col flex h-full w-full">
        <FileExplorerSideBar
          files={projectFiles || []}
          fileOnClick={(file) => console.log(file)}
          initialSelectedFile=""
          loadingFiles={
            filesUploading ? filesUpload.map((file) => file.file.name) : []
          }
        />
        <section className="grow">
          <div className="container mx-auto max-h-screen overflow-y-scroll p-4">
            <h2 className="text-left text-4xl font-extrabold leading-normal text-gray-700">
              Project Name
            </h2>
            <FileDropzonePassive
              files={!filesUploading ? filesUpload : []}
              setFiles={setFilesUpload}
              handleFileUpload={handleFileUploadOnClick}
            />

            <form onSubmit={onSearch} className="mb-4">
              <TextInput
                label="Search"
                placeholder="Eks: Hvor mye må jeg betale i skatt om jeg tjener 400 000?"
                className="input input-bordered mt-5 w-full"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                rightSection={resultsLoading && <Spinner size="sm" />}
              />
            </form>
            {activeResult ? (
              <PdfViewer
                file={activeResult.fileUrl}
                promptResult={activeResult.fileSearchResult}
                key={activeResult.fileSearchResult.id}
              />
            ) : (
              <div>No results</div>
            )}
          </div>
        </section>
        {/* resizeable sidebar: https://codesandbox.io/s/react-resizable-sidebar-kz9de?file=/src/App.css:0-38 */}
        <PromptResultSideBar
          items={searchResults}
          itemOnClick={showResultInPdf}
        />
      </main>
    </>
  );
};

export default Project;
