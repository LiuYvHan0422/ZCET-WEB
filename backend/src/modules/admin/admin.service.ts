import {
  Injectable,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, ILike } from "typeorm";
import { AdminEntity } from "./entities/admin.entity";
import { CreateAdminDto, UpdateAdminDto, AdminQueryDto } from "./dto/admin.dto";
import { createPaginatedResponse } from "../../common/dto/pagination.dto";
import { hashPassword, verifyPassword } from "../../common/utils/password.util";

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(AdminEntity)
    private readonly adminRepository: Repository<AdminEntity>,
  ) {}

  async create(createAdminDto: CreateAdminDto): Promise<Partial<AdminEntity>> {
    const existing = await this.adminRepository.findOne({
      where: { username: createAdminDto.username },
    });
    if (existing) {
      throw new ConflictException("用户名已存在");
    }

    const admin = this.adminRepository.create({
      ...createAdminDto,
      password: hashPassword(createAdminDto.password),
    });

    const saved = await this.adminRepository.save(admin);
    return this.sanitizeAdmin(saved);
  }

  async findAll(query: AdminQueryDto) {
    const { keyword, page = 1, limit = 10 } = query;

    const whereCondition = keyword
      ? [
          { username: ILike(`%${keyword}%`) },
          { nickname: ILike(`%${keyword}%`) },
        ]
      : {};

    const [items, total] = await this.adminRepository.findAndCount({
      where: whereCondition,
      order: {
        createdAt: "DESC",
      },
      select: [
        "id",
        "username",
        "nickname",
        "email",
        "phone",
        "role",
        "isActive",
        "lastLoginAt",
        "createdAt",
      ],
      skip: (page - 1) * limit,
      take: limit,
    });

    return createPaginatedResponse(items, page, limit, total);
  }

  async findOne(id: number): Promise<Partial<AdminEntity>> {
    const admin = await this.findOneEntity(id);
    return this.sanitizeAdmin(admin);
  }

  async update(
    id: number,
    updateAdminDto: UpdateAdminDto,
  ): Promise<Partial<AdminEntity>> {
    const admin = await this.findOneEntity(id);

    const data: UpdateAdminDto = { ...updateAdminDto };
    if (data.password) {
      data.password = hashPassword(data.password);
    }

    Object.assign(admin, data);
    const saved = await this.adminRepository.save(admin);
    return this.sanitizeAdmin(saved);
  }

  async remove(id: number): Promise<void> {
    const admin = await this.findOneEntity(id);
    await this.adminRepository.remove(admin);
  }

  async updateProfile(
    id: number,
    updateData: Partial<AdminEntity>,
  ): Promise<Partial<AdminEntity>> {
    const admin = await this.findOneEntity(id);

    const allowedUpdate: Partial<AdminEntity> = {};
    if (typeof updateData.nickname === "string") {
      allowedUpdate.nickname = updateData.nickname;
    }
    if (typeof updateData.email === "string") {
      allowedUpdate.email = updateData.email;
    }
    if (typeof updateData.phone === "string") {
      allowedUpdate.phone = updateData.phone;
    }

    Object.assign(admin, allowedUpdate);

    const saved = await this.adminRepository.save(admin);
    return this.sanitizeAdmin(saved);
  }

  async changePassword(
    id: number,
    oldPassword: string,
    newPassword: string,
  ): Promise<boolean> {
    const admin = await this.findOneEntity(id);
    if (!verifyPassword(oldPassword, admin.password)) {
      return false;
    }

    await this.adminRepository.update(id, {
      password: hashPassword(newPassword),
    });
    return true;
  }

  private async findOneEntity(id: number): Promise<AdminEntity> {
    const admin = await this.adminRepository.findOne({ where: { id } });
    if (!admin) {
      throw new NotFoundException(`管理员不存在: ${id}`);
    }
    return admin;
  }

  private sanitizeAdmin(admin: AdminEntity): Partial<AdminEntity> {
    const { password: _password, ...result } = admin;
    return result;
  }
}
