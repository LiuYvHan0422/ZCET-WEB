import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ProductEntity } from "../products/entities/product.entity";
import { NewsEntity } from "../news/entities/news.entity";
import { InquiryEntity } from "../inquiries/entities/inquiry.entity";
import { CertificateEntity } from "../certificates/entities/certificate.entity";

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
    @InjectRepository(NewsEntity)
    private readonly newsRepository: Repository<NewsEntity>,
    @InjectRepository(InquiryEntity)
    private readonly inquiryRepository: Repository<InquiryEntity>,
    @InjectRepository(CertificateEntity)
    private readonly certificateRepository: Repository<CertificateEntity>,
  ) {}

  async getStats() {
    const [productCount, newsCount, inquiryCount, certificateCount] =
      await Promise.all([
        this.productRepository.count(),
        this.newsRepository.count(),
        this.inquiryRepository.count(),
        this.certificateRepository.count(),
      ]);

    // 获取最近7天的询盘数量
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentInquiries = await this.inquiryRepository
      .createQueryBuilder("inquiry")
      .where("inquiry.createdAt >= :date", { date: sevenDaysAgo })
      .getCount();

    // 获取不同状态的询盘数量
    const pendingInquiries = await this.inquiryRepository.count({
      where: { status: "pending" } as any,
    });

    const repliedInquiries = await this.inquiryRepository.count({
      where: { status: "replied" } as any,
    });

    return {
      productCount,
      newsCount,
      inquiryCount,
      certificateCount,
      recentInquiries,
      pendingInquiries,
      repliedInquiries,
    };
  }

  async getRecentInquiries(limit: number = 5) {
    const safeLimit = Math.min(50, Math.max(1, Number(limit) || 5));
    return this.inquiryRepository.find({
      order: { createdAt: "DESC" },
      take: safeLimit,
    });
  }
}
