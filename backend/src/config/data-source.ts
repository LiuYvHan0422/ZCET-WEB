import "reflect-metadata";
import { config as loadEnv } from "dotenv";
import { DataSource, DataSourceOptions } from "typeorm";
import * as path from "path";

loadEnv();

const toBoolean = (
  value: string | undefined,
  defaultValue = false,
): boolean => {
  if (value === undefined) {
    return defaultValue;
  }

  return value === "true";
};

const rootDir = path.resolve(__dirname, "..");

const dataSourceOptions: DataSourceOptions = {
  type: "mysql",
  host: process.env.DB_HOST || process.env.MYSQL_HOST || "127.0.0.1",
  port: parseInt(process.env.DB_PORT || process.env.MYSQL_PORT || "3306", 10),
  username: process.env.DB_USERNAME || process.env.MYSQL_USER || "root",
  password: process.env.DB_PASSWORD || process.env.MYSQL_PASSWORD || "",
  database: process.env.DB_DATABASE || process.env.MYSQL_DATABASE || "webv1",
  entities: [path.join(rootDir, "**/*.entity{.ts,.js}")],
  migrations: [path.join(rootDir, "migrations/*{.ts,.js}")],
  synchronize: toBoolean(process.env.DB_SYNCHRONIZE, false),
  migrationsRun: toBoolean(process.env.DB_MIGRATIONS_RUN, false),
  logging: toBoolean(
    process.env.DB_LOGGING,
    process.env.NODE_ENV === "development",
  )
    ? ["query", "error"]
    : false,
};

export default new DataSource(dataSourceOptions);
