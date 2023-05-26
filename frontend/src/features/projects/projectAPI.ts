import { transformer } from "zod";
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

// import { PDFDocument } from "pdf-lib";
// import { pptxToPdf } from "pptx-to-pdf-converter";
// import { Image } from "canvas";

// async function convertToPdf(file: File): Promise<Uint8Array> {
//   if (file.type === "application/vnd.openxmlformats-officedocument.presentationml.presentation") {
//     // If it's a PowerPoint, convert to PDF using pptx-to-pdf-converter library
//     const pptx = await file.arrayBuffer();
//     const pdf = await pptxToPdf(pptx);
//     return new Uint8Array(pdf);
//   } else if (file.type.startsWith("image/")) {
//     // If it's an image, convert to PDF using pdf-lib library
//     const image = await Image.load(file.arrayBuffer());
//     const pdfDoc = await PDFDocument.create();
//     const page = pdfDoc.addPage([image.width, image.height]);
//     page.drawImage(image, {
//       x: 0,
//       y: 0,
//       width: image.width,
//       height: image.height,
//     });
//     const pdfBytes = await pdfDoc.save();
//     return new Uint8Array(pdfBytes);
//   } else {
//     // Unsupported file type
//     throw new Error(`Unsupported file type: ${file.type}`);
//   }
// }

async function transformFile(file: File): Promise<File> {
  if (file.type === "application/pdf") {
    // If it's already a PDF, just return the file
    return file;
  } else if (
    file.type === "application/vnd.openxmlformats-officedocument.presentationml.presentation" ||
    file.type.startsWith("image/")
  ) {
    // If it's a PowerPoint or image, convert to PDF using an external library
    // const pdf = await convertToPdf(file);

    // return new File([pdf], `${file.name}.pdf`, { type: "application/pdf" });

    // Unsupported file type currently
    throw new Error(`Unsupported file type: ${file.type}`);

  } else if (
    file.type === "application/msword" ||
    file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    file.type === "text/plain"
  ) {
    // If it's a doc or text document, just return the file
    return file;
  } else {
    // Unsupported file type
    throw new Error(`Unsupported file type: ${file.type}`);
  }
}


export const pdfNumberOfPages = async (file: File) => {
  const documentAsBytes = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(documentAsBytes)

  return pdfDoc.getPages().length;
}

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
              const new_files = []
              for (const file of files) {
                  const new_file = await transformFile(file).catch(e => {
                    reject(e);
                  });

                  if(!new_file) break
                  new_files.push(new_file)
              }

                for (const file of new_files) {
                  if (file.name.includes("/")) {
                    reject("File name cannot contain '/'");
                  }


                  await postFile(uid, file, project).catch(e => {
                      reject(e);
                  });

                  if(file.type === "application/pdf") {
                    const smallerFiles = await splitPdf(file, 15);
                    for (const smallerFile of smallerFiles) {
                      file_names.push(smallerFile.name)
                      console.log(smallerFile.name)
                        await postFile(uid, smallerFile, project).catch(e => {
                            reject(e);
                        });
                    }
                }
                else {
                  file_names.push(file.name)
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
}
;