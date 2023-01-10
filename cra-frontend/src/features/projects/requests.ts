import { azureAxios } from "@/lib/axios";
import { z } from "zod";
import { BlobServiceClient } from "@azure/storage-blob";
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
  uuid: z.string(),
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
  processed_files: z.array(z.string()),
  message: z.string(),
  ready: z.boolean(),
});

export const getProcessingStatusReq = async (uri: string) => {
  const res = await azureAxios.get(uri);

  return getProcessingStatusResult.parse(res.data);
};

export const getSASToken = async (blobName: string, permissions: "r" | "w") => {
  const res = await azureAxios.post("/api/getsastoken", {
    container: "users",
    // blobName: "sid:eb29ffbd4835f17f59814309696889de/michael/michael.pdf",
    blobName,
    permissions
  });

  return z.object({
    token: z.string(),
    uri: z.string()
  }).parse(res.data)
};

// {
//   processed_files: string[],
//   message: string,
//   ready: boolean
// }

export const postFile = async (uid: string, file: File, project: string) => {
  console.log(file.name)
  const sasTokenUri = (await getSASToken(`${uid}/${project}/${file.name}`, "w")).uri;
  console.log(sasTokenUri)
  uploadFile(sasTokenUri, file)

  console.log(sasTokenUri)

  // const account = "<account name>";
  // const sas = "<service Shared Access Signature Token>";
  
  // const blobServiceClient = new BlobServiceClient(`https://${account}.blob.core.windows.net${sas}`);

  // const res = await azureAxios.post("/api/upload", {
  //   file,
  //   project,
  // });

  // return res.data;
}
