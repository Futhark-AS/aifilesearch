import { rest } from "msw";

import { API_URL } from "@/config";

import { URLS } from "@/features/projects/requests";
import { getFiles, getProjects, getsastoken, query, startProcessing } from "./resolvers";

export const projectsHandlers = [
  rest.get(`${API_URL}${URLS.getFiles}`, getFiles),
  rest.get(`${API_URL}${URLS.getProjects}`, getProjects),
  rest.post(`${API_URL}${URLS.query}`, query),
  rest.post(`${API_URL}${URLS.getSASToken}`, getsastoken),
  rest.post(`${API_URL}${URLS.startProcessing}`, startProcessing),
];
