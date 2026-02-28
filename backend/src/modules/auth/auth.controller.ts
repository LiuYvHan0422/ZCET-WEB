import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  ForbiddenException,
  UnauthorizedException,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { JwtService } from "@nestjs/jwt";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/auth.dto";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";

@ApiTags("认证管理")
@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
  ) {}

  @Post("login")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "管理员登录" })
  @ApiResponse({ status: 200, description: "登录成功" })
  @ApiResponse({ status: 401, description: "用户名或密码错误" })
  async login(@Body() loginDto: LoginDto) {
    const result = await this.authService.login(loginDto);

    return {
      code: 200,
      data: {
        token: result.access_token,
        user: result.admin,
      },
      message: "登录成功",
    };
  }

  @Post("dev-login")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "开发环境快捷登录（仅开发环境）" })
  @ApiResponse({ status: 200, description: "登录成功" })
  @ApiResponse({ status: 403, description: "当前环境未启用" })
  async devLogin() {
    if (
      process.env.NODE_ENV !== "development" ||
      process.env.ENABLE_DEV_LOGIN !== "true"
    ) {
      throw new ForbiddenException(
        "dev-login is only enabled in local development",
      );
    }

    const username = process.env.DEV_LOGIN_USERNAME || "admin";
    const admin = await this.authService.getActiveAdminByUsername(username);
    if (!admin) {
      throw new UnauthorizedException(
        "development admin account is not available",
      );
    }

    const payload = {
      sub: admin.id,
      username: admin.username,
      role: admin.role,
    };

    return {
      code: 200,
      data: {
        token: this.jwtService.sign(payload),
        user: {
          id: admin.id,
          username: admin.username,
          nickname: admin.nickname,
          role: admin.role,
        },
      },
      message: "开发环境登录成功",
    };
  }

  @Get("profile")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "获取当前管理员信息" })
  @ApiResponse({ status: 200, description: "获取成功" })
  async getProfile(@Request() req: any) {
    const data = await this.authService.getProfile(req.user.sub);
    return {
      code: 200,
      data,
      message: "获取成功",
    };
  }
}
