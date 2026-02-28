import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CertificateEntity } from "./entities/certificate.entity";
import {
  CreateCertificateDto,
  UpdateCertificateDto,
  CertificateQueryDto,
} from "./dto/certificate.dto";
import { createPaginatedResponse } from "../../common/dto/pagination.dto";

@Injectable()
export class CertificatesService {
  constructor(
    @InjectRepository(CertificateEntity)
    private readonly certificateRepository: Repository<CertificateEntity>,
  ) {}

  async create(
    createCertificateDto: CreateCertificateDto,
  ): Promise<Record<string, any>> {
    const certificate = this.certificateRepository.create(
      this.normalizeInput(createCertificateDto),
    );
    const saved = await this.certificateRepository.save(certificate);
    return this.mapOutput(saved);
  }

  async findAll(query: CertificateQueryDto) {
    const { type, status, page = 1, pageSize = 10 } = query;

    const where: any = {};
    if (type) {
      where.type = type;
    }
    if (status === "published" || status === "active") {
      where.isActive = true;
    } else if (status === "draft" || status === "inactive") {
      where.isActive = false;
    }

    const safePage = Math.max(1, Number(page) || 1);
    const safePageSize = Math.min(100, Math.max(1, Number(pageSize) || 10));

    const [items, total] = await this.certificateRepository.findAndCount({
      where,
      order: {
        sortOrder: "ASC",
      },
      skip: (safePage - 1) * safePageSize,
      take: safePageSize,
    });

    return createPaginatedResponse(
      items.map((item) => this.mapOutput(item)),
      safePage,
      safePageSize,
      total,
    );
  }

  async findOne(id: number): Promise<Record<string, any>> {
    const certificate = await this.certificateRepository.findOne({
      where: { id },
    });
    if (!certificate) {
      throw new NotFoundException(`Certificate not found: ${id}`);
    }
    return this.mapOutput(certificate);
  }

  async update(
    id: number,
    updateCertificateDto: UpdateCertificateDto,
  ): Promise<Record<string, any>> {
    const certificate = await this.certificateRepository.findOne({
      where: { id },
    });
    if (!certificate) {
      throw new NotFoundException(`Certificate not found: ${id}`);
    }

    Object.assign(certificate, this.normalizeInput(updateCertificateDto));
    const saved = await this.certificateRepository.save(certificate);
    return this.mapOutput(saved);
  }

  async remove(id: number): Promise<void> {
    const certificate = await this.certificateRepository.findOne({
      where: { id },
    });
    if (!certificate) {
      throw new NotFoundException(`Certificate not found: ${id}`);
    }
    await this.certificateRepository.remove(certificate);
  }

  async getAll(): Promise<Record<string, any>[]> {
    const items = await this.certificateRepository.find({
      where: { isActive: true },
      order: {
        sortOrder: "ASC",
      },
    });
    return items.map((item) => this.mapOutput(item));
  }

  private normalizeInput(
    input: Partial<CreateCertificateDto | UpdateCertificateDto>,
  ): Partial<CertificateEntity> {
    const data: any = { ...input };
    if (typeof data.name === "string" && !data.title) {
      data.title = data.name;
      delete data.name;
    }
    return data;
  }

  private mapOutput(item: CertificateEntity): Record<string, any> {
    return {
      ...item,
      name: item.title,
      status: item.isActive ? "active" : "inactive",
      bgColor: "#3f7de8",
    };
  }
}
