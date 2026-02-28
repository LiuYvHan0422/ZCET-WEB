import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DashboardController } from "./dashboard.controller";
import { DashboardService } from "./dashboard.service";
import { ProductEntity } from "../products/entities/product.entity";
import { NewsEntity } from "../news/entities/news.entity";
import { InquiryEntity } from "../inquiries/entities/inquiry.entity";
import { CertificateEntity } from "../certificates/entities/certificate.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProductEntity,
      NewsEntity,
      InquiryEntity,
      CertificateEntity,
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}
