import { Card } from "@mantine/core";
import Link from "next/link";
import Header from "../../components/Header";

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
      <Header />
      <main className="mx-auto w-[60ch]">
        <h1 className="text-3xl font-semibold ">Your projects</h1>
        <ul className="auto-responsive-lg grid">
          {projects.map((project) => (
            <Card shadow="sm" radius="md" className="p-8" key={project.id}>
              <Link href={`/projects/${project.id}`}>
                <a className="text-lg">{project.name}</a>
              </Link>
              <p className="text-gray-500">
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Optio
                beatae illum magni aperiam eos consequuntur corporis deleniti
                nesciunt, unde impedit?
              </p>
            </Card>
          ))}
        </ul>
      </main>
    </div>
  );
}
