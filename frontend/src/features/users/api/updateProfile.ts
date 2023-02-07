import { useMutation } from 'react-query';

import { MutationConfig } from '@/lib/react-query';
import { showNotification } from '@mantine/notifications';

export type UpdateProfileDTO = {
  data: {
    email: string;
    firstName: string;
    lastName: string;
    bio: string;
  };
};

export const updateProfile = async ({ data }: UpdateProfileDTO) => {
  return null
  // return axios.patch(`/users/profile`, data);
};

type UseUpdateProfileOptions = {
  config?: MutationConfig<typeof updateProfile>;
};

export const useUpdateProfile = ({ config }: UseUpdateProfileOptions = {}) => {

  return useMutation({
    onSuccess: () => {
      showNotification({
        title: "Success",
        message: 'User Updated'
      })

      // refetchUser();
    },
    ...config,
    mutationFn: updateProfile,
  });
};
