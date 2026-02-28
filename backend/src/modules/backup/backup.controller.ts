import { Controller, Get, Post, Body, UseGuards } from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { BackupService } from "./backup.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@ApiTags("数据备份")
@Controller("backup")
export class BackupController {
  constructor(private readonly backupService: BackupService) {}

  @Post("create")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "创建备份" })
  @ApiResponse({ status: 200, description: "备份创建成功" })
  async createBackup() {
    const result = await this.backupService.createBackup();
    return {
      code: result.success ? 200 : 500,
      message: result.message,
      filename: result.filename,
    };
  }

  @Post("restore")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "恢复备份" })
  @ApiResponse({ status: 200, description: "备份恢复成功" })
  async restoreBackup(@Body() body: { filename?: string }) {
    const result = await this.backupService.restoreBackup(body.filename);
    return {
      code: result.success ? 200 : 500,
      message: result.message,
    };
  }

  @Get("list")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "获取备份列表" })
  @ApiResponse({ status: 200, description: "获取成功" })
  async getBackupList() {
    const list = await this.backupService.getBackupList();
    return { code: 200, data: list };
  }
}
