import React from "react";
interface Props {
  title: string | React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function ProjectPage({ title, children, className }: Props) {
  return (
    <div className={`pt-4 px-10 ${className || ""}`}>
      <h2 className="text-left text-3xl font-extrabold leading-normal text-gray-700">
      {title}
      </h2>
      <hr className="mt-2 mb-4"/>
      {children}
    </div>
  );
}
