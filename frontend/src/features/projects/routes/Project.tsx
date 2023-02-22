import { FileDropzonePassive } from "@/components/FileDropzone";
import { PdfViewer } from "@/components/PdfViewer";
import { Spinner } from "@/components/Spinner";
import { selectUser } from "@/features/auth/authSlice";
import { useAppSelector } from "@/redux/hooks";
import { showError, showSuccess } from "@/utils/showError";
import { FileValidated } from "@dropzone-ui/react";
import { TextInput } from "@mantine/core";
import React, { useState } from "react";
import { useQuery } from "react-query";
import { useParams } from "react-router-dom";
import { PromptResultSideBar } from "../components";
import { FileExplorerSideBar } from "../components/FileExplorerSideBar";
import { handleFileUpload } from "../projectAPI";
import {
  PromptMatch,
  getBlobUri,
  getFiles,
  searchProjectWithPromptReq,
} from "../requests";

const Project = () => {
  const user = useAppSelector((state) => selectUser(state));
  const ref = React.useRef<HTMLDivElement>(null);

  const { id: projectName } = useParams<{ id: string }>() as { id: string };
  const { data: projectFiles, refetch: refetchFiles } = useQuery("files", () =>
    getFiles()
  );

  const [searchValue, setSearchValue] = useState("");
  const searchRef = React.useRef<HTMLInputElement>(null);

  const [searchResults, setSearchResults] = useState<PromptMatch[]>([]);

  const [filesUploading, setFilesUploading] = useState(false);

  const [filesUpload, setFilesUpload] = useState<FileValidated[]>([]);

  // The currently showing result in the pdf viewer
  const [activeResult, setActiveResult] = useState<{
    fileUrl: string;
    fileSearchResult: PromptMatch | null; // highlight info
  } | null>(null);

  const [resultsLoading, setResultsLoading] = useState(false);

  const showResultInPdf = async (blobName: string, result?: PromptMatch) => {
    let fileUrl;
    try {
      fileUrl = await getBlobUri(blobName);
    } catch (e) {
      console.error(e);
      showError();
      return;
    }

    setActiveResult({
      fileUrl,
      fileSearchResult: result || null,
    });
  };

  const onSearch = async (e: React.ChangeEvent<HTMLFormElement>) => {
    e.preventDefault();
    setResultsLoading(true);

    searchProjectWithPromptReq(searchRef.current?.value || "", projectName)
      .then((res) => {
        setSearchResults(res);
      })
      .catch((e) => {
        console.error(e);
        showError();
      })
      .finally(() => {
        setResultsLoading(false);
        searchRef.current!.value = "";
      });
  };

  const handleFileUploadOnClick = async () => {
    setFilesUploading(true);

    handleFileUpload(
      filesUpload.map((file) => file.file),
      user.uid,
      projectName
    )
      .then((data) => {
        refetchFiles();
        showSuccess("File uploaded successfully!");
      })
      .catch((e) => {
        console.error(e);
        showError(
          "Unfortunately, there occured an error while uploading the file. Please try again later."
        );
      })
      .finally(() => {
        setFilesUpload([]);
        setFilesUploading(false);
      });
  };

  return (
    <>
      <main className="col flex h-full w-full">
        <FileExplorerSideBar
          files={projectFiles || []}
          fileOnClick={(file) => showResultInPdf(file)}
          initialSelectedFile=""
          loadingFiles={
            filesUploading ? filesUpload.map((file) => file.file.name) : []
          }
        />
        <section
          className="container mx-auto max-h-screen overflow-y-scroll p-4"
          ref={ref}
        >
          <h2 className="text-left text-4xl font-extrabold leading-normal text-gray-700">
            {projectName}
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
              rightSection={resultsLoading && <Spinner size="sm" />}
              ref={searchRef}
            />
          </form>
          {activeResult ? (
            <PdfViewer
              file={activeResult.fileUrl}
              highlightedBox={
                activeResult.fileSearchResult && {
                  boundingBox:
                    activeResult.fileSearchResult.highlightBoundingBox,
                  pageNumber: activeResult.fileSearchResult.pageNumber,
                }
              }
              ref={ref}
            />
          ) : (
            <div>No active PDF</div>
          )}
        </section>
        <PromptResultSideBar
          items={searchResults}
          itemOnClick={(match) => showResultInPdf(match.fileName, match)}
        />
      </main>
    </>
  );
};

export default Project;
