import React from "react";
import { Form, InputField } from "@/components/Form";
import { Spinner } from "@/components/Spinner";
import { Card, Divider } from "@mantine/core";
import { useState } from "react";
import { PromptMatch, searchProjectWithPromptReq } from "../requests";
import { extractFileName } from "../utils";
import { useParams } from "react-router-dom";
import { useQuery } from "react-query";

export function ProjectFileSearch() {
  const [items, setItems] = useState<PromptMatch[]>([]);
  const { id: projectName } = useParams<{ id: string }>() as { id: string };
  const [searchValue, setSearchValue] = useState("");

  const search = async () => {
    const res = await searchProjectWithPromptReq(searchValue, projectName);
    return res;
  };

  const itemOnClick = (item: PromptMatch) => {
    console.log(item);
  };

  const { data, refetch, isLoading, isError } = useQuery(
    ["projectSearch", projectName, searchValue],
    search,
    {
      enabled: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
    }
  );

  return (
    <div className="flex h-full flex-col">
      <div className="flex justify-between">
        <h2 className="text-left text-3xl font-extrabold leading-normal text-gray-700">
          File Search
        </h2>
      </div>

      <div className="mt-4 flex-1 overflow-y-scroll">
        {isLoading && <Spinner size="sm" className=" ml-2 inline" />}
        {data?.length !== 0 && (
          <>
            <div className="mt-4 text-lg font-semibold">Results</div>
            <Divider className="my-2" />

            <div className="px-2">
              {data?.map((result, i) => (
                <Card
                  key={result.id}
                  className="mb-2 flex w-full transform px-4 transition duration-150 hover:scale-105 hover:cursor-pointer"
                  onClick={() => itemOnClick(result)}
                >
                  <div className="w-8">{i + 1}</div>
                  <div>
                    <h4 className="text-md">
                      {result.citation && (
                        <span className="text-xs text-gray-500">
                          {result.citation}
                        </span>
                      )}
                      {extractFileName(result.blobName)}
                    </h4>
                    <i className="mb-2 block text-xs">
                      p. {result.highlightedBox.pageNumber}
                    </i>
                    <p className="">{result.highlightedBox.content}</p>
                  </div>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
      <Form<{ query: string }>
        onSubmit={(values) => {
          setSearchValue(values.query);
          refetch();
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
    </div>
  );
}
