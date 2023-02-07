import { useUser } from "@/app/hooks";
import { ContentLayout } from "@/components/Layout";
import { FileDropzone } from "@/features/projects/components/FileDropzone";
import { getProjects } from "@/features/projects/requests";
import { FileValidated } from "@dropzone-ui/react";
import { Button, Card, Divider, Select } from "@mantine/core";
import React, { useRef, useState } from "react";
import { useQuery } from "react-query";
import { Link } from "../../../components/Link/Link";
import { handleFileUpload } from "@/features/projects/projectAPI";

export const Dashboard: React.FC = () => {
  const user = useUser();
  const [files, setFiles] = useState<FileValidated[]>([]);
  const [uploadProject, setUploadProject] = useState<string | null>(null);

  const { data } = useQuery({
    queryKey: ["projects", user.uid],
    queryFn: () => getProjects(user.uid),
  });

  return (
    <ContentLayout title="">
      <h1 className="mt-2 text-xl">
        Welcome <b>{`${user?.firstName}`}</b>
      </h1>
      <h3 className="mt-8 text-lg font-semibold">Upload files</h3>
      <Divider className="my-2" />
      <FileDropzone setFiles={setFiles} files={files} />
      {files.length > 0 && (
        <div>
          <Select
            label="Pick a project"
            placeholder="Project"
            value={uploadProject}
            onChange={(value) => setUploadProject(value as string)}
            data={
              data?.map((project) => ({ label: project, value: project })) || []
            }
            className="mb-2"
          />
          <Button
            variant="outline"
            disabled={uploadProject === null}
            onClick={() => {
              handleFileUpload(
                files.map((file) => file.file),
                user.uid,
                uploadProject!,
                () => {
                  null;
                }
              );
              setFiles([]);
            }}
          >
            Upload!
          </Button>
        </div>
      )}
      <h3 className="mt-8 text-lg font-semibold">Recent Projects</h3>
      <Divider className="my-2" />
      {data &&
        data.map((project) => (
          <Link to={`./projects/${project}`} key={project}>
            <Card shadow="sm" radius="md" className="my-2 cursor-pointer p-8">
              <div className="text-lg">{project}</div>
              <p className="text-gray-500">
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Optio
                beatae illum magni aperiam eos consequuntur corporis deleniti
                nesciunt, unde impedit?
              </p>
            </Card>
          </Link>
        ))}
    </ContentLayout>
  );
};
