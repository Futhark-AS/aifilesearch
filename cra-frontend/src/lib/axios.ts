import storage from "@/utils/storage";
import Axios, { AxiosRequestConfig } from "axios";

// read react environment variable REACP_APP_API_URL
// const API_URL = process.env.REACT_APP_API_URL;

function authRequestInterceptor(config: AxiosRequestConfig) {
  const token = storage.getUser();

  let headers = config.headers;

  if (token && headers) {
    headers = Object.assign(headers, {
      Authorization: `Bearer ${token}`,
    });
  }

  config.headers = headers;

  return config;
}

export const axios = Axios
  .create
  // { baseURL: API_URL, }
  ();

// axios.interceptors.request.use(authRequestInterceptor);