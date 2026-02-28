import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { InquiriesService } from "./inquiries.service";
import { InquiriesController } from "./inquiries.controller";
import { InquiryEntity } from "./entities/inquiry.entity";
import { NotificationsModule } from "../notifications/notifications.module";

@Module({
  imports: [TypeOrmModule.forFeature([InquiryEntity]), NotificationsModule],
  controllers: [InquiriesController],
  providers: [InquiriesService],
  exports: [InquiriesService],
})
export class InquiriesModule {}
