const toBoolean = (
  value: string | undefined,
  defaultValue = false,
): boolean => {
  if (value === undefined) {
    return defaultValue;
  }
  return value === "true";
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
  },
});
