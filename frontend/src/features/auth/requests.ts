import { azureAxios } from "@/lib/axios";
import { z } from "zod";

export const URLS = {
  user: "/api/user",
} as const;

type PostUserDTO = {
  id: string;
  email: string;
  name: string;
};

export const documentSchema = z.object({
  id: z.string(),
  credits: z.number(),
  email: z.string().optional(),
  name: z.string().optional(),
  projects: z.array(
    z
      .object({
        namespace: z.string(),
        index_name: z.string(),
        cost: z.number(),
        files: z
          .array(
            z.object({
              blob_name: z.string(),
              price: z.number(),
              credits: z.number(),
              num_pages: z.number(),
              file_name: z.string(),
            })
          )
          .optional(),
      })
      .transform((val) => ({
        ...val,
        name: val.namespace.split("/")?.[1] ?? val.namespace,
        files: val.files ? val.files : [],
      }))
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
