import { Button } from "@/components/Button";
import { Form, InputField } from "@/components/Form";
import { selectUser } from "@/features/auth/authSlice";
import { useAppSelector } from "@/redux/hooks";
import { showError } from "@/utils/showError";
import { Card, Divider } from "@mantine/core";
import React from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { Link } from "react-router-dom";
import { createProject, getUser } from "../requests";

export default function Projects() {
  const queryClient = useQueryClient();

  const { data: projects } = useQuery({
    queryKey: ["projects"],
    queryFn: () => getUser().then((user) => user.projects),
  });

  const {
    data: user,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["user"],
    queryFn: () => getUser(),
  });

  const newProjectMutation = useMutation({
    mutationFn: createProject,
    onMutate: async (project) => {
      // Cancel any outgoing refetches
      // (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: ["projects"] });

      // Snapshot the previous value
      const prevProjects = queryClient.getQueryData<{ name: string }[]>([
        "projects",
      ]);

      if (prevProjects) {
        // Optimistically update to the new value
        queryClient.setQueryData<{ name: string }[]>(
          ["projects"],
          [...prevProjects, { name: project }]
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
        queryClient.setQueryData(["projects"], context.prevProjects);
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
        <Divider className="mt-2 mb-4" />


        {/* <div className="mt-4 flex-1 overflow-y-scroll" ref={chatBoxRef}> */}
        <ul className="overflow-y-scroll max-h-72">
          {isError ? (
            <div className="text-red-500">
              There was an error loading your projects
            </div>
          ) : isLoading ? (
            <div>Loading...</div>
          ) : (
            projects &&
            projects.map((project) => (
              <Link to={`./projects/${project.name}`} key={project.name}>
                <Card
                  shadow="sm"
                  radius="md"
                  className="my-2 transform cursor-pointer p-4 px-4 transition duration-100 hover:scale-105 hover:cursor-pointer w-11/12 mx-auto"
                >
                  <div className="text-md">{project.name}</div>
                </Card>
              </Link>
            ))
          )}
        </ul>
        <Form<{ name: string }>
          onSubmit={(values) => {
            newProjectMutation.mutate(values.name);
          }}
          className="flex flex-col sm:flex-row mt-4"
        >
          {(methods) => (
            <>
              <InputField
                label="New project"
                wrapperClassname="flex-1 mr-2"
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
