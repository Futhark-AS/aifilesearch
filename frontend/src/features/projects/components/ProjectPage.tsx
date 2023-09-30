import React from "react";
interface Props {
  title: string | React.ReactNode;
  children: React.ReactNode;
}

export function ProjectPage({ title, children }: Props) {
  return (
    <div className="pt-4 px-10">
      <h2 className="text-left text-3xl font-extrabold leading-normal text-gray-700">
      {title}
      </h2>
      <hr className="mt-2 mb-4"/>
      {children}
    </div>
  );
}
