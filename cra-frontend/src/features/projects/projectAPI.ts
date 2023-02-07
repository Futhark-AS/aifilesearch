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
  setCompleted: () => void
) => {
  const res = await startProcessingReq(filenames, project);
  // const status = await getProcessingStatusReq(res.uri);

  const clearInterval = setIntervalX(
    async () => {
      const status = await getProcessingStatusReq(res.uri);
      switch (status) {
        case "Completed":
          setCompleted();
          clearInterval();
          break;
        case "Running":
          console.log(`Files uploading... (status: ${status}})`);
          break;
        case "Pending":
          console.log(`Files uploading... (status: ${status}})`);
          break;
        default:
          setCompleted();
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
  setCompleted: () => void
) => {
  for (const file of files) {
    await postFile(uid, file, project);
  }

  startProcessing(
    files.map((file) => file.name),
    project,
    setCompleted
  );
};
