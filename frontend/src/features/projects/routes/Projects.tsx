import { Button } from "@/components/Button";
import { Form, InputField } from "@/components/Form";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { Card, Divider } from "@mantine/core";
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { createProject } from "../requests";

export default function Projects() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  return (
    <div>
      <main className="mx-auto px-4 md:mx-0">
        <h1 className="mt-8 text-3xl font-semibold">Your projects</h1>
        <Divider className="mt-2 mb-4" />

        {/* <div className="mt-4 flex-1 overflow-y-scroll" ref={chatBoxRef}> */}
        <ul className="max-h-72 overflow-y-scroll">
          {isLoading ? (
            <div>Loading...</div>
          ) : user.projects.length ? (
            user.projects.slice().reverse().map((project) => (
              <Link to={`./projects/${project.name}`} key={project.name}>
                <Card
                  shadow="sm"
                  radius="md"
                  className="my-2 w-11/12 transform cursor-pointer p-4 px-4 transition duration-100 hover:bg-slate-50 hover:cursor-pointer"
                >
                  <div className="text-md">{project.name}</div>
                </Card>
              </Link>
            ))
          ) : (
            <div className="text-gray-500">
              You do not have any projects yet
            </div>
          )}
        </ul>
        <Form<{ name: string }>
          onSubmit={(values) => {
            createProject(values.name);
            navigate(`./projects/${values.name}`);
          }}
          className="mt-4 flex flex-col sm:flex-row"
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
