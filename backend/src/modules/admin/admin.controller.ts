import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Put,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { AdminService } from "./admin.service";
import { CreateAdminDto, UpdateAdminDto, AdminQueryDto } from "./dto/admin.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@ApiTags("管理员管理")
@Controller("admins")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post()
  @ApiOperation({ summary: "创建管理员" })
  @ApiResponse({ status: 201, description: "管理员创建成功" })
  create(@Body() createAdminDto: CreateAdminDto) {
    return this.adminService.create(createAdminDto);
  }

  @Get()
  @ApiOperation({ summary: "获取管理员列表" })
  @ApiResponse({ status: 200, description: "获取管理员列表成功" })
  findAll(@Query() query: AdminQueryDto) {
    return this.adminService.findAll(query);
  }

  @Get("profile")
  @ApiOperation({ summary: "获取当前管理员信息" })
  @ApiResponse({ status: 200, description: "获取成功" })
  async getProfile(@Request() req: any) {
    const data = await this.adminService.findOne(req.user.sub);
    return { code: 200, data };
  }

  @Put("profile")
  @ApiOperation({ summary: "更新当前管理员信息" })
  @ApiResponse({ status: 200, description: "更新成功" })
  async updateProfile(@Request() req: any, @Body() updateData: any) {
    const data = await this.adminService.updateProfile(
      req.user.sub,
      updateData,
    );
    return { code: 200, message: "资料更新成功", data };
  }

  @Patch("profile")
  @ApiOperation({ summary: "更新当前管理员信息" })
  @ApiResponse({ status: 200, description: "更新成功" })
  async updateProfilePatch(@Request() req: any, @Body() updateData: any) {
    const data = await this.adminService.updateProfile(
      req.user.sub,
      updateData,
    );
    return { code: 200, message: "资料更新成功", data };
  }

  @Get(":id")
  @ApiOperation({ summary: "获取管理员详情" })
  @ApiResponse({ status: 200, description: "获取管理员成功" })
  findOne(@Param("id") id: string) {
    return this.adminService.findOne(+id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "更新管理员" })
  @ApiResponse({ status: 200, description: "管理员更新成功" })
  update(@Param("id") id: string, @Body() updateAdminDto: UpdateAdminDto) {
    return this.adminService.update(+id, updateAdminDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "删除管理员" })
  @ApiResponse({ status: 200, description: "管理员删除成功" })
  remove(@Param("id") id: string) {
    return this.adminService.remove(+id);
  }
}
