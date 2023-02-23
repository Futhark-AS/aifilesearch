import { azureAxios, baseAxios } from "@/lib/axios";
import { z } from "zod";
import { uploadFile } from "./azure-storage-blob";
import { createManyUnion, extractFileName } from "./utils";
import { c } from "msw/lib/glossary-de6278a9";

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

const apiQueryResponseSchema = z.object({
  matches: z.array(
    z.object({
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
    })
  ),
});

export type PromptMatch = {
  id: string;
  score: number;
  pageNumber: number;
  highlightBoundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  fileName: string;
  content: string;
};

export const transfromApiMatchesV1 = (
  data: z.infer<typeof apiQueryResponseSchema>
) => {
  const inchToPixel = (x: number) => x * 96;
  console.log("MATCHES", data.matches);
  return data.matches.map((match) => ({
    id: match.id,
    score: match.score,
    pageNumber: match.metadata.page_number,
    highlightBoundingBox: {
      x: inchToPixel(match.metadata.bounding_box[0][0].x),
      y: inchToPixel(match.metadata.bounding_box[0][0].y),
      width: inchToPixel(
        match.metadata.bounding_box[0][1].x -
          match.metadata.bounding_box[0][0].x
      ),
      height: inchToPixel(
        match.metadata.bounding_box[0][2].y -
          match.metadata.bounding_box[0][0].y
      ),
    },
    fileName: match.metadata.file_name,
    content: match.metadata.content,
  }));
};

export const searchProjectWithPromptReq = async (
  prompt: string,
  project: string
): Promise<PromptMatch[]> => {
  const res = await azureAxios.post(URLS.query, {
    prompt,
    project,
    topK: 10,
  });

  const parsed = apiQueryResponseSchema.parse(res.data);

  // API returns data in inches, we need to convert to pixels

  // Transform data from api to match PromptMatch type
  return transfromApiMatchesV1(parsed);
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

  return startProcessingResult.parse(res.data);
};

const processingStatus = createManyUnion([
  "Completed",
  "Running",
  "Pending",
] as const);
type processingStatus = z.infer<typeof processingStatus>;

const getProcessingStatusResult = z.object({
  runtimeStatus: processingStatus,
  output: z
    .object({
      error: z.string().optional(),
    })
    .nullable(),
});

export const getProcessingStatusReq = async (
  uri: string
): Promise<{ status: processingStatus; error: string; isError: boolean }> => {
  const res = await baseAxios.get(uri);

  const parsed = getProcessingStatusResult.parse(res.data);

  const isError = Boolean(
    parsed.output?.error && parsed.output.error.length > 0
  );

  return {
    status: parsed.runtimeStatus,
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

export const getFiles = async (project: string) => {
  const res = await azureAxios.get(URLS.getFiles(project));
  console.log(res);

  const apiReturnSchema = z.object({
    files: z.array(z.string()),
  });

  // TODO: fetch file metadata from api
  return apiReturnSchema.parse(res.data).files.map((name) => ({
    name: name,
    url: URLS.getBlobUri + `?blobName=${project}/${project}/${name}`, 
    size: "0",
    type: "pdf",
    pages: 10,
  }));
};
