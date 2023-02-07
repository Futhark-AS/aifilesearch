import { API_URL } from "@/config";
import storage from "@/utils/storage";
import Axios, { AxiosRequestConfig } from "axios";

// read react environment variable REACP_APP_API_URL
// const API_URL = process.env.REACT_APP_API_URL;

function authRequestInterceptor(config: AxiosRequestConfig) {
  const user = storage.getUser();

  const authHeaders = {
    "Content-Type": "application/json",
    "X-ZUMO-AUTH": user?.azureAuthToken,
  };

  let headers = config.headers;

  if (user?.azureAuthToken && headers) {
    headers = Object.assign(headers, authHeaders);
  }

  config.headers = headers;

  return config;
}

export const azureAxios = Axios.create({ baseURL: API_URL });

export const baseAxios = Axios.create();

azureAxios.interceptors.request.use(authRequestInterceptor);
