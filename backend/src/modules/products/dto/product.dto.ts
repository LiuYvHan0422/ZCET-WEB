import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  Min,
  IsInt,
  IsBoolean,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateProductDto {
  @ApiProperty({ description: "产品名称", example: "精品套装 A" })
  @IsNotEmpty({ message: "产品名称不能为空" })
  @IsString()
  name!: string;

  @ApiProperty({ description: "产品SKU", example: "SKU-001" })
  @IsNotEmpty({ message: "产品SKU不能为空" })
  @IsString()
  sku!: string;

  @ApiProperty({
    description: "产品描述",
    example: "高品质材料，精工制作，耐用美观",
  })
  @IsNotEmpty({ message: "产品描述不能为空" })
  @IsString()
  description!: string;

  @ApiProperty({ description: "简短描述", example: "这是一款优质产品" })
  @IsOptional()
  @IsString()
  shortDescription?: string;

  @ApiProperty({ description: "产品价格", example: 1299 })
  @IsNotEmpty({ message: "产品价格不能为空" })
  @IsNumber({}, { message: "价格必须是数字" })
  @Min(0, { message: "价格不能为负数" })
  price!: number;

  @ApiProperty({ description: "产品库存", example: 100 })
  @IsOptional()
  @IsInt({ message: "库存必须是整数" })
  @Min(0, { message: "库存不能为负数" })
  stock?: number;

  @ApiProperty({ description: "产品分类", example: "套装系列" })
  @IsNotEmpty({ message: "产品分类不能为空" })
  @IsString()
  category!: string;

  @ApiProperty({
    description: "产品图片URL",
    example: "/uploads/product-1.jpg",
  })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiProperty({ description: "是否上架", example: true, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ description: "是否推荐", example: false, default: false })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;
}

export class UpdateProductDto {
  @ApiProperty({ description: "产品SKU", example: "SKU-001", required: false })
  @IsOptional()
  @IsString()
  sku?: string;

  @ApiProperty({
    description: "产品名称",
    example: "精品套装 A",
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: "产品描述", required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: "简短描述", required: false })
  @IsOptional()
  @IsString()
  shortDescription?: string;

  @ApiProperty({ description: "产品价格", example: 1299, required: false })
  @IsOptional()
  @IsNumber({}, { message: "价格必须是数字" })
  @Min(0, { message: "价格不能为负数" })
  price?: number;

  @ApiProperty({ description: "产品库存", example: 100, required: false })
  @IsOptional()
  @IsInt({ message: "库存必须是整数" })
  @Min(0, { message: "库存不能为负数" })
  stock?: number;

  @ApiProperty({
    description: "产品分类",
    example: "套装系列",
    required: false,
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({ description: "产品图片URL", required: false })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiProperty({ description: "是否上架", required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ description: "是否推荐", required: false })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;
}

export class ProductQueryDto {
  @ApiProperty({ description: "搜索关键词", required: false })
  @IsOptional()
  @IsString()
  keyword?: string;

  @ApiProperty({ description: "分类筛选", required: false })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({ description: "状态筛选 (active/inactive)", required: false })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiProperty({ description: "排序字段", example: "price", required: false })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiProperty({
    description: "排序方向",
    enum: ["ASC", "DESC"],
    example: "ASC",
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

  @ApiProperty({
    description: "Return compact list fields only (true/false)",
    required: false,
    example: "true",
  })
  @IsOptional()
  @IsString()
  compact?: string;

  @ApiProperty({
    description: "Whether to calculate total count (true/false)",
    required: false,
    example: "true",
  })
  @IsOptional()
  @IsString()
  withCount?: string;
}
