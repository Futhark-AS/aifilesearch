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
  try {
    const res = await startProcessingReq(filenames, project);
    resolve(res);
  } catch (e) {
    reject("Error starting processing: " + e);
  }
};

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
