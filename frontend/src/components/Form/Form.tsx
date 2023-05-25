import { zodResolver } from "@hookform/resolvers/zod";
import clsx from "clsx";
import React from "react";
import {
  useForm,
  UseFormReturn,
  SubmitHandler,
  UseFormProps,
  FieldValues,
} from "react-hook-form";
import { ZodType, ZodTypeDef } from "zod";

type FormProps<TFormValues extends FieldValues, Schema> = {
  className?: string;
  onSubmit: SubmitHandler<TFormValues>;
  children: (methods: UseFormReturn<TFormValues>) => React.ReactNode;
  options?: UseFormProps<TFormValues>;
  id?: string;
  schema?: Schema;
};

export const Form = <
  TFormValues extends Record<string, unknown> = Record<string, unknown>,
  Schema extends ZodType<unknown, ZodTypeDef, unknown> = ZodType<
    unknown,
    ZodTypeDef,
    unknown
  >
>({
  onSubmit,
  children,
  className,
  options,
  id,
  schema,
}: FormProps<TFormValues, Schema>) => {
  const methods = useForm<TFormValues>({
    ...options,
    resolver:
      schema &&
      (async (data, context, options) => {
        // you can debug your validation schema here
        console.log(
          "validation result",
          await zodResolver(schema)(data, context, options)
        );
        return zodResolver(schema)(data, context, options);
      }),
  });

  return (
    <form
      className={clsx("space-y-6", className)}
      onSubmit={(e) => {
        methods.handleSubmit(onSubmit)(e);
        methods.reset();
      }}
      id={id}
    >
      {children(methods)}
    </form>
  );
};
