import { Controller, Get, Put, Body, UseGuards } from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { SettingsService } from "./settings.service";
import {
  UpdateSeoDto,
  UpdateSecurityDto,
  UpdateDatabaseSettingsDto,
} from "./dto/settings.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@ApiTags("系统设置")
@Controller("settings")
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get("seo")
  @ApiOperation({ summary: "获取 SEO 设置" })
  @ApiResponse({ status: 200, description: "获取成功" })
  async getSeo() {
    const data = await this.settingsService.getSeoSettings();
    return { code: 200, data };
  }

  @Put("seo")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "更新 SEO 设置" })
  @ApiResponse({ status: 200, description: "更新成功" })
  async updateSeo(@Body() updateSeoDto: UpdateSeoDto) {
    const data = await this.settingsService.updateSeo(updateSeoDto);
    return { code: 200, message: "SEO 设置保存成功", data };
  }

  @Get("security")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "获取安全设置" })
  @ApiResponse({ status: 200, description: "获取成功" })
  async getSecurity() {
    const data = await this.settingsService.getSecuritySettings();
    return { code: 200, data };
  }

  @Put("security")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "更新安全设置" })
  @ApiResponse({ status: 200, description: "更新成功" })
  async updateSecurity(@Body() updateSecurityDto: UpdateSecurityDto) {
    const data = await this.settingsService.updateSecurity(updateSecurityDto);
    return { code: 200, message: "安全设置保存成功", data };
  }

  @Get("backup")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "获取备份设置" })
  @ApiResponse({ status: 200, description: "获取成功" })
  async getBackup() {
    const data = await this.settingsService.getBackupSettings();
    return { code: 200, data };
  }

  @Get("database")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "获取数据库设置" })
  @ApiResponse({ status: 200, description: "获取成功" })
  async getDatabase() {
    const data = await this.settingsService.getDatabaseSettings();
    return { code: 200, data };
  }

  @Put("database")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "更新数据库设置" })
  @ApiResponse({ status: 200, description: "更新成功" })
  async updateDatabase(@Body() updateDatabaseDto: UpdateDatabaseSettingsDto) {
    const data =
      await this.settingsService.updateDatabaseSettings(updateDatabaseDto);
    return { code: 200, message: "数据库设置保存成功", data };
  }
}
