import { azureAxios, baseAxios } from "@/lib/axios";
import { z } from "zod";
import { uploadFile } from "./azure-storage-blob";

const matchSchema = z.object({
  id: z.string(),
  score: z.number(),
  metadata: z.object({
    page_number: z.number(),
    bounding_box: z.array(
      z.array(
        z.object({
          x: z.number(),
          y: z.number(),
        })
      )
    ),
    file_name: z.string(),
    content: z.string(),
  }),
});

const promptResSchema = z.object({
  matches: z.array(matchSchema),
});

export type PromptMatch = z.infer<typeof matchSchema>;

export const searchProjectWithPromptReq = async (
  prompt: string,
  project: string,
  uid: string
) => {
  const res = await azureAxios.post(`/api/query`, {
    prompt,
    project,
    topK: 10,
    user_id: uid,
  });

  return promptResSchema.parse(res.data).matches;
};

const startProcessingResult = z.object({
  message: z.string(),
  uri: z.string(),
});

export const startProcessingReq = async (
  filenames: string[],
  project: string
) => {
  const res = await azureAxios.post(`/api/startProcessingDocuments`, {
    file_names: filenames,
    project: project,
  });

  console.log(res);

  return startProcessingResult.parse(res.data);
};

const getProcessingStatusResult = z.object({
  runtimeStatus: z.string(),
  // output: z.null().or(,
  // createdTime: "2023-01-11T13:35:28Z",
  // lastUpdatedTime: "2023-01-11T13:35:28Z"
});

export const getProcessingStatusReq = async (uri: string) => {
  const res = await baseAxios.get(uri);

  return getProcessingStatusResult.parse(res.data).runtimeStatus;
};

const getSASToken = async (blobName: string, permissions: "r" | "w") => {
  const res = await azureAxios.post("/api/getsastoken", {
    container: "users",
    blobName,
    permissions
  });

  return z.object({
    token: z.string(),
    uri: z.string()
  }).parse(res.data)
};

export const getBlobUri = async (blobName: string) => {
  return (await getSASToken(blobName, "r")).uri;
}


export const postFile = async (uid: string, file: File, project: string) => {
  const sasTokenUri = (await getSASToken(`${uid}/${project}/${file.name}`, "w")).uri;
  await uploadFile(sasTokenUri, file)
}
