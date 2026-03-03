import { AxiosRequestConfig } from "axios";
import { axiosInstance } from "./axiosConfig";

/**
 * Typed API client wrapper
 * @template T - The expected response data type
 * @param {AxiosRequestConfig} config - Axios request configuration
 * @returns {Promise<T>} - Promise resolving to the response data of type T
 * @example
 * const data = await apiClient.get<User>({ url: '/users/me' });
 */
class APIClient {
  get<T = unknown>(config: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: "GET" });
  }
  post<T = unknown>(config: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: "POST" });
  }
  put<T = unknown>(config: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: "PUT" });
  }
  delete<T = unknown>(config: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: "DELETE" });
  }
  request<T = unknown>(config: AxiosRequestConfig): Promise<T> {
    return axiosInstance.request<unknown, T>(config);
  }
}

export default new APIClient();
