import {
  getProcessingStatusReq,
  postFile,
  startProcessingReq,
} from "./requests";
import { setIntervalX } from "./utils";

/**
 * Start processing a given list of files (uploading)
 * @param filenames 
 * @param project 
 * @param resolve callback to call when processing is completed successfully
 * @param reject callback to call when processing is completed with an error
 */
export const startProcessing = async (
  filenames: string[],
  project: string,
  resolve: (val: unknown) => void,
  reject: (e: any) => void
) => {
  const res = await startProcessingReq(filenames, project);

  // Azure function timeout is 10 minutes, so we will check the status every minute 11 times for good measure
  const STATUS_RETRIES = 11;
  const STATUS_RETRY_DELAY = 60*1000; // 60 seconds

  // Check the status of the processing until recieved completed, and no error
  const clearInterval = setIntervalX(
    async () => {
      let processRes;
      try {
        processRes = await getProcessingStatusReq(res.uri);
      } catch (e) {
        reject(e);
        clearInterval();
        return;
      }

      switch (processRes.status) {
        case "Completed":
          if (processRes.isError) {
            reject(processRes.error);
            console.log(`Error: ${processRes.error}`);
          }
          resolve("success");
          clearInterval();
          break;
        case "Running":
          console.log(`Files uploading... (status: ${status}})`);
          break;
        case "Pending":
          console.log(`Files uploading... (status: ${status}})`);
          break;
        default:
          reject(
            "One process check recieved an unexpected status: " +
              processRes.status
          );
          clearInterval();
      }
    },
    STATUS_RETRY_DELAY,
    STATUS_RETRIES,
    () => {
      reject("Processing timed out");
    }
  );
};

export const handleFileUpload = async (
  files: File[],
  uid: string,
  project: string
) => {
  return new Promise((resolve, reject) => {
    for (const file of files) {
      postFile(uid, file, project).catch((e) => {
        reject(e);
      });
    }

    startProcessing(
      files.map((file) => file.name),
      project,
      resolve,
      reject
    );
  });
};
