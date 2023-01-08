import { azureAxios } from "@/lib/axios";
import { z } from "zod";

const promptResult = z.array(
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
);

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

  console.log(res);

  return promptResult.parse(res.data);
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

// {
//   processed_files: string[],
//   message: string,
//   ready: boolean
// }
