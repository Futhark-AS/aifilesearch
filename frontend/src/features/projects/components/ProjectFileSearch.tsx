import { Form, InputField } from "@/components/Form";
import { Spinner } from "@/components/Spinner";
import { Card, Divider } from "@mantine/core";
import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PromptMatch, searchProjectWithPromptReq } from "../requests";
import { encodePdfName, extractFileName } from "../utils";
import { useAppDispatch } from "@/redux/hooks";
import { setHighlightedResult } from "../projectSlice";
import { ProjectPage } from "./ProjectPage";

export function ProjectFileSearch() {
  const [results, setResults] = useState<PromptMatch[]>([]);
  const { id: projectName } = useParams<{ id: string }>() as { id: string };
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const search = async (value: string) => {
    setLoading(true);
    const res = await searchProjectWithPromptReq(value, projectName);
    setLoading(false);
    setResults(res);
  };

  const itemOnClick = (item: PromptMatch) => {
    navigate(`/app/projects/${projectName}/pdf/${encodePdfName(item.blobName)}`);
    dispatch(setHighlightedResult(item.highlightedBox));
  };

  return (
    <ProjectPage title="Search">
      <div className="mt-4 flex-1 overflow-y-scroll">
        {loading && <Spinner size="sm" className=" ml-2 inline" />}
        {results?.length !== 0 && (
          <>
            <div className="mt-4 text-lg font-semibold">Results</div>
            <Divider className="my-2" />

            <div className="px-2">
              {results?.map((result, i) => (
                <Card
                  key={result.id}
                  className="my-2 w-11/12 transform cursor-pointer p-4 px-4 transition duration-100 hover:cursor-pointer hover:bg-slate-50"
                  onClick={() => itemOnClick(result)}
                >
                  <div className="w-8">{i + 1}</div>
                  <div>
                    <h4 className="text-md">
                      {extractFileName(result.blobName)}
                    </h4>
                    <i className="mb-2 block text-xs">
                      p. {result.highlightedBox.pageNumber}
                    </i>
                    <p className="text-sm">{result.highlightedBox.content}</p>
                  </div>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
      <Form<{ query: string }>
        onSubmit={(values) => {
          search(values.query);
          values = { query: "" };
        }}
        className="space-y-2"
      >
        {(methods) => (
          <>
            <InputField
              registration={methods.register("query", {
                required: "This field is required",
              })}
              placeholder="Hvordan bruker man indefinido"
              className="text-black"
            />
          </>
        )}
      </Form>
    </ProjectPage>
  );
}
