import { azureAxios, baseAxios } from "@/lib/axios";
import { z } from "zod";
import { uploadFile } from "./azure-storage-blob";
import { createManyUnion, highlightBoundingBox } from "./utils";
import axios from "axios";
import { Message } from "./components";
import { HighlightedBox } from "@/components/PdfViewer";
import { documentSchema } from "../auth/requests";

export const URLS = {
  query: "/api/query",
  startProcessing: "/api/startProcessingDocuments",
  getProcessingStatus: "/api/getProcessingStatus",
  getSASToken: "/api/getsastoken",
  getBlobUri: "/api/getBlobUri",
  postFile: "/api/postFile",
  getFiles: (project: string) => `/api/projects/${project}`,
  user: "/api/user",
  createProject: "/api/createProject",
  payment: "/api/payment",
  chat: "/api/chat",
} as const;

const queryResponseBoundingBoxSchema = z.object({
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

const queryResponseSchema = z.object({
  matches: z.array(
    z.object({
      id: z.string(),
      score: z.number(),
      metadata: z.object({
        page_number: z.number(),
        file_name: z.string(),
        content: z.string(),
      }),
    })
  ),
});

export type PromptMatch = {
  id: string;
  score: number;
  blobName: string;
  highlightedBox: HighlightedBox;
  citation?: string;
};

export const transfromApiMatchesV1 = (
  data: z.infer<typeof queryResponseBoundingBoxSchema>
): PromptMatch[] => {
  const inchToPixel = (x: number) => x * 96;
  console.log("MATCHES", data.matches);
  return data.matches.map((match) => ({
    id: match.id,
    score: match.score,
    pageNumber: match.metadata.page_number,
    highlightedBox: {
      boundingBox: {
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
      pageNumber: match.metadata.page_number,
      type: "image",
      content: match.metadata.content,
    },
    blobName: match.metadata.file_name,
  }));
};

export const transfromApiMatchesV2 = (
  data: z.infer<typeof queryResponseSchema>
): PromptMatch[] => {
  return data.matches.map((match) => ({
    id: match.id,
    score: match.score,
    highlightedBox: {
      content: match.metadata.content,
      pageNumber: match.metadata.page_number,
      type: "text",
    },
    blobName: match.metadata.file_name,
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

  // if response has property .matches and has length 1 and matches[0] has property .metadata and .metadata has property .bounding_box, it is a bounding box type
  if (
    res.data.matches &&
    res.data.matches.length > 0 &&
    res.data.matches[0].metadata &&
    res.data.matches[0].metadata.bounding_box
  ) {
    const parsed = queryResponseBoundingBoxSchema.parse(res.data);
    return transfromApiMatchesV1(parsed);
  } else {
    const parsed = queryResponseSchema.parse(res.data);
    return transfromApiMatchesV2(parsed);
  }
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

export const getUser = async () => {
  const res = await azureAxios.get(URLS.user);
  return documentSchema.parse(res.data);
};

export type ProjectFile = {
  name: string;
  blobName: string;
  numPages: number;
}
export const getFiles = async (project: string): Promise<ProjectFile[]> => {
  const res = await azureAxios.get(URLS.getFiles(project));
  console.log(res.data);

  const apiReturnSchema = z.object({
    files: z.array(
      z.object({
        blob_name: z.string(),
        credits: z.number(),
        num_pages: z.number(),
        file_name: z.string(),
      })
    ).optional().default([]),
  });

  // TODO: fetch file metadata from api
  return apiReturnSchema.parse(res.data).files.map((file) => ({
    name: file.file_name,
    blobName: file.blob_name,
    numPages: file.num_pages,
  }));
};

export const createProject = async (name: string) => {
  const res = await azureAxios.post(URLS.createProject, {
    projectName: name,
  });
  return res.data;
};

export const createPaymentIntent = async (
  fileNames: string[],
  project: string
) => {
  const res = await azureAxios.post(URLS.payment, {
    file_names: fileNames,
    project,
  });

  return z
    .object({
      clientSecret: z.string(),
      data: z.array(
        z.object({
          name: z.string(),
          price: z.number(),
        })
      ),
    })
    .parse(res.data);
};

export const creditsPaymentIntent = async (amount: number) => {
  // const res = await azureAxios.post("/api/newstripepaymentintent",
  const res = await azureAxios.post("/api/newstripepaymentintent", {
    // const res = await azureAxios.post(URLS.payment, {
    paymentType: "credits",
    credits: amount,
  });

  return z
    .object({
      clientSecret: z.string(),
    })
    .parse(res.data);
};

export const getNewChatMessage = async (messages: Message[]) => {
  const res = await azureAxios.post(URLS.chat, {
    messages: messages,
  });

  return z.object({ text: z.string() }).parse(res.data).text;
};

export const getNewChatMessageMock = async (messages: Message[]) => {
  // This function simulates the response from azureAxios.post
  const mockAzureAxiosPost = async (url: any, data: any) => {
    // Simulate some delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Return some mock response
    return {
      data: {
        text: "This is a mock response text",
      },
    };
  };

  const res = await mockAzureAxiosPost(URLS.chat, {
    messages: messages,
  });

  return z.object({ text: z.string() }).parse(res.data).text;
};