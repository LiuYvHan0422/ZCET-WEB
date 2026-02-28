import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { ExpressAdapter } from "@nestjs/platform-express";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import type { INestApplication } from "@nestjs/common";
import { AppModule } from "./app.module";

const DEFAULT_PORT = 8001;
const DEFAULT_API_PREFIX = "api/v1";

type CreateAppOptions = {
  enableSwagger?: boolean;
  host?: string;
};

function getCorsOrigins(raw: string): string[] {
  return raw
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

export async function createApp(
  options: CreateAppOptions = {},
): Promise<INestApplication> {
  // Explicitly provide Express adapter so platform package is statically bundled for Workers.
  const app = await NestFactory.create(AppModule, new ExpressAdapter(), {
    abortOnError: false,
  });

  const apiPrefix = process.env.API_PREFIX || DEFAULT_API_PREFIX;
  const corsOrigin =
    process.env.CORS_ORIGIN || "http://localhost:5173,http://localhost:8010";
  const corsOrigins = getCorsOrigins(corsOrigin);
  const enableSwagger = options.enableSwagger ?? true;

  app.setGlobalPrefix(apiPrefix);
  app.enableCors({
    origin: corsOrigins.includes("*") ? true : corsOrigins,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  if (enableSwagger) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle("Web V1.0 API")
      .setDescription("Web V1.0 backend API document")
      .setVersion("1.0")
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup("docs", app, document);
  }

  return app;
}

export async function startAppServer(
  port: number = DEFAULT_PORT,
  options: CreateAppOptions = {},
): Promise<INestApplication> {
  const app = await createApp(options);
  const host = options.host || process.env.HOST || "0.0.0.0";
  await app.listen(port, host);
  return app;
}
