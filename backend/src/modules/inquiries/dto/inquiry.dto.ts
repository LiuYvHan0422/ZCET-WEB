import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEmail,
  IsInt,
  Min,
  IsIn,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateInquiryDto {
  @ApiProperty({ description: "意向产品名称", example: "精品套装 A" })
  @IsOptional()
  @IsString()
  productName?: string;

  @ApiProperty({ description: "客户姓名", example: "张三" })
  @IsNotEmpty({ message: "客户姓名不能为空" })
  @IsString()
  customerName!: string;

  @ApiProperty({ description: "联系电话", example: "13800138000" })
  @IsNotEmpty({ message: "联系电话不能为空" })
  @IsString()
  customerPhone!: string;

  @ApiProperty({ description: "电子邮箱", example: "zhangsan@example.com" })
  @IsOptional()
  @IsEmail({}, { message: "请输入有效的邮箱地址" })
  customerEmail?: string;

  @ApiProperty({ description: "公司名称", example: "某某公司" })
  @IsOptional()
  @IsString()
  companyName?: string;

  @ApiProperty({ description: "留言内容", example: "请尽快联系我" })
  @IsOptional()
  @IsString()
  message?: string;
}

export class UpdateInquiryDto {
  @ApiProperty({
    description: "处理状态",
    example: "replied",
    enum: ["pending", "processing", "processed", "replied", "closed"],
  })
  @IsOptional()
  @IsString()
  @IsIn(["pending", "processing", "processed", "replied", "closed"])
  status?: string;

  @ApiProperty({ description: "处理备注", example: "已电话联系客户" })
  @IsOptional()
  @IsString()
  remark?: string;

  @ApiProperty({ description: "处理人 ID", example: 1 })
  @IsOptional()
  @IsInt({ message: "处理人ID必须是整数" })
  processedBy?: number;
}

export class InquiryQueryDto {
  @ApiProperty({ description: "搜索关键词", required: false })
  @IsOptional()
  @IsString()
  keyword?: string;

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
