import { Button } from "@/components/Button";
import { Card } from "@mantine/core";
import React from "react";
import { PromptMatch } from "../requests";
import { extractFileName } from "../utils";
import { SideBar } from "./SideBar";

interface Props {
  items: PromptMatch[];
  itemOnClick: (result: PromptMatch) => void;
}

export function PromptResultSideBar({ items, itemOnClick }: Props) {
  return (
    <SideBar title="Search results" side="right">
      <>
        {items.map((result) => (
          <Card key={result.id} className="mb-2 w-full">
            <h4 className="text-md">
              {extractFileName(result.metadata.file_name)}
            </h4>
            <p className="text-sm">{result.metadata.content}</p>
            <i className="mb-2 block">Page: {result.metadata.page_number}</i>
            <Button size="sm" onClick={() => itemOnClick(result)}>
              Show in PDF viewer
            </Button>
          </Card>
        ))}
      </>
    </SideBar>
  );
}
