import { ErrorConstant } from "@/constants";
import { GLOBAL_CONFIG } from "@/global-config";
import { userStore } from "@/stores";
import type { TApiResponse } from "@/types";
import axios, { type AxiosError, type AxiosResponse } from "axios";

export const axiosInstance = axios.create({
  baseURL: GLOBAL_CONFIG.apiBaseUrl,
  timeout: 50000,
  headers: { "Content-Type": "application/json;charset=utf-8" },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = userStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error instanceof Error ? error : new Error(String(error))),
);

axiosInstance.interceptors.response.use(
  <T>(res: AxiosResponse<TApiResponse<T>>) => {
    if (!res.data) throw new Error(ErrorConstant.API_REQUEST_FAILED);
    return res;
  },
  (error: AxiosError<TApiResponse<unknown>>) => {
    const { response, message } = error;

    const errMsg = response?.data?.message ?? message ?? ErrorConstant.API_REQUEST_FAILED;

    // * handle 401 Unauthorized - clear user session
    if (response?.status === 401) {
      userStore.getState().actions.clearUserInfoAndToken();
    }

    return Promise.reject(
      error instanceof Error ? Object.assign(error, { message: errMsg }) : new Error(errMsg),
    );
  },
);
