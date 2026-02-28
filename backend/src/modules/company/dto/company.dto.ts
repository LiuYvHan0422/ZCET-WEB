import { IsString, IsOptional } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class UpdateCompanyDto {
  @ApiProperty({ description: "公司名称", required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: "公司英文名称", required: false })
  @IsOptional()
  @IsString()
  companyNameEn?: string;

  @ApiProperty({ description: "成立年份", required: false })
  @IsOptional()
  @IsString()
  foundedYear?: string;

  @ApiProperty({ description: "公司简介简述", required: false })
  @IsOptional()
  @IsString()
  shortDescription?: string;

  @ApiProperty({ description: "关于我们内容", required: false })
  @IsOptional()
  @IsString()
  aboutContent?: string;

  @ApiProperty({ description: "联系人", required: false })
  @IsOptional()
  @IsString()
  contactName?: string;

  @ApiProperty({ description: "联系电话", required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ description: "电子邮箱", required: false })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiProperty({ description: "传真号码", required: false })
  @IsOptional()
  @IsString()
  fax?: string;

  @ApiProperty({ description: "公司地址", required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ description: "公司 logo", required: false })
  @IsOptional()
  @IsString()
  logo?: string;

  @ApiProperty({ description: "公司二维码", required: false })
  @IsOptional()
  @IsString()
  qrcode?: string;

  @ApiProperty({ description: "微信号", required: false })
  @IsOptional()
  @IsString()
  wechat?: string;

  @ApiProperty({ description: "微信公众号", required: false })
  @IsOptional()
  @IsString()
  wechatOfficial?: string;

  @ApiProperty({ description: "小红书号", required: false })
  @IsOptional()
  @IsString()
  xiaohongshu?: string;

  @ApiProperty({ description: "微博链接", required: false })
  @IsOptional()
  @IsString()
  weibo?: string;

  @ApiProperty({ description: "抖音号", required: false })
  @IsOptional()
  @IsString()
  douyin?: string;
}
