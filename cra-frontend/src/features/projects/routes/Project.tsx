import { useAppSelector } from "@/app/hooks";
import { selectUser } from "@/features/auth/authSlice";
import { FileValidated } from "@dropzone-ui/react";
import { Button, Card, Loader, TextInput } from "@mantine/core";
import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { FileDropzonePassive } from "../components/FileDropzonePassive";
import { ShowPromptResult } from "../components/ShowPromptResult";
import {
  PromptMatch,
  getProcessingStatusReq,
  getSASToken,
  postFile,
  searchProjectWithPromptReq,
  startProcessingReq,
} from "../requests";

const Project = () => {
  const user = useAppSelector((state) => selectUser(state));
  const { id } = useParams<{ id: string }>();

  const [searchValue, setSearchValue] = useState("");
  const [searchResults, setSearchResults] = useState<PromptMatch[]>([]);

  const [files, setFiles] = useState<FileValidated[]>([]);
  const [activeResult, setActiveResult] = useState<{
    fileUrl: string;
    result: PromptMatch;
  } | null>(null);

  const [resultsLoading, setResultsLoading] = useState(false);

  const showResultInPdf = async (result: PromptMatch) => {
    const fileUrl = (await getSASToken(result.metadata.file_name, "r")).uri;

    setActiveResult({
      fileUrl,
      result,
    });
  };

  const onSearch = async (e: React.ChangeEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("hello");
    setResultsLoading(true);

    const res = await searchProjectWithPromptReq(
      searchValue,
      "michael",
      user.uid
    );

    setResultsLoading(false);
    setSearchResults(res);
  };

  const startProcessing = async (filenames: string[], project: string) => {
    const res = await startProcessingReq(filenames, project);
    const status = await getProcessingStatusReq(res.uri);
    //TODO: load and check status every 5 seconds until done
    console.log(res, status);
  };

  const handleFileUpload = async () => {
    if(files.length === 0) return
    await postFile(user.uid, files[0].file, "michael")
    startProcessing([files[0].file.name], "michael")

  }

  // TODO: get files from azure based on project. Should do this here and pass down maybe

  return (
    <>
      <main className="col flex h-full w-full">
        <section className="grow">
          <div className="container mx-auto p-4">
            <h2 className="text-left text-4xl font-extrabold leading-normal text-gray-700">
              Project Name
            </h2>
            <FileDropzonePassive files={files} setFiles={setFiles} handleFileUpload={handleFileUpload}/>
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
              <ShowPromptResult
                file={activeResult.fileUrl}
                promptResult={activeResult.result}
              />
            ) : (
              <div>No results</div>
            )}
          </div>
        </section>
        {/* <ShowPdf /> */}
        {/* resizeable sidebar: https://codesandbox.io/s/react-resizable-sidebar-kz9de?file=/src/App.css:0-38 */}
        <section className="w-64 overflow-auto bg-slate-600 px-4 pt-4">
          <h3 className="text-center text-lg text-white">Results</h3>
          {searchResults.map((result) => (
            <Card key={result.id} className="mb-2 w-full">
              <h4 className="text-md">{result.metadata.file_name}</h4>
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
