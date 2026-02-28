import { Controller, Get } from "@nestjs/common";

@Controller("healthz")
export class HealthController {
  @Get()
  getHealth() {
    return {
      code: 200,
      message: "ok",
      data: {
        status: "up",
        timestamp: Date.now(),
      },
    };
  }
}
