import React from "react";
import clsx from "clsx";
import { UseFormRegisterReturn } from "react-hook-form";

import { FieldWrapper, FieldWrapperPassThroughProps } from './FieldWrapper';

type InputFieldProps = FieldWrapperPassThroughProps & {
  type?: "text" | "email" | "password" | "number";
  className?: string;
  registration: Partial<UseFormRegisterReturn>;
  wrapperClassname?: string;
};

export const InputField = (props: InputFieldProps) => {
  const {
    type = "text",
    label,
    className,
    registration,
    error,
    placeholder,
    wrapperClassname,
  } = props;
  return (
    <FieldWrapper label={label} error={error} className={wrapperClassname}>
      <input
        placeholder={placeholder}
        type={type}
        className={clsx(
          "block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm",
          className
        )}
        {...registration}
      />
    </FieldWrapper>
  );
};
