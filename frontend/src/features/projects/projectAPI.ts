import {
  getProcessingStatusReq,
  postFile,
  startProcessingReq,
} from "./requests";
import { setIntervalX } from "./utils";
import { PDFDocument } from 'pdf-lib'

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

  async function splitPdf(file: File, pagesPerChunk: number): Promise<File[]> {
      // Load your PDFDocument
      const documentAsBytes = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(documentAsBytes)
  
      const numberOfPages = pdfDoc.getPages().length;
  
      const arr: File[] = []
      for (let i = 0; i < numberOfPages; i += pagesPerChunk) {
  
          // Create a new "sub" document
          const subDocument = await PDFDocument.create();
          
          // Get the indices for next n pages or till the end, whichever is smaller
          const pageIndices = Array.from({length: Math.min(pagesPerChunk, numberOfPages - i)}, (_, k) => k + i);
  
          // copy the pages at current indices
          const copiedPages = await subDocument.copyPages(pdfDoc, pageIndices);
          copiedPages.forEach(page => subDocument.addPage(page));
          
          const pdfBytes = await subDocument.save();
          const blob = new Blob([pdfBytes], {type: "application/pdf"});
          const smallFile = new File([blob], `${file.name.replace(".pdf", "")}---split---${i}-${i + pagesPerChunk}.pdf`);
          arr.push(smallFile);
      }
      return arr;
  }
  export const handleFileUpload = (
    files: File[],
    uid: string,
    project: string
) => {
    return new Promise((resolve, reject) => {
        (async () => {
            try {
              const file_names = []
                for (const file of files) {
                  if (file.name.includes("/")) {
                    reject("File name cannot contain '/'");
                  }

                  await postFile(uid, file, project).catch(e => {
                      reject(e);
                  });
                    const smallerFiles = await splitPdf(file, 15);
                    for (const smallerFile of smallerFiles) {
                      file_names.push(smallerFile.name)
                      console.log(smallerFile.name)
                        await postFile(uid, smallerFile, project).catch(e => {
                            reject(e);
                        });
                    }
                }
                startProcessing(
                    file_names,
                    project,
                    resolve,
                    reject
                );
            } catch (e) {
                reject(e);
            }
        })();
    });
};
