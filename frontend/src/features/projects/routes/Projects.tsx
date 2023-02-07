import { useAppSelector } from "@/redux/hooks";
import { selectUser } from "@/features/auth/authSlice";
import { Card } from "@mantine/core";
import React from "react";
import { useQuery } from "react-query";
import { Link } from "react-router-dom";
import { getProjects } from "../requests";

export default function Projects() {
  const { uid } = useAppSelector((state) => selectUser(state));

  const { data, isLoading, error, isError } = useQuery({
    queryKey: ["projects", uid],
    queryFn: () => getProjects(uid),
  });

  return (
    <div>
      <main className="mx-auto px-4 md:mx-0">
        <h1 className="mt-8 text-3xl font-semibold">Your projects</h1>
        <ul className="auto-responsive-lg mt-8 grid">
          {isError ? (
            <div className="text-red-500">
              There was an error loading your projects
              <i>{error instanceof Error && error.message}</i>
            </div>
          ) : isLoading ? (
            <div>Loading...</div>
          ) : (
            data &&
            data.map((project) => (
              <Link to={`./${project}`} key={project}>
                <Card
                  shadow="sm"
                  radius="md"
                  className="my-2 cursor-pointer p-8"
                >
                  <div className="text-lg">{project}</div>
                  <p className="text-gray-500">
                    Lorem ipsum dolor sit amet consectetur adipisicing elit.
                    Optio beatae illum magni aperiam eos consequuntur corporis
                    deleniti nesciunt, unde impedit?
                  </p>
                </Card>
              </Link>
            ))
          )}
        </ul>
      </main>
    </div>
  );
}
