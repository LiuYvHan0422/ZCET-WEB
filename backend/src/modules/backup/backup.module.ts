import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { BackupController } from "./backup.controller";
import { BackupService } from "./backup.service";
import { SettingsEntity } from "../settings/entities/settings.entity";

@Module({
  imports: [TypeOrmModule.forFeature([SettingsEntity])],
  controllers: [BackupController],
  providers: [BackupService],
  exports: [BackupService],
})
export class BackupModule {}
