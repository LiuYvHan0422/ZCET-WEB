import {
  Body,
  Controller,
  Get,
  Header,
  Patch,
  Put,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { CompanyService } from "./company.service";
import { UpdateCompanyDto } from "./dto/company.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@ApiTags("公司信息")
@Controller("company")
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Get()
  @Header(
    "Cache-Control",
    "public, max-age=120, s-maxage=600, stale-while-revalidate=1200",
  )
  @ApiOperation({ summary: "获取公司信息" })
  @ApiResponse({ status: 200, description: "获取公司信息成功" })
  async findOne() {
    const data = await this.companyService.findOne();
    return { code: 200, data };
  }

  @Put()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "创建或更新公司信息" })
  @ApiResponse({ status: 200, description: "公司信息更新成功" })
  async createOrUpdate(@Body() updateCompanyDto: UpdateCompanyDto) {
    const data = await this.companyService.createOrUpdate(updateCompanyDto);
    return { code: 200, message: "保存成功", data };
  }

  @Patch()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "更新公司信息" })
  @ApiResponse({ status: 200, description: "公司信息更新成功" })
  async update(@Body() updateCompanyDto: UpdateCompanyDto) {
    const data = await this.companyService.update(updateCompanyDto);
    return { code: 200, message: "保存成功", data };
  }
}
