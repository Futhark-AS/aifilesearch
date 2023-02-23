import { useAppSelector } from "@/redux/hooks";
import { selectUser } from "@/features/auth/authSlice";
import { Card, Divider } from "@mantine/core";
import React from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { Link } from "react-router-dom";
import { createProject, getProjects } from "../requests";
import { Button } from "@/components/Button";
import { Form, InputField } from "@/components/Form";
import { showError } from "@/utils/showError";

export default function Projects() {
  const { uid } = useAppSelector((state) => selectUser(state));
  const queryClient = useQueryClient();

  const { data, isLoading, error, isError } = useQuery({
    queryKey: ["projects"],
    queryFn: () => getProjects(uid),
  });

  const newProjectMutation = useMutation({
    mutationFn: createProject,
    onMutate: async (project) => {
      // Cancel any outgoing refetches
      // (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: ["projects"] });

      // Snapshot the previous value
      const prevProjects = queryClient.getQueryData<string[]>(["projects"]);


      if (prevProjects) {
        // Optimistically update to the new value
        queryClient.setQueryData<string[]>(
          ["projects"],
          [...prevProjects, project]
        );
      }

      // Return a context object with the snapshotted value
      return { prevProjects };
    },
    onSuccess: () => {
      // Invalidate and refetch
      console.log("onSuccess");
    },

    onError: (error, newProject, context) => {
      if (context?.prevProjects) {
        showError("There was an error creating your project");
        queryClient.setQueryData<string[]>(["projects"], context.prevProjects);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });

  return (
    <div>
      <main className="mx-auto px-4 md:mx-0">
        <h1 className="mt-8 text-3xl font-semibold">Your projects</h1>
        <Divider className="mt-2 mb-4"/>

        <ul className="auto-responsive-lg grid">
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
        <h3 className="text-lg mt-8 font-semibold">New project</h3>
        <Divider className="mt-2 mb-4" />
        <Form<{ name: string }>
          onSubmit={(values) => {
            newProjectMutation.mutate(values.name);
            values = { name: "" };
          }}
          className="space-y-2"
        >
          {(methods) => (
            <>
              <InputField
                label="Project name"
                registration={methods.register("name", {
                  required: "This field is required",
                })}
              />
              <Button size="sm" variant="inverse" type="submit">
                New
              </Button>
            </>
          )}
        </Form>
      </main>
    </div>
  );
}
