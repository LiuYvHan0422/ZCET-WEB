import { IsNotEmpty, IsString, MinLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class LoginDto {
  @ApiProperty({ description: "用户名", example: "admin" })
  @IsNotEmpty({ message: "用户名不能为空" })
  @IsString()
  username!: string;

  @ApiProperty({ description: "密码", example: "password123" })
  @IsNotEmpty({ message: "密码不能为空" })
  @IsString()
  @MinLength(6, { message: "密码长度至少为6位" })
  password!: string;
}
