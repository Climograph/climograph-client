import { z as zod } from "zod";

const envSchema = zod.object({
  BASE_BACKEND_URL: zod.string().default("http://localhost:4000"),

  BASE_API_PREFIX: zod.string().default("/api"),

  NODE_ENV: zod.enum(["development", "production", "test"]).optional().default("development"),
});

export default envSchema.parse(import.meta.env);
