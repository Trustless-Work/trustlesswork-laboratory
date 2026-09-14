import type { ServerEnvConfig } from "@/lib/env/server-env-schema";

export class ApiEnv {
  constructor(private readonly config: ServerEnvConfig) {}

  get coreApiUrl(): string {
    return this.config.CORE_API_URL.replace(/\/$/, "");
  }

  get apiKey(): string {
    return this.config.TW_API_KEY;
  }
}
