import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Patch,
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
import { InquiriesService } from "./inquiries.service";
import {
  CreateInquiryDto,
  UpdateInquiryDto,
  InquiryQueryDto,
} from "./dto/inquiry.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@ApiTags("询盘管理")
@Controller("inquiries")
export class InquiriesController {
  constructor(private readonly inquiriesService: InquiriesService) {}

  @Post()
  @ApiOperation({ summary: "提交询盘" })
  @ApiResponse({ status: 201, description: "询盘提交成功" })
  async create(@Body() createInquiryDto: CreateInquiryDto) {
    const data = await this.inquiriesService.create(createInquiryDto);
    return { code: 201, message: "询盘提交成功", data };
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "获取询盘列表" })
  @ApiResponse({ status: 200, description: "获取询盘列表成功" })
  async findAll(@Query() query: InquiryQueryDto) {
    const data = await this.inquiriesService.findAll(query);
    return { code: 200, message: "获取询盘列表成功", data };
  }

  @Get("pending-count")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "获取待处理询盘数量" })
  @ApiResponse({ status: 200, description: "获取成功" })
  async getPendingCount() {
    const data = await this.inquiriesService.getPendingCount();
    return { code: 200, message: "获取成功", data };
  }

  @Get(":id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "获取询盘详情" })
  @ApiResponse({ status: 200, description: "获取询盘成功" })
  async findOne(@Param("id") id: string) {
    const data = await this.inquiriesService.findOne(+id);
    return { code: 200, message: "获取询盘成功", data };
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "更新询盘状态/备注" })
  @ApiResponse({ status: 200, description: "询盘更新成功" })
  async update(
    @Param("id") id: string,
    @Body() updateInquiryDto: UpdateInquiryDto,
  ) {
    const data = await this.inquiriesService.update(+id, updateInquiryDto);
    return { code: 200, message: "询盘更新成功", data };
  }

  @Put(":id/status")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "兼容接口：更新询盘状态" })
  @ApiResponse({ status: 200, description: "询盘状态更新成功" })
  async updateStatus(
    @Param("id") id: string,
    @Body() body: { status: string },
  ) {
    const data = await this.inquiriesService.update(+id, {
      status: body.status,
    });
    return { code: 200, message: "询盘状态更新成功", data };
  }

  @Post(":id/reply")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "兼容接口：回复询盘" })
  @ApiResponse({ status: 200, description: "询盘回复成功" })
  async reply(
    @Param("id") id: string,
    @Body() body: { content: string },
    @Request() req: any,
  ) {
    const data = await this.inquiriesService.update(+id, {
      status: "replied",
      remark: body.content,
      processedBy: req.user?.sub,
    });
    return { code: 200, message: "询盘回复成功", data };
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "删除询盘" })
  @ApiResponse({ status: 200, description: "询盘删除成功" })
  async remove(@Param("id") id: string) {
    await this.inquiriesService.remove(+id);
    return { code: 200, message: "询盘删除成功" };
  }
}
