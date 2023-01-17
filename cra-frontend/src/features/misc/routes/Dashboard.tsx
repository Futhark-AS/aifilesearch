import { useUser } from "@/app/hooks";
import { ContentLayout } from "@/components/Layout";
import { getProjects } from "@/features/projects/requests";
import { Card, Divider } from "@mantine/core";
import React, { useState } from "react";
import { useQuery } from "react-query";
import { Link } from "../../../components/Link/Link";
import { FileDropzone } from "@/features/projects/components/FileDropzone";
import { FileValidated } from "@dropzone-ui/react";

export const Dashboard: React.FC = () => {
  // const isAuthenticated = useIsAuthenticated();
  const user = useUser();
  const [files, setFiles] = useState<FileValidated[]>([]);

  const { data } = useQuery({
    queryKey: ["projects", user.uid],
    queryFn: () => getProjects(user.uid),
  });

  // if (!isAuthenticated) return <div>You are not authenticated</div>;

  return (
    <ContentLayout title="">
      <h1 className="mt-2 text-xl">
        Welcome <b>{`${user?.firstName}`}</b>
      </h1>
      <h3 className="mt-8 text-lg font-semibold">Upload files</h3>
      <Divider className="my-2" />
      <FileDropzone setFiles={setFiles} files={files}/>
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
