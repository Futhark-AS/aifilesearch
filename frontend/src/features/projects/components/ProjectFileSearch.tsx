import { Form, InputField } from "@/components/Form";
import { Spinner } from "@/components/Spinner";
import { Card, Divider } from "@mantine/core";
import React, { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { PromptMatch, searchProjectWithPromptReq } from "../requests";
import { encodePdfName, extractFileName } from "../utils";
import { ProjectPage } from "./ProjectPage";
import { useLocalStorage } from "@mantine/hooks";

export function ProjectFileSearch() {
  const { id: projectName } = useParams<{ id: string }>() as { id: string };
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [results, setResults] = useLocalStorage<PromptMatch[]>({
    key: "project-search" + projectName || "project-search",
    defaultValue: [],
  });

  const search = async (value: string) => {
    setLoading(true);
    const res = await searchProjectWithPromptReq(value, projectName);
    setLoading(false);
    setResults(res);
  };

  return (
    <ProjectPage title="Search" className="flex h-full flex-col">
      <div className={`mt-4 flex-1 ${results.length && "overflow-y-scroll"}`}>
        {loading && <Spinner size="sm" className=" ml-2 inline" />}
        {results?.length !== 0 && (
          <>
            <div className="mt-4 text-lg font-semibold">Results</div>
            <Divider className="my-2" />

            <div className="px-2">
              {results?.map((result, i) => {

                console.log(result)
                
                return (
                <Link
                  to={`/app/projects/${projectName}/pdf/${encodePdfName(
                    result.blobName
                  )}?highlightedBox=${JSON.stringify(result.highlightedBox)}`}
                >
                  <Card
                    key={result.id}
                    className="my-2 w-11/12 transform cursor-pointer p-4 px-4 transition duration-100 hover:cursor-pointer hover:bg-slate-50"
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
                </Link>


              )})}
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
