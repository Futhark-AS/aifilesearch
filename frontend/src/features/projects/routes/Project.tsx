import { PdfViewer } from "@/components/PdfViewer";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  ChatBubbleLeftIcon,
  FolderIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { Button, Divider } from "@mantine/core";
import React, { Ref, RefObject, forwardRef, useEffect, useState } from "react";
import { useQuery } from "react-query";
import { Route, Routes, useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ProjectChat } from "../components";
import { ProjectFileSearch } from "../components/ProjectFileSearch";
import { ProjectFiles } from "../components/ProjectFiles";
import {
  leftBarShowing,
  selectHighlightedResult,
  selectLeftPanelChosen,
  togglePane,
} from "../projectSlice";
import { getBlobUri, getNewChatMessage } from "../requests";
import { decodePdfName } from "../utils";
import { useLocalStorage } from "@mantine/hooks";
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
  const [width, setWidth] = useLocalStorage({key: "pdf-width", defaultValue: 800})

  const [searchParams] = useSearchParams();
  const highlightedBox = searchParams.get("highlightedBox");

  function changeZoom(delta: number) {
    setWidth(width + delta)
    window.location.reload()
  }

  return (
    <div style={{width: `${width}px`}} className={`mx-auto`} ref={parentRef as RefObject<HTMLDivElement>}> 
    <div className="flex justify-center gap-2">
      <Button variant="outline" onClick={() => changeZoom(-50)}>Zoom out pdf</Button>
      <Button variant="outline" onClick={() => changeZoom(50)}>Zoom in pdf</Button>
    </div>
      {!blobName && <div>no pdf</div>}
      {isError ? (
        <div>error</div>
      ) : fileUrl ? (
        <PdfViewer
          file={fileUrl}
          highlightedBox={highlightedBox ? JSON.parse(highlightedBox) : null}
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
  const navigate = useNavigate();
  const location = useLocation()


  useEffect(() => {
    const a = location.pathname.split("/")
    switch (a[a.length - 1]) {
      case "search":
        dispatch(togglePane(leftBarShowing.search));
        break;
        
      case "files":
        dispatch(togglePane(leftBarShowing.files));
        break;

      default:
        dispatch(togglePane(leftBarShowing.chat));
        break;
    }
  }, [location, dispatch])

  const { id: projectName } = useParams<{ id: string }>() as { id: string };

  return (
    <>
      <main className="flex h-full overflow-hidden">
        <div className="flex h-full w-12 flex-col border border-r-gray-200">
          <div className="flex h-16 flex-col justify-center">
            <ChatBubbleLeftIcon
              onClick={() => {
                navigate("");
              }}
              fontWeight="bold"
              className="mx-auto w-5 text-gray-500 hover:cursor-pointer"
            />
            {leftPane == leftBarShowing.chat && (
              <Divider className="mx-auto mt-1 w-5 font-semibold" />
            )}
          </div>
          <div className="flex h-16 flex-col justify-center">
            <MagnifyingGlassIcon
              onClick={() => {
                navigate("search");
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
                navigate("files");
              }}
              className="mx-auto w-5 text-gray-500 hover:cursor-pointer"
            />
            {leftPane == leftBarShowing.files && (
              <Divider className="mx-auto mt-1 w-5 font-semibold" />
            )}
          </div>
        </div>
        <section className="max-h-full flex-1 p-4">
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
            <Route path="search" element={<ProjectFileSearch />} />
            <Route path="files" element={<ProjectFiles />} />
          </Routes>
        </section>
      </main>
    </>
  );
};

export default Project;
