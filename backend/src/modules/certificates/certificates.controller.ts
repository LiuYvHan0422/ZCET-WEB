import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { CertificatesService } from "./certificates.service";
import {
  CreateCertificateDto,
  UpdateCertificateDto,
  CertificateQueryDto,
} from "./dto/certificate.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@ApiTags("证书管理")
@Controller("certificates")
export class CertificatesController {
  constructor(private readonly certificatesService: CertificatesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "创建证书" })
  @ApiResponse({ status: 201, description: "证书创建成功" })
  async create(@Body() createCertificateDto: CreateCertificateDto) {
    const data = await this.certificatesService.create(createCertificateDto);
    return { code: 200, message: "证书创建成功", data };
  }

  @Get()
  @ApiOperation({ summary: "获取证书列表" })
  @ApiResponse({ status: 200, description: "获取证书列表成功" })
  findAll(@Query() query: CertificateQueryDto) {
    return this.certificatesService.findAll(query);
  }

  @Get("all")
  @ApiOperation({ summary: "获取所有证书（前台）" })
  @ApiResponse({ status: 200, description: "获取所有证书成功" })
  async getAll() {
    const data = await this.certificatesService.getAll();
    return { code: 200, message: "获取所有证书成功", data };
  }

  @Get(":id")
  @ApiOperation({ summary: "获取证书详情" })
  @ApiResponse({ status: 200, description: "获取证书成功" })
  findOne(@Param("id") id: string) {
    return this.certificatesService.findOne(+id);
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "更新证书" })
  @ApiResponse({ status: 200, description: "证书更新成功" })
  async update(
    @Param("id") id: string,
    @Body() updateCertificateDto: UpdateCertificateDto,
  ) {
    const data = await this.certificatesService.update(
      +id,
      updateCertificateDto,
    );
    return { code: 200, message: "证书更新成功", data };
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "删除证书" })
  @ApiResponse({ status: 200, description: "证书删除成功" })
  async remove(@Param("id") id: string) {
    await this.certificatesService.remove(+id);
    return { code: 200, message: "证书删除成功" };
  }
}
