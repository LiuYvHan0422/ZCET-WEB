import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CertificatesService } from "./certificates.service";
import { CertificatesController } from "./certificates.controller";
import { CertificateEntity } from "./entities/certificate.entity";

@Module({
  imports: [TypeOrmModule.forFeature([CertificateEntity])],
  controllers: [CertificatesController],
  providers: [CertificatesService],
  exports: [CertificatesService],
})
export class CertificatesModule {}
