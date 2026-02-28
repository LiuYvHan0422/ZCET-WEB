import {
  IsNotEmpty,
  IsString,
  IsOptional,
  MinLength,
  IsBoolean,
  IsInt,
  Min,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateAdminDto {
  @ApiProperty({ description: "用户名", example: "admin" })
  @IsNotEmpty({ message: "用户名不能为空" })
  @IsString()
  username!: string;

  @ApiProperty({ description: "密码", example: "password123" })
  @IsNotEmpty({ message: "密码不能为空" })
  @IsString()
  @MinLength(6, { message: "密码长度至少为6位" })
  password!: string;

  @ApiProperty({ description: "昵称", example: "超级管理员" })
  @IsOptional()
  @IsString()
  nickname?: string;

  @ApiProperty({ description: "邮箱", example: "admin@example.com" })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiProperty({ description: "手机号", example: "13800138000" })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ description: "角色", example: "admin" })
  @IsOptional()
  @IsString()
  role?: string;
}

export class UpdateAdminDto {
  @ApiProperty({ description: "密码", required: false })
  @IsOptional()
  @IsString()
  @MinLength(6, { message: "密码长度至少为6位" })
  password?: string;

  @ApiProperty({ description: "昵称", required: false })
  @IsOptional()
  @IsString()
  nickname?: string;

  @ApiProperty({ description: "邮箱", required: false })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiProperty({ description: "手机号", required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ description: "角色", required: false })
  @IsOptional()
  @IsString()
  role?: string;

  @ApiProperty({ description: "是否激活", required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class AdminQueryDto {
  @ApiProperty({ description: "搜索关键词", required: false })
  @IsOptional()
  @IsString()
  keyword?: string;

  @ApiProperty({ description: "当前页码", example: 1, default: 1 })
  @IsOptional()
  @IsInt({ message: "页码必须是整数" })
  @Min(1, { message: "页码必须大于等于 1" })
  page?: number = 1;

  @ApiProperty({ description: "每页数量", example: 10, default: 10 })
  @IsOptional()
  @IsInt({ message: "每页数量必须是整数" })
  @Min(1, { message: "每页数量必须大于等于 1" })
  limit?: number = 10;
}
