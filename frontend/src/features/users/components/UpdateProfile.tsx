import React from "react";
import * as z from "zod";

import { Button } from "@/components/Button";
import { Form, FormDrawer, InputField } from "@/components/Form";

import { useUser } from "@/redux/hooks";
import { PencilIcon } from "@heroicons/react/24/outline";
import { UpdateProfileDTO, useUpdateProfile } from "../api/updateProfile";

const schema = z.object({
  email: z.string().min(1, "Required"),
  name: z.string().min(1, "Required"),
});

export const UpdateProfile = () => {
  const user = useUser();
  const updateProfileMutation = useUpdateProfile();

  return (
    <FormDrawer
      isDone={updateProfileMutation.isSuccess}
      triggerButton={
        <Button startIcon={<PencilIcon className="h-4 w-4" />} size="sm">
          Update Profile
        </Button>
      }
      title="Update Profile"
      submitButton={
        <Button
          form="update-profile"
          type="submit"
          size="sm"
          isLoading={updateProfileMutation.isLoading}
        >
          Submit
        </Button>
      }
    >
      <Form<UpdateProfileDTO["data"], typeof schema>
        id="update-profile"
        onSubmit={async (values) => {
          await updateProfileMutation.mutateAsync({ data: values });
        }}
        options={{
          defaultValues: {
            name: user?.name,
            email: user?.email,
          },
        }}
        schema={schema}
      >
        {({ register, formState }) => {
          return (
            <>
              <InputField
                label="Name"
                error={formState.errors["name"]}
                registration={register("name")}
              />
              <InputField
                label="Email Address"
                type="email"
                error={formState.errors["email"]}
                registration={register("email")}
              />
            </>
          );
        }}
      </Form>
    </FormDrawer>
  );
};
