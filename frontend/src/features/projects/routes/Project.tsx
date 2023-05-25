import { PdfViewer } from "@/components/PdfViewer";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { showError } from "@/utils/showError";
import { FolderIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { Divider } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import React, { Ref, forwardRef, useState } from "react";
import { useQuery } from "react-query";
import { Route, Routes, useNavigate, useParams } from "react-router-dom";
import { ProjectChat, ProjectSearchSidebar } from "../components";
import { ProjectFilesSidebar } from "../components/ProjectFilesSidebar";
import { UploadFilesBox } from "../components/UploadFilesBox";
import {
  leftBarShowing,
  selectHighlightedResult,
  selectLeftPanelChosen,
  setHighlightedResult,
  toggleFilesPane,
  toggleSearchPane,
} from "../projectSlice";
import {
  PromptMatch,
  getBlobUri,
  getNewChatMessage,
  searchProjectWithPromptReq,
  useFiles,
} from "../requests";
import { decodePdfName, encodePdfName } from "../utils";
interface Props {
  _: null;
}

function useFileUrl(blobName: string) {
  const queryKey = ["fileUrl", blobName];
  return useQuery(queryKey, () => getBlobUri(blobName));
}

const PdfView = forwardRef(function PdfView(
  { _ }: Props,
  parentRef: Ref<HTMLElement>
) {
  const { pdf: blobName } = useParams();
  const { data: fileUrl, isError } = useFileUrl(decodePdfName(blobName!));

  const highlightedResult = useAppSelector((state) =>
    selectHighlightedResult(state)
  );

  return (
    <div>
      {!blobName && <div>no pdf</div>}
      {isError ? (
        <div>error</div>
      ) : fileUrl ? (
        <PdfViewer
          file={fileUrl}
          highlightedBox={highlightedResult}
          ref={parentRef}
        />
      ) : (
        <div>loading</div>
      )}
    </div>
  );
});

const Project = () => {
  const leftPane = useAppSelector((state) => selectLeftPanelChosen(state));
  const ref = React.useRef<HTMLDivElement>(null);
  const dispatch = useAppDispatch();
  const [uploadFilesOpen, setUploadFilesOpen] = useState(false);
  const navigate = useNavigate();

  const { id: projectName } = useParams<{ id: string }>() as { id: string };

  const files = useFiles(projectName);

  const [searchResults, setSearchResults] = useState<PromptMatch[]>([]);

  const [resultsLoading, setResultsLoading] = useState(false);

  const showResultInPdf = async (
    fileBlobName: string,
    result?: PromptMatch
  ) => {
    const name = encodePdfName(fileBlobName);
    navigate(`pdf/${name}`);
    dispatch(setHighlightedResult(result?.highlightedBox || null));
  };

  const onSearch = async (searchValue: string) => {
    setResultsLoading(true);

    searchProjectWithPromptReq(searchValue, projectName)
      .then((res) => {
        console.log(res);
        if (res.length === 0) {
          showNotification({
            title: "No results",
            message: "No files matched your search",
          });
        }
        setSearchResults(res);
      })
      .catch((e) => {
        console.error(e);
        showError();
      })
      .finally(() => {
        setResultsLoading(false);
      });
  };

  return (
    <>
      <main className="flex h-full w-full">
        <div className="flex h-full w-12 flex-col border border-r-gray-200">
          <div className="flex h-16 flex-col justify-center">
            <MagnifyingGlassIcon
              onClick={() => {
                dispatch(toggleSearchPane());
              }}
              fontWeight="bold"
              className="mx-auto w-5 text-gray-500 hover:cursor-pointer"
            />
            {leftPane == leftBarShowing.search && (
              <Divider className="mx-auto mt-1 w-5 font-semibold" />
            )}
          </div>
          <div className="flex h-16 flex-col justify-center">
            <FolderIcon
              onClick={() => {
                dispatch(toggleFilesPane());
              }}
              className="mx-auto w-5 text-gray-500 hover:cursor-pointer"
            />
            {leftPane == leftBarShowing.files && (
              <Divider className="mx-auto mt-1 w-5 font-semibold" />
            )}
          </div>
        </div>
        {leftPane == leftBarShowing.search && (
          <ProjectSearchSidebar
            items={searchResults}
            itemOnClick={(match) => showResultInPdf(match.blobName, match)}
            itemsLoading={resultsLoading}
            onSubmit={onSearch}
            onClose={() => dispatch(toggleSearchPane())}
          />
        )}
        {leftPane == leftBarShowing.files && (
          <ProjectFilesSidebar
            onClose={() => dispatch(toggleFilesPane())}
            files={files}
            fileOnActivate={(file) => showResultInPdf(file.blobName)}
            fileOnDeactivate={() => navigate(-1)}
            initialSelectedFile=""
            onUploadFileClick={() => setUploadFilesOpen(true)}
          />
        )}
        <section className="mx-auto max-h-full flex-1 p-4" ref={ref}>
          <Routes>
            <Route path="pdf/:pdf" element={<PdfView _={null} ref={ref} />} />
            <Route
              path=""
              element={
                <ProjectChat
                  getAiResponse={getNewChatMessage}
                  projectName={projectName}
                />
              }
            />
          </Routes>
        </section>
        <UploadFilesBox open={uploadFilesOpen} setOpen={setUploadFilesOpen} />
      </main>
    </>
  );
};

export default Project;
