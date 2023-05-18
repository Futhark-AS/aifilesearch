import React from "react";
import clsx from "clsx";
import { UseFormRegisterReturn } from "react-hook-form";

import { FieldWrapper, FieldWrapperPassThroughProps } from "./FieldWrapper";

type TextAreaFieldProps = FieldWrapperPassThroughProps & {
  registration: Partial<UseFormRegisterReturn>;
};

export const TextAreaField = (props: TextAreaFieldProps) => {
  const { label, className, registration, error, placeholder } = props;
  return (
    <FieldWrapper label={label} error={error}>
      <textarea
        placeholder={placeholder}
        className={clsx(
          "block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm",
          className
        )}
        {...registration}
      />
    </FieldWrapper>
  );
};
