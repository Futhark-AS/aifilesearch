import { azureAxios } from "@/lib/axios";

export const getUserCredits = async (): Promise<number> => {
  // const response = await baseAxios.get(API_URL + UsersApiUrls.getCredits);
  const response = await azureAxios.get('http://localhost:4242/get-credits');
  return response.data.credits;
};
