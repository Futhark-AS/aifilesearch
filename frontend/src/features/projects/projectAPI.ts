import {
  getProcessingStatusReq,
  postFile,
  startProcessingReq,
} from "./requests";

function setIntervalX(
  callback: () => void,
  delay: number,
  repetitions: number
) {
  let x = 0;
  const intervalID = window.setInterval(function () {
    callback();

    if (++x === repetitions) {
      window.clearInterval(intervalID);
    }
  }, delay);
  return () => window.clearInterval(intervalID);
}

export const startProcessing = async (
  filenames: string[],
  project: string,
  resolve: (val: unknown) => void,
  reject: (e: any) => void
) => {
  const res = await startProcessingReq(filenames, project);

  const clearInterval = setIntervalX(
    async () => {
      const processRes = await getProcessingStatusReq(res.uri);
      switch (processRes.runtimeStatus) {
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
              processRes.runtimeStatus
          );
          clearInterval();
      }
    },
    2500,
    10
  );
};

export const handleFileUpload = async (
  files: File[],
  uid: string,
  project: string,
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
