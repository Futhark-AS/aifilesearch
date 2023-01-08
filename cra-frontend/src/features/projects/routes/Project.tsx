import { useAppSelector } from "@/app/hooks";
import { selectUser } from "@/features/auth/authSlice";
import { FileValidated } from "@dropzone-ui/react";
import { Button, Loader, TextInput } from "@mantine/core";
import React, { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { z } from "zod";
import { FileDropzonePassive } from "../components/FileDropzonePassive";
import {
  getProcessingStatusReq,
  searchProjectWithPromptReq,
  startProcessingReq,
} from "../requests";

const Project = () => {
  const user = useAppSelector((state) => selectUser(state));
  // const { id } = useParams<{ id: string }>();

  const [searchValue, setSearchValue] = useState("");

  // const [debouncedSearchValue] = useDebouncedValue(searchValue, 200);

  // useEffect(() => {
  //   console.log(debouncedSearchValue);
  // }, [debouncedSearchValue]);

  const onSearch = async (e: React.ChangeEvent<HTMLFormElement>) => {
    e.preventDefault();
    const res = await searchProjectWithPromptReq(
      searchValue,
      "michael",
      user.uid
    );
    console.log(res);
  };

  const startProcessing = async (filenames: string[], project: string) => {
    const res = await startProcessingReq(filenames, project);
    const status = await getProcessingStatusReq(res.uri);
    console.log(res, status);
  };

  // TODO: get files from azure based on project. Should do this here and pass down maybe

  const [files, setFiles] = useState<FileValidated[]>([]);

  return (
    <>
      <main className="container mx-auto flex min-h-screen w-[60ch] flex-col p-4">
        <section>
          <h2 className="text-left text-4xl font-extrabold leading-normal text-gray-700">
            Law search
          </h2>
          <p className="text-gray-500">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Tempora
          </p>
        </section>
        <Link to={`files`}>
          <Button variant="outline" size="xs" className="w-full">
            Files
          </Button>
        </Link>
        <Link to={`edit`}>
          <Button variant="outline" size="xs" className="mt-2 w-full">
            Edit project data
          </Button>
        </Link>
        <FileDropzonePassive files={[]} setFiles={(files) => null} />
        <Button onClick={() => startProcessing(["michael.pdf"], "michael")}>
          start processing
        </Button>
        <form onSubmit={onSearch}>
          <TextInput
            label="Search"
            placeholder="Eks: Hvor mye må jeg betale i skatt om jeg tjener 400 000?"
            className="input input-bordered mt-5 w-full"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            rightSection={<Loader size="sm" color="blue" />}
          />
        </form>
      </main>
    </>
  );
};

export default Project;
