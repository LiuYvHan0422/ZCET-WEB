import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsDateString,
  IsInt,
  Min,
  IsBoolean,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateNewsDto {
  @ApiProperty({ description: "新闻标题", example: "公司荣获行业最佳服务奖" })
  @IsNotEmpty({ message: "新闻标题不能为空" })
  @IsString()
  title!: string;

  @ApiProperty({
    description: "新闻摘要",
    example: "凭借优质的服务和良好的口碑，我们在年度行业评选中脱颖而出。",
  })
  @IsNotEmpty({ message: "新闻摘要不能为空" })
  @IsString()
  excerpt!: string;

  @ApiProperty({ description: "新闻内容", example: "详细的内容..." })
  @IsNotEmpty({ message: "新闻内容不能为空" })
  @IsString()
  content!: string;

  @ApiProperty({ description: "发布日期", example: "2024-12-15" })
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiProperty({ description: "新闻图标", example: "🏆" })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiProperty({ description: "是否发布", example: true, default: true })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @ApiProperty({ description: "新闻分类", example: "公司新闻" })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({ description: "作者", example: "张三" })
  @IsOptional()
  @IsString()
  author?: string;

  @ApiProperty({ description: "封面图", example: "/images/news-cover.jpg" })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiProperty({ description: "摘要/导读", example: "这是一篇摘要内容" })
  @IsOptional()
  @IsString()
  summary?: string;
}

export class UpdateNewsDto {
  @ApiProperty({ description: "新闻标题", required: false })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ description: "新闻摘要", required: false })
  @IsOptional()
  @IsString()
  excerpt?: string;

  @ApiProperty({ description: "新闻内容", required: false })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiProperty({ description: "发布日期", required: false })
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiProperty({ description: "新闻图标", required: false })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiProperty({ description: "是否发布", required: false })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @ApiProperty({ description: "新闻分类", required: false })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({ description: "作者", required: false })
  @IsOptional()
  @IsString()
  author?: string;

  @ApiProperty({ description: "封面图", required: false })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiProperty({ description: "摘要/导读", required: false })
  @IsOptional()
  @IsString()
  summary?: string;
}

export class NewsQueryDto {
  @ApiProperty({ description: "搜索关键词", required: false })
  @IsOptional()
  @IsString()
  keyword?: string;

  @ApiProperty({ description: "分类筛选", required: false })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({ description: "状态筛选 (published/draft)", required: false })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiProperty({ description: "排序字段", example: "date", required: false })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiProperty({
    description: "排序方向",
    enum: ["ASC", "DESC"],
    example: "DESC",
    required: false,
  })
  @IsOptional()
  @IsString()
  sortOrder?: "ASC" | "DESC";

  @ApiProperty({ description: "当前页码", example: 1, default: 1 })
  @IsOptional()
  @IsInt({ message: "页码必须是整数" })
  @Min(1, { message: "页码必须大于等于 1" })
  page?: number = 1;

  @ApiProperty({ description: "每页数量", example: 10, default: 10 })
  @IsOptional()
  @IsInt({ message: "每页数量必须是整数" })
  @Min(1, { message: "每页数量必须大于等于 1" })
  pageSize?: number = 10;
}
