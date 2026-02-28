import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CompanyEntity } from "./entities/company.entity";
import { UpdateCompanyDto } from "./dto/company.dto";

@Injectable()
export class CompanyService {
  constructor(
    @InjectRepository(CompanyEntity)
    private readonly companyRepository: Repository<CompanyEntity>,
  ) {}

  async findOne(): Promise<CompanyEntity | null> {
    const company = await this.companyRepository.findOne({
      where: { id: 1 },
    });

    // 如果没有找到记录，返回 null 而不是抛出异常
    return company || null;
  }

  async update(updateCompanyDto: UpdateCompanyDto): Promise<CompanyEntity> {
    let company = await this.findOne();

    if (!company) {
      // 如果没有记录，创建一个新的
      company = this.companyRepository.create({
        id: 1,
        ...updateCompanyDto,
      });
    } else {
      Object.assign(company, updateCompanyDto);
    }

    return this.companyRepository.save(company);
  }

  async createOrUpdate(
    updateCompanyDto: UpdateCompanyDto,
  ): Promise<CompanyEntity> {
    let company = await this.companyRepository.findOne({
      where: { id: 1 },
    });

    if (!company) {
      company = this.companyRepository.create({
        id: 1,
        ...updateCompanyDto,
      });
    } else {
      Object.assign(company, updateCompanyDto);
    }

    return this.companyRepository.save(company);
  }
}
