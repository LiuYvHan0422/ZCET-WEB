import { Container, getRandom } from "@cloudflare/containers";

interface Env {
  ApiContainer: DurableObjectNamespace<ApiContainer>;
  API_PREFIX?: string;
  CORS_ORIGIN?: string;
  DB_HOST?: string;
  DB_PORT?: string;
  DB_USERNAME?: string;
  DB_PASSWORD?: string;
  DB_DATABASE?: string;
  DB_SYNCHRONIZE?: string;
  DB_MIGRATIONS_RUN?: string;
  DB_LOGGING?: string;
  JWT_SECRET?: string;
  JWT_EXPIRATION?: string;
  ENABLE_DEV_LOGIN?: string;
  DEV_LOGIN_USERNAME?: string;
  SEED_ADMIN_USERNAME?: string;
  SEED_ADMIN_PASSWORD?: string;
}

export class ApiContainer extends Container<Env> {
  defaultPort = 8080;
  sleepAfter = "10m";
  envVars = {
    NODE_ENV: "production",
    PORT: "8080",
  };

  constructor(state: DurableObjectState, env: Env) {
    super(state, env);

    // Worker env/secrets are injected into the container process.
    this.envVars = {
      ...this.envVars,
      API_PREFIX: env.API_PREFIX || "api/v1",
      CORS_ORIGIN: env.CORS_ORIGIN || "",
      DB_HOST: env.DB_HOST || "",
      DB_PORT: env.DB_PORT || "3306",
      DB_USERNAME: env.DB_USERNAME || "",
      DB_PASSWORD: env.DB_PASSWORD || "",
      DB_DATABASE: env.DB_DATABASE || "",
      DB_SYNCHRONIZE: env.DB_SYNCHRONIZE || "false",
      DB_MIGRATIONS_RUN: env.DB_MIGRATIONS_RUN || "false",
      DB_LOGGING: env.DB_LOGGING || "false",
      JWT_SECRET: env.JWT_SECRET || "",
      JWT_EXPIRATION: env.JWT_EXPIRATION || "7d",
      ENABLE_DEV_LOGIN: env.ENABLE_DEV_LOGIN || "false",
      DEV_LOGIN_USERNAME: env.DEV_LOGIN_USERNAME || "admin",
      SEED_ADMIN_USERNAME: env.SEED_ADMIN_USERNAME || "admin",
      SEED_ADMIN_PASSWORD: env.SEED_ADMIN_PASSWORD || "",
    };
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const container = await getRandom(env.ApiContainer, 3);
    return container.fetch(request);
  },
};
