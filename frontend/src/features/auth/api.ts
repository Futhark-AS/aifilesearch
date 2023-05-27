import { azureAxios } from "@/lib/axios";
import { z } from "zod";
import { User } from "./types";
import { notifyError } from "@/utils/notify";

export const URLS = {
  user: "/api/user",
} as const;

type PostUserDTO = {
  email: string;
  name: string;
};

type PatchUserDTO = {
  id: string;
  credits?: number;
  email?: string;
  name?: string;
};

const DBUserSchema = z.object({
  id: z.string(),
  credits: z.number(),
  email: z.string(),
  name: z.string(),
  projects: z.array(
    z.object({
      namespace: z.string(),
      index_name: z.string(),
      cost: z.number(),
      files: z.array(
        z.object({
          blob_name: z.string(),
          price: z.number(),
          credits: z.number(),
          num_pages: z.number(),
          file_name: z.string(),
        })
      ),
    })
  ),
});

export type DBUser = z.infer<typeof DBUserSchema>;

const mapper = (user: DBUser): User => {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    credits: Number(user.credits.toFixed(0)),
    isLoggedIn: true,
    projects: user.projects.map((project) => ({
      name: project.namespace.split("/").pop() || "",
      files: project.files.map((file) => ({
        blobName: file.blob_name,
        price: file.price,
        pages: file.num_pages,
        fileName: file.file_name,
      })),
    })),
  };
};

export const getUser = async () => {
  const res = await azureAxios.get(URLS.user);
  const dbUser = DBUserSchema.safeParse(res.data);

  if (dbUser.success == false) {
    notifyError("Error in user schema", dbUser.error);
    throw new Error("Error in user schema");
  }

  return mapper(dbUser.data);
};

export const postUser = async (dto: PostUserDTO) => {
  const res = await azureAxios.post(URLS.user, dto);

  const dbUser = DBUserSchema.safeParse(res.data);

  if (dbUser.success == false) {
    notifyError("Error in user schema", dbUser.error);
    throw new Error("Error in user schema");
  }
  return mapper(dbUser.data);
};

export const patchUser = async (newUser: PatchUserDTO) => {
  const res = await azureAxios.patch(URLS.user, newUser);

  const dbUser = DBUserSchema.safeParse(res.data);
  if (dbUser.success == false) {
    notifyError("Error in user schema", dbUser.error);
    throw new Error("Error in user schema");
  }

  return mapper(dbUser.data);
};
