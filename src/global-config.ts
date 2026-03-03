import packageJson from "../package.json";
import env from "./env";

/**
 * Global application configuration type definition
 */
export interface GlobalConfig {
  appName: string;
  appVersion: string;
  apiBaseUrl: string;
}

/**
 * Global configuration constants
 * Reads configuration from environment variables and package.json
 *
 * @warning
 * Please don't use the import.meta.env to get the configuration, use the GLOBAL_CONFIG instead
 */
export const GLOBAL_CONFIG: GlobalConfig = {
  appName: packageJson.name,
  appVersion: packageJson.version,
  apiBaseUrl: env.BASE_BACKEND_URL + env.BASE_API_PREFIX,
};
