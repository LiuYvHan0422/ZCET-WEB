import { startAppServer } from "./bootstrap";

async function bootstrap(): Promise<void> {
  const port = parseInt(process.env.PORT || "8001", 10);
  await startAppServer(port, { enableSwagger: true });
  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`API documentation: http://localhost:${port}/docs`);
}

bootstrap().catch((error: unknown) => {
  console.error("Failed to start application:", error);
  process.exit(1);
});
