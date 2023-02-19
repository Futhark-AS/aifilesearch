export const extractFileName = (filePath: string) =>
  filePath.slice(filePath.lastIndexOf("/") + 1);