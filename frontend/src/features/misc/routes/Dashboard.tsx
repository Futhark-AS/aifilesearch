import Projects from "@/features/projects/routes/Projects";
import { useUser } from "@/redux/hooks";
import { FileValidated } from "@dropzone-ui/react";
import React, { useState } from "react";

export const Dashboard: React.FC = () => {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 md:px-8">
      <Projects />
    </div>
  );
};
