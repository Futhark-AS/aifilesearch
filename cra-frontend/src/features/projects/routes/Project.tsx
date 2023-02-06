import { useAppSelector } from "@/app/hooks";
import { PdfViewer } from "@/components/PdfViewer";
import { selectUser } from "@/features/auth/authSlice";
import { FileValidated } from "@dropzone-ui/react";
import { Button, Card, Loader, TextInput } from "@mantine/core";
import React, { useState } from "react";
import { useQuery } from "react-query";
import { useParams } from "react-router-dom";
import { FileDropzonePassive } from "../components/FileDropzonePassive";
import { FileExplorerSideBar } from "../components/FileExplorerSideBar";
import { extractFileName } from "../components/ShowPromptResult";
import { handleFileUpload } from "../projectAPI";
import {
  PromptMatch,
  getBlobUri,
  getFiles,
  searchProjectWithPromptReq,
} from "../requests";

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
      // TODO: show error to user
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
          {filesUploading && (
            <div className="flex w-full items-center justify-center bg-slate-300 p-4">
              <Loader size="md" color="blue" className="mr-2 inline" />
              <span>Uploading files...</span>
            </div>
          )}
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
                rightSection={
                  resultsLoading && <Loader size="sm" color="blue" />
                }
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
        <section className="w-64 overflow-auto bg-slate-600 px-4 pt-4">
          <h3 className="text-center text-lg text-white">Results</h3>
          {searchResults.map((result) => (
            <Card key={result.id} className="mb-2 w-full">
              <h4 className="text-md">
                {extractFileName(result.metadata.file_name)}
              </h4>
              <p className="text-sm">{result.metadata.content}</p>
              <i className="mb-2 block">Page: {result.metadata.page_number}</i>
              <Button
                variant="outline"
                size="xs"
                onClick={() => showResultInPdf(result)}
              >
                Show in PDF viewer
              </Button>
            </Card>
          ))}
        </section>
      </main>
    </>
  );
};

export default Project;
