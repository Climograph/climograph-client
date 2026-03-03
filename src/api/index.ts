/**
 * Recommended: Use apiClient for most API calls
 * @example
 * const user = await apiClient.get<User>({ url: '/users/me' });
 */
export { default as apiClient } from "./apiClient";

/**
 * Advanced: Use axiosInstance for special cases like:
 * - File uploads with progress tracking
 * - Custom response types (blob, stream)
 * - Cancel tokens
 * - Per-request custom headers
 */
export { axiosInstance } from "./axiosConfig";
