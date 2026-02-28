import { IsNotEmpty, IsString, IsOptional, IsInt, Min } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateCategoryDto {
  @ApiProperty({ description: "分类名称", example: "套装系列" })
  @IsNotEmpty({ message: "分类名称不能为空" })
  @IsString()
  name!: string;

  @ApiProperty({ description: "分类描述", example: "高品质套装产品" })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: "分类图标", example: "📦" })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiProperty({ description: "排序", example: 1, default: 0 })
  @IsOptional()
  @IsInt({ message: "排序必须是整数" })
  @Min(0, { message: "排序必须大于等于 0" })
  sortOrder?: number;
}

export class UpdateCategoryDto {
  @ApiProperty({ description: "分类名称", required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: "分类描述", required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: "分类图标", required: false })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiProperty({ description: "排序", required: false })
  @IsOptional()
  @IsInt({ message: "排序必须是整数" })
  @Min(0, { message: "排序必须大于等于 0" })
  sortOrder?: number;
}
