import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, ILike, FindOptionsWhere } from "typeorm";
import { InquiryEntity } from "./entities/inquiry.entity";
import {
  CreateInquiryDto,
  UpdateInquiryDto,
  InquiryQueryDto,
} from "./dto/inquiry.dto";
import { NotificationsService } from "../notifications/notifications.service";

@Injectable()
export class InquiriesService {
  constructor(
    @InjectRepository(InquiryEntity)
    private readonly inquiryRepository: Repository<InquiryEntity>,
    private readonly notificationsService: NotificationsService,
  ) {}

  async create(createInquiryDto: CreateInquiryDto): Promise<InquiryEntity> {
    const inquiry = this.inquiryRepository.create({
      ...createInquiryDto,
      status: "pending",
    });
    const savedInquiry = await this.inquiryRepository.save(inquiry);

    // 创建通知
    await this.notificationsService.create({
      title: "新询盘通知",
      content: `客户 ${createInquiryDto.customerName} 提交了一个新询盘，意向产品：${createInquiryDto.productName}`,
      type: "inquiry",
      link: `/inquiries/${savedInquiry.id}`,
      relatedId: String(savedInquiry.id),
    });

    return savedInquiry;
  }

  async findAll(query: InquiryQueryDto) {
    const { keyword = "", status, page = 1, pageSize = 10 } = query;

    const where: FindOptionsWhere<InquiryEntity> = {};

    // 处理状态筛选
    if (status) {
      where.status = status;
    }

    // 只有当 keyword 非空时才进行搜索
    const shouldSearch = keyword && keyword.trim().length > 0;

    const [items, total] = await this.inquiryRepository.findAndCount({
      where: shouldSearch
        ? [
            { ...where, customerName: ILike(`%${keyword}%`) },
            { ...where, customerPhone: ILike(`%${keyword}%`) },
            { ...where, productName: ILike(`%${keyword}%`) },
          ]
        : where,
      order: {
        createdAt: "DESC",
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return {
      list: items,
      pagination: {
        page,
        limit: pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  async findOne(id: number): Promise<InquiryEntity> {
    const inquiry = await this.inquiryRepository.findOne({ where: { id } });

    if (!inquiry) {
      throw new NotFoundException(`ID 为 ${id} 的询盘不存在`);
    }

    return inquiry;
  }

  async update(
    id: number,
    updateInquiryDto: UpdateInquiryDto,
  ): Promise<InquiryEntity> {
    const inquiry = await this.findOne(id);

    Object.assign(inquiry, updateInquiryDto);

    return this.inquiryRepository.save(inquiry);
  }

  async remove(id: number): Promise<void> {
    const inquiry = await this.findOne(id);
    await this.inquiryRepository.remove(inquiry);
  }

  async getPendingCount(): Promise<number> {
    return this.inquiryRepository.count({ where: { status: "pending" } });
  }
}
