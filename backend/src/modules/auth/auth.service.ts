import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { AdminEntity } from "../admin/entities/admin.entity";
import { LoginDto } from "./dto/auth.dto";
import {
  hashPassword,
  isLegacyPlaintextPassword,
  verifyPassword,
} from "../../common/utils/password.util";

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(AdminEntity)
    private readonly adminRepository: Repository<AdminEntity>,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(
    username: string,
    password: string,
  ): Promise<AdminEntity | null> {
    const admin = await this.adminRepository.findOne({
      where: { username },
    });

    if (!admin || !verifyPassword(password, admin.password)) {
      return null;
    }

    // Legacy plaintext records are re-hashed after first successful login.
    if (isLegacyPlaintextPassword(admin.password)) {
      admin.password = hashPassword(password);
      await this.adminRepository.save(admin);
    }

    return admin;
  }

  async getActiveAdminByUsername(
    username: string,
  ): Promise<AdminEntity | null> {
    const admin = await this.adminRepository.findOne({
      where: { username },
    });
    if (!admin || !admin.isActive) {
      return null;
    }
    return admin;
  }

  async login(loginDto: LoginDto) {
    const { username, password } = loginDto;
    const admin = await this.validateUser(username, password);

    if (!admin) {
      throw new UnauthorizedException("用户名或密码错误");
    }

    if (!admin.isActive) {
      throw new UnauthorizedException("账号已被禁用");
    }

    admin.lastLoginAt = new Date();
    await this.adminRepository.save(admin);

    const payload = {
      sub: admin.id,
      username: admin.username,
      role: admin.role,
    };

    return {
      access_token: this.jwtService.sign(payload),
      admin: {
        id: admin.id,
        username: admin.username,
        nickname: admin.nickname,
        role: admin.role,
      },
    };
  }

  async getProfile(adminId: number): Promise<Partial<AdminEntity>> {
    const admin = await this.adminRepository.findOne({
      where: { id: adminId },
    });

    if (!admin) {
      throw new UnauthorizedException("用户不存在");
    }

    const { password: _password, ...result } = admin;
    return result;
  }
}
