import {
  Controller,
  Put,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { AdminService } from "./admin.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@ApiTags("管理员密码")
@Controller("admin")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AdminPasswordController {
  constructor(private readonly adminService: AdminService) {}

  @Put("password")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "修改当前管理员密码" })
  @ApiResponse({ status: 200, description: "密码修改成功" })
  @ApiResponse({ status: 400, description: "当前密码错误" })
  async updatePassword(
    @Request() req: any,
    @Body() body: { oldPassword: string; newPassword: string },
  ) {
    const { oldPassword, newPassword } = body;

    const success = await this.adminService.changePassword(
      req.user.sub,
      oldPassword,
      newPassword,
    );

    if (!success) {
      throw new BadRequestException("当前密码错误");
    }

    return { code: 200, message: "密码修改成功" };
  }
}
