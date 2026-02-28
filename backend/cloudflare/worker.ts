import "reflect-metadata";
import { handleAsNodeRequest } from "cloudflare:node";

type HyperdriveBinding = {
  connectionString?: string;
  host?: string;
  port?: number | string;
  user?: string;
  password?: string;
  database?: string;
};

type WorkerEnv = {
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
  HYPERDRIVE?: HyperdriveBinding;
  DB?: HyperdriveBinding;
};

const PORT = parseInt(process.env.PORT || "8080", 10);
let startupPromise: Promise<void> | null = null;

function setEnvIfMissing(
  key: string,
  value: string | number | undefined,
  overwrite = false,
): void {
  if (value === undefined || value === null) {
    return;
  }

  const normalized = String(value).trim();
  if (!normalized) {
    return;
  }

  if (overwrite || !process.env[key]) {
    process.env[key] = normalized;
  }
}

function populateDbFromConnectionString(
  connectionString: string,
  overwrite = false,
): void {
  try {
    const parsed = new URL(connectionString);
    setEnvIfMissing("DB_HOST", parsed.hostname, overwrite);
    setEnvIfMissing("DB_PORT", parsed.port, overwrite);
    setEnvIfMissing("DB_USERNAME", decodeURIComponent(parsed.username), overwrite);
    setEnvIfMissing("DB_PASSWORD", decodeURIComponent(parsed.password), overwrite);
    setEnvIfMissing("DB_DATABASE", parsed.pathname.replace(/^\//, ""), overwrite);
  } catch {
    // Ignore malformed URLs and keep explicit env values.
  }
}

function applyRuntimeEnv(env: WorkerEnv): void {
  const hyperdrive = env.HYPERDRIVE || env.DB;
  if (hyperdrive) {
    // Prefer Hyperdrive binding values over plain env DB_* values when present.
    setEnvIfMissing("DB_HOST", hyperdrive.host, true);
    setEnvIfMissing("DB_PORT", hyperdrive.port, true);
    setEnvIfMissing("DB_USERNAME", hyperdrive.user, true);
    setEnvIfMissing("DB_PASSWORD", hyperdrive.password, true);
    setEnvIfMissing("DB_DATABASE", hyperdrive.database, true);

    if (hyperdrive.connectionString) {
      populateDbFromConnectionString(hyperdrive.connectionString, true);
    }
  }

  const directKeys: Array<keyof WorkerEnv> = [
    "API_PREFIX",
    "CORS_ORIGIN",
    "DB_HOST",
    "DB_PORT",
    "DB_USERNAME",
    "DB_PASSWORD",
    "DB_DATABASE",
    "DB_SYNCHRONIZE",
    "DB_MIGRATIONS_RUN",
    "DB_LOGGING",
    "JWT_SECRET",
    "JWT_EXPIRATION",
    "ENABLE_DEV_LOGIN",
    "DEV_LOGIN_USERNAME",
    "SEED_ADMIN_USERNAME",
    "SEED_ADMIN_PASSWORD",
  ];

  for (const key of directKeys) {
    const value = env[key];
    if (typeof value === "string") {
      setEnvIfMissing(key, value);
    }
  }
}

async function ensureServerStarted(env: WorkerEnv): Promise<void> {
  if (startupPromise) {
    return startupPromise;
  }

  startupPromise = (async () => {
    applyRuntimeEnv(env);
    const { startAppServer } = await import("../src/bootstrap");
    await startAppServer(PORT, { enableSwagger: false, host: "127.0.0.1" });
  })().catch((error) => {
    startupPromise = null;
    throw error;
  });

  return startupPromise;
}

export default {
  async fetch(request: Request, env: WorkerEnv): Promise<Response> {
    try {
      await ensureServerStarted(env);
      return await handleAsNodeRequest(PORT, request);
    } catch (error) {
      console.error("Worker bootstrap failed:", error);
      return new Response("Backend bootstrap failed", { status: 500 });
    }
  },
};
