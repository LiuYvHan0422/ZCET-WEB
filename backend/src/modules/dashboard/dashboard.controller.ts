import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { DashboardService } from "./dashboard.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@ApiTags("仪表盘")
@Controller("dashboard")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get("stats")
  @ApiOperation({ summary: "获取仪表盘统计数据" })
  async getStats() {
    const stats = await this.dashboardService.getStats();
    return {
      code: 200,
      data: stats,
      message: "获取成功",
    };
  }

  @Get("recent-inquiries")
  @ApiOperation({ summary: "获取最近询盘" })
  async getRecentInquiries(@Query("limit") limit?: number) {
    const inquiries = await this.dashboardService.getRecentInquiries(limit);
    return {
      code: 200,
      data: inquiries,
      message: "获取成功",
    };
  }
}
