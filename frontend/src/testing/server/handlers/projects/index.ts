import { rest } from "msw";

import { API_URL } from "@/config";

import { getFiles, getProjects, getsastoken, query, startProcessing } from "./resolvers";
import { URLS } from "@/features/projects/requests";

export const projectsHandlers = [
  rest.get(`${API_URL}${URLS.getFiles}`, getFiles),
  rest.get(`${API_URL}${URLS.getProjects}`, getProjects),
  rest.post(`${API_URL}${URLS.query}`, query),
  rest.post(`${API_URL}${URLS.getSASToken}`, getsastoken),
  rest.post(`${API_URL}${URLS.startProcessing}`, startProcessing),
];