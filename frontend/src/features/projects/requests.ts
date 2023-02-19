import { azureAxios, baseAxios } from "@/lib/axios";
import { z } from "zod";
import { uploadFile } from "./azure-storage-blob";

export const URLS = {
  query: "/api/query",
  startProcessing: "/api/startProcessingDocuments",
  getProcessingStatus: "/api/getProcessingStatus",
  getSASToken: "/api/getsastoken",
  getBlobUri: "/api/getBlobUri",
  postFile: "/api/postFile",
  getFiles: (project: string) => `/api/projects/${project}`,
  getProjects: "/api/getProjects",
} as const;

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
  const res = await azureAxios.post(URLS.query, {
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
  const res = await azureAxios.post(URLS.startProcessing, {
    file_names: filenames,
    project: project,
  });

  console.log(res);

  return startProcessingResult.parse(res.data);
};

const getProcessingStatusResult = z.object({
  runtimeStatus: z.string(),
  output: z
    .object({
      error: z.string().optional(),
    })
    .optional(),
  // output: z.null().or(,
  // createdTime: "2023-01-11T13:35:28Z",
  // lastUpdatedTime: "2023-01-11T13:35:28Z"
});

export const getProcessingStatusReq = async (
  uri: string
): Promise<{ runtimeStatus: string; error: string; isError: boolean }> => {
  const res = await baseAxios.get(uri);

  const parsed = getProcessingStatusResult.parse(res.data);

  const isError = Boolean(
    parsed.output?.error && parsed.output.error.length > 0
  );

  return {
    runtimeStatus: parsed.runtimeStatus,
    error: parsed.output?.error || "",
    isError: isError,
  };
};

const getSASToken = async (blobName: string, permissions: "r" | "w") => {
  const res = await azureAxios.post(URLS.getSASToken, {
    container: "users",
    blobName,
    permissions,
  });

  return z
    .object({
      token: z.string(),
      uri: z.string(),
    })
    .parse(res.data);
};

export const getBlobUri = async (blobName: string) => {
  return (await getSASToken(blobName, "r")).uri;
};

export const postFile = async (uid: string, file: File, project: string) => {
  const sasTokenUri = (await getSASToken(`${uid}/${project}/${file.name}`, "w"))
    .uri;
  await uploadFile(sasTokenUri, file);
};

export const getProjects = async (uid: string) => {
  const res = await azureAxios.get(URLS.getProjects + `?user_id=${uid}`);
  return z.object({ projects: z.array(z.string()) }).parse(res.data).projects;
};

export const getFiles = async () => {
  const res = await azureAxios.get(URLS.getFiles("michael"));

  // TODO: fetch file metadata from api
  return z
    .array(z.string())
    .parse(res.data)
    .map((name) => ({
      name: name.split("/").slice(-1)[0],
      url: URLS.getBlobUri + `?blobName=michael/michael/${name}`,
      size: "0",
      type: "pdf",
      pages: 10,
    }));
};
