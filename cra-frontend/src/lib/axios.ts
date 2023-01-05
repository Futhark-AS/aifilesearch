import storage from "@/utils/storage";
import Axios, { AxiosRequestConfig } from "axios";

const API_URL = process.env.REACT_APP_API_URL;

function authRequestInterceptor(config: AxiosRequestConfig) {
  const token = storage.getToken();

  let headers = config.headers;

  if (token && headers) {
    headers = Object.assign(headers, {
      Authorization: `Bearer ${token}`,
    });
  }

  config.headers = headers;

  return config;
}

export const axios = Axios.create({
  baseURL: API_URL,
});

axios.interceptors.request.use(authRequestInterceptor);
