import { Form, InputField } from "@/components/Form";
import { Spinner } from "@/components/Spinner";
import { Card, Divider } from "@mantine/core";
import React from "react";
import { PromptMatch } from "../requests";
import { extractFileName } from "../utils";
import { SideBar } from "./SideBar";

interface Props {
  items: PromptMatch[];
  itemOnClick: (result: PromptMatch) => void;
  itemsLoading: boolean;
  onSubmit: (query: string) => void;
  onClose: () => void;
}

export function ProjectSearchSidebar({
  items,
  itemOnClick,
  itemsLoading,
  onSubmit,
  onClose,
}: Props) {
  return (
    <SideBar title="Search in files" side="left" onClose={onClose}>
      <div>
        <Form<{ query: string }>
          onSubmit={(values) => {
            onSubmit(values.query);
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
        {itemsLoading && <Spinner size="sm" className=" ml-2 inline" />}
        {items.length !== 0 && (
          <>
            <div className="mt-4">Results</div>
            <Divider className="my-2" />

            <div className="px-2">
              {items.map((result) => (
                <Card
                  key={result.id}
                  className="mb-2 w-full transform px-4 transition duration-150 hover:scale-105 hover:cursor-pointer"
                  onClick={() => itemOnClick(result)}
                >
                  <h4 className="text-md">
                    {result.citation && (
                      <span className="text-xs text-gray-500">
                        {result.citation} -
                      </span>
                    )}
                    {extractFileName(result.fileName)}
                  </h4>
                  <i className="mb-2 block text-xs">
                    p. {result.highlightedBox.pageNumber}
                  </i>
                  <p className="overflow-hidden overflow-ellipsis whitespace-nowrap text-sm">
                    {result.highlightedBox.content}
                  </p>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </SideBar>
  );
}
