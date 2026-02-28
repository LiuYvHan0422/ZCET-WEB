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
import { NewsService } from "./news.service";
import { CreateNewsDto, UpdateNewsDto, NewsQueryDto } from "./dto/news.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@ApiTags("新闻管理")
@Controller("news")
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "创建新闻" })
  @ApiResponse({ status: 201, description: "新闻创建成功" })
  async create(@Body() createNewsDto: CreateNewsDto) {
    const data = await this.newsService.create(createNewsDto);
    return { code: 200, message: "新闻创建成功", data };
  }

  @Get()
  @ApiOperation({ summary: "获取新闻列表" })
  @ApiResponse({ status: 200, description: "获取新闻列表成功" })
  findAll(@Query() query: NewsQueryDto) {
    return this.newsService.findAll(query);
  }

  @Get("latest")
  @ApiOperation({ summary: "获取最新新闻" })
  @ApiResponse({ status: 200, description: "获取最新新闻成功" })
  getLatestNews(
    @Query("limit") limit?: number,
    @Query("isPublished") isPublished?: string,
  ) {
    const published = isPublished === "true" ? true : undefined;
    return this.newsService.getLatestNews(limit, published);
  }

  @Get(":id")
  @ApiOperation({ summary: "获取新闻详情" })
  @ApiResponse({ status: 200, description: "获取新闻成功" })
  findOne(@Param("id") id: string) {
    return this.newsService.findOne(+id);
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "更新新闻" })
  @ApiResponse({ status: 200, description: "新闻更新成功" })
  async update(@Param("id") id: string, @Body() updateNewsDto: UpdateNewsDto) {
    const data = await this.newsService.update(+id, updateNewsDto);
    return { code: 200, message: "新闻更新成功", data };
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "删除新闻" })
  @ApiResponse({ status: 200, description: "新闻删除成功" })
  async remove(@Param("id") id: string) {
    await this.newsService.remove(+id);
    return { code: 200, message: "新闻删除成功" };
  }
}
