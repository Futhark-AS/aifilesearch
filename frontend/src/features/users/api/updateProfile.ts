import { useMutation } from 'react-query';

import { azureAxios } from '@/lib/axios';
import { MutationConfig } from '@/lib/react-query';
import { showNotification } from '@mantine/notifications';
import { UsersApiUrls } from './urls';

export type UpdateProfileDTO = {
  data: {
    email: string;
    name: string;
  };
};

export const updateProfile = async ({ data }: UpdateProfileDTO) => {
  return azureAxios.patch(UsersApiUrls.updateProfile, data);
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

      // TODO: refetch user
    },
    ...config,
    mutationFn: updateProfile,
  });
};
