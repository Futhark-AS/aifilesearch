export type Project = {
  name: string;
  files: ProjectFile[];
};

export type ProjectFile = {
  blobName: string;
  price: number;
  pages: number;
  fileName: string;
  numParagraphs: number | null;
  uploadedDate: string | null;
};

export type User = {
  id: string;
  email: string;
  name: string;
  credits: number;
  isLoggedIn: boolean;
  projects: Project[];
};
