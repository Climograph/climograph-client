import { z as zod } from "zod";

const rawEnv = import.meta.env as Record<string, string | undefined>;

const envSchema = zod.object({
  BASE_BACKEND_URL: zod.string().default("http://localhost:4000"),

  BASE_API_PREFIX: zod.string().default("/api"),

  NODE_ENV: zod.enum(["development", "production", "test"]).optional().default("development"),

  WORLDCLIM_API_KEY: zod.string().default("example-api-key"),
});

export default envSchema.parse({
  // * vite only exposes client env vars prefixed with VITE_
  BASE_BACKEND_URL: rawEnv["VITE_BASE_BACKEND_URL"] ?? rawEnv["BASE_BACKEND_URL"],
  BASE_API_PREFIX: rawEnv["VITE_BASE_API_PREFIX"] ?? rawEnv["BASE_API_PREFIX"],
  NODE_ENV: rawEnv["VITE_NODE_ENV"] ?? rawEnv["NODE_ENV"],
  WORLDCLIM_API_KEY: rawEnv["VITE_WORLDCLIM_API_KEY"] ?? rawEnv["WORLDCLIM_API_KEY"],
});
