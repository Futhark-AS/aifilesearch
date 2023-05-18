import { azureAxios, baseAxios } from "@/lib/axios";
import { z } from "zod";
import { UserState } from "./authSlice";

export const URLS = {
  user: "/api/user",
} as const;

type PostUserDTO = {
  id: string;
  email: string;
  name: string;
};

const documentSchema = z.object({
  id: z.string(),
  email: z.string().optional(),
  name: z.string().optional(),
  credits: z.number(),
  projects: z.array(
    z.object({
      namespace: z.string(),
      index_name: z.string(),
      cost: z.number(),
      files: z.array(z.string()),
    })
  ),
});

export type UserDocument = z.infer<typeof documentSchema>;

export const postUser = async (dto: PostUserDTO) => {
  const res = await azureAxios.post(URLS.user, dto);
  return documentSchema.parse(res.data);
};

export const patchUser = async (newUser: UserDocument) => {
    const res = await azureAxios.patch(URLS.user, newUser);
    return documentSchema.parse(res.data);
  };