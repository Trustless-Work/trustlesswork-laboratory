import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const serverEnvSchema = createEnv({
  server: {
    CORE_API_URL: z.string().url(),
    TW_API_KEY: z.string().min(1),
    NODE_ENV: z
      .enum(["development", "production", "test"])
      .default("development"),
  },
  client: {},
  runtimeEnv: {
    CORE_API_URL: process.env.CORE_API_URL,
    TW_API_KEY: process.env.TW_API_KEY,
    NODE_ENV: process.env.NODE_ENV,
  },
  emptyStringAsUndefined: true,
  skipValidation: process.env.SKIP_ENV_VALIDATION === "true",
});

export type ServerEnvConfig = typeof serverEnvSchema;
