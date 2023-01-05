import React from "react";
import { Card } from "@mantine/core";
import { Link } from "react-router-dom";

//TODO: get projects from database
const projects = [
  {
    id: 1,
    name: "Project 1",
  },
  {
    id: 2,
    name: "Project 2",
  },
  {
    id: 3,
    name: "Project 3",
  },
];

export default function Page() {
  return (
    <div>
      <main className="mx-auto md:mx-0 px-4">
        <h1 className="text-3xl font-semibold mt-8">Your projects</h1>
        <ul className="auto-responsive-lg grid mt-8">
          {projects.map((project) => (
            <Link to={`./${project.id}`} key={project.id}>
              <Card shadow="sm" radius="md" className="cursor-pointer p-8 my-2">
                <div className="text-lg">{project.name}</div>
                <p className="text-gray-500">
                  Lorem ipsum dolor sit amet consectetur adipisicing elit. Optio
                  beatae illum magni aperiam eos consequuntur corporis deleniti
                  nesciunt, unde impedit?
                </p>
              </Card>
            </Link>
          ))}
        </ul>
      </main>
    </div>
  );
}
