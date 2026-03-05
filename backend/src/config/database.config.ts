const toBoolean = (
  value: string | undefined,
  defaultValue = false,
): boolean => {
  if (value === undefined) {
    return defaultValue;
  }
  return value === "true";
};

const toInt = (
  value: string | undefined,
  defaultValue: number,
): number => {
  if (value === undefined || value === "") {
    return defaultValue;
  }
  const parsed = parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : defaultValue;
};

export const databaseConfig = () => ({
  database: {
    host: process.env.DB_HOST || process.env.MYSQL_HOST || "127.0.0.1",
    port: parseInt(process.env.DB_PORT || process.env.MYSQL_PORT || "3306", 10),
    username: process.env.DB_USERNAME || process.env.MYSQL_USER || "root",
    password: process.env.DB_PASSWORD || process.env.MYSQL_PASSWORD || "",
    database: process.env.DB_DATABASE || process.env.MYSQL_DATABASE || "webv1",
    synchronize: toBoolean(process.env.DB_SYNCHRONIZE, false),
    migrationsRun: toBoolean(process.env.DB_MIGRATIONS_RUN, false),
    logging: toBoolean(
      process.env.DB_LOGGING,
      process.env.NODE_ENV === "development",
    ),
    connectionLimit: toInt(process.env.DB_CONNECTION_LIMIT, 10),
    queueLimit: toInt(process.env.DB_QUEUE_LIMIT, 0),
    keepAlive: toBoolean(process.env.DB_KEEPALIVE, true),
    keepAliveInitialDelay: toInt(process.env.DB_KEEPALIVE_INITIAL_DELAY, 10000),
    connectTimeout: toInt(process.env.DB_CONNECT_TIMEOUT, 10000),
  },
});
