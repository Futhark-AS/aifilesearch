import { FileDropzonePassive } from "@/components/FileDropzone";
import { PdfViewer } from "@/components/PdfViewer";
import { Spinner } from "@/components/Spinner";
import { selectUser } from "@/features/auth/authSlice";
import { useAppSelector } from "@/redux/hooks";
import { FileValidated } from "@dropzone-ui/react";
import { TextInput } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
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

  const { id: projectName } = useParams<{ id: string }>();
  const { data: projectFiles, refetch: refetchFiles } = useQuery("files", () =>
    getFiles()
  );

  const [searchValue, setSearchValue] = useState("");
  const [searchResults, setSearchResults] = useState<PromptMatch[]>([]);

  const [filesUploading, setFilesUploading] = useState(false);

  const [filesUpload, setFilesUpload] = useState<FileValidated[]>([]);
  const [fileUploadIsError, setFileUploadIsError] = useState(false);

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
      setResultsLoading(false);
      setSearchValue("");
      return;
    }

    try {
      const res = await searchProjectWithPromptReq(
        searchValue,
        projectName,
        user.uid
      );

      setResultsLoading(false);
      setSearchResults(res);
    } catch (e) {
      console.error(e);
      showNotification({
        title: "Error",
        message: "Unfortunately, an error occurred. Please try again later.",
        color: "red",
      });
    }
    setResultsLoading(false);
    setSearchValue("");
  };

  const setCompleted = () => {
    setFilesUploading(false);
    refetchFiles();
  };

  const handleFileUploadOnClick = async () => {
    setFilesUploading(true);
    setFileUploadIsError(false);

    if (!projectName) {
      console.error("Illegal component state: projectName is undefined");
      // TODO: show error to user
      return setResultsLoading(false);
    }

    try {
      handleFileUpload(
        filesUpload.map((file) => file.file),
        user.uid,
        projectName,
        setCompleted,
        setFileUploadIsError
      );
    } catch (e) {
      console.error(e);
      showNotification({
        title: "Error",
        message: "Unfortunately, an error occurred. Please try again later.",
        color: "red",
      });
    }

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
            <div></div>
          )}
          {/* <PdfViewer file={pdf} promptResult={mockMatches[2]} ref={ref} /> */}
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
