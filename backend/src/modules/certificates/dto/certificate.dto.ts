import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsInt,
  Min,
  IsBoolean,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateCertificateDto {
  @ApiProperty({ description: "证书标题", example: "ISO9001质量管理体系认证" })
  @IsNotEmpty({ message: "证书标题不能为空" })
  @IsString()
  title!: string;

  @ApiProperty({ description: "证书类型", example: "iso", required: false })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiProperty({
    description: "颁发/到期日期",
    example: "2024-12-15",
    required: false,
  })
  @IsOptional()
  @IsString()
  date?: string;

  @ApiProperty({
    description: "编号/专利号",
    example: "ZL202410123456",
    required: false,
  })
  @IsOptional()
  @IsString()
  number?: string;

  @ApiProperty({
    description: "证书描述",
    example: "公司已通过ISO9001质量管理体系认证",
  })
  @IsNotEmpty({ message: "证书描述不能为空" })
  @IsString()
  description!: string;

  @ApiProperty({
    description: "证书图片",
    example: "/images/certificate-1.jpg",
  })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiProperty({ description: "证书图标", example: "✅" })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiProperty({ description: "排序", example: 1, default: 1 })
  @IsOptional()
  @IsInt({ message: "排序必须是整数" })
  @Min(0, { message: "排序必须大于等于 0" })
  sortOrder?: number;

  @ApiProperty({ description: "是否展示", example: true, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateCertificateDto {
  @ApiProperty({ description: "证书标题", required: false })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ description: "证书类型", required: false })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiProperty({ description: "颁发/到期日期", required: false })
  @IsOptional()
  @IsString()
  date?: string;

  @ApiProperty({ description: "编号/专利号", required: false })
  @IsOptional()
  @IsString()
  number?: string;

  @ApiProperty({ description: "证书描述", required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: "证书图片", required: false })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiProperty({ description: "证书图标", required: false })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiProperty({ description: "排序", required: false })
  @IsOptional()
  @IsInt({ message: "排序必须是整数" })
  @Min(0, { message: "排序必须大于等于 0" })
  sortOrder?: number;

  @ApiProperty({ description: "是否展示", required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class CertificateQueryDto {
  @ApiProperty({ description: "搜索关键词", required: false })
  @IsOptional()
  @IsString()
  keyword?: string;

  @ApiProperty({ description: "类型筛选 (patent/iso/award)", required: false })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiProperty({ description: "状态筛选", required: false })
  @IsOptional()
  @IsString()
  status?: string;

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
