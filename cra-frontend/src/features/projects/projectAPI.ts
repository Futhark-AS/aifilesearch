import {
  getProcessingStatusReq,
  postFile,
  startProcessingReq,
} from "./requests";

export const startProcessing = async (filenames: string[], project: string) => {
  const res = await startProcessingReq(filenames, project);
  const status = await getProcessingStatusReq(res.uri);
  //TODO: load and check status every 5 seconds until done

  console.log(res, status);
};

export const handleFileUpload = async (files: File[], uid: string, project: string) => {
  for (const file of files) {
    await postFile(uid, file, project);
  }

  startProcessing(
    files.map((file) => file.name),
    project
  );
};
