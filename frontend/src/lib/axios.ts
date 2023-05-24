import { API_URL } from "@/config";
import storage from "@/utils/storage";
import Axios, { InternalAxiosRequestConfig } from "axios";

export const azureAxios = Axios.create({ baseURL: API_URL });

azureAxios.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const token = storage.getAzureToken();

  if (token) {
    config.headers.set("X-ZUMO-AUTH", token);
    config.headers.set("Content-Type", "application/json");
  }

  return config;
});

export const baseAxios = Axios.create();
