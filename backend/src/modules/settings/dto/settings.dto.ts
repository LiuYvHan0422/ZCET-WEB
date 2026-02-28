import { IsString, IsOptional, IsBoolean, IsInt, Min } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class UpdateSeoDto {
  @ApiProperty({ description: "网站标题", required: false })
  @IsOptional()
  @IsString()
  siteTitle?: string;

  @ApiProperty({ description: "网站描述", required: false })
  @IsOptional()
  @IsString()
  siteDescription?: string;

  @ApiProperty({ description: "关键词", required: false })
  @IsOptional()
  @IsString()
  keywords?: string;
}

export class UpdateSecurityDto {
  @ApiProperty({ description: "是否启用两步验证", required: false })
  @IsOptional()
  @IsBoolean()
  twoFactorAuth?: boolean;

  @ApiProperty({ description: "是否启用登录提醒", required: false })
  @IsOptional()
  @IsBoolean()
  loginAlert?: boolean;
}

export class UpdateBackupSettingsDto {
  @ApiProperty({ description: "备份路径", required: false })
  @IsOptional()
  @IsString()
  backupPath?: string;
}

export class UpdateDatabaseSettingsDto {
  @ApiProperty({ description: "数据库主机地址", required: false })
  @IsOptional()
  @IsString()
  dbHost?: string;

  @ApiProperty({ description: "数据库端口", required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  dbPort?: number;

  @ApiProperty({ description: "数据库用户名", required: false })
  @IsOptional()
  @IsString()
  dbUsername?: string;

  @ApiProperty({ description: "数据库密码", required: false })
  @IsOptional()
  @IsString()
  dbPassword?: string;

  @ApiProperty({ description: "数据库名称", required: false })
  @IsOptional()
  @IsString()
  dbName?: string;

  @ApiProperty({ description: "数据库类型", required: false })
  @IsOptional()
  @IsString()
  dbType?: string;
}
