import { useMutation } from "react-query";

import { azureAxios } from "@/lib/axios";
import { MutationConfig } from "@/lib/react-query";
import { showNotification } from "@mantine/notifications";
import { UsersApiUrls } from "./urls";
import { UserState } from "@/features/auth/authSlice";

type UpdateProfileDTO = {
  name?: string;
  email?: string;
};

export const updateProfile = async (
  user: UserState,
  { name, email }: UpdateProfileDTO
) => {
  const newUser = Object.assign({}, user, { name, email });
  const result = await azureAxios.patch(UsersApiUrls.updateProfile, newUser);
};

type UseUpdateProfileOptions = {
  config?: MutationConfig<typeof updateProfile>;
};

export const useUpdateProfile = ({ config }: UseUpdateProfileOptions = {}) => {
  return useMutation({
    onSuccess: () => {
      showNotification({
        title: "Success",
        message: "User Updated",
      });

      // TODO: refetch user
    },
    ...config,
    mutationFn: updateProfile,
  });
};
