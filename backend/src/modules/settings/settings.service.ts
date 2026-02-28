import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { SettingsEntity } from "./entities/settings.entity";
import {
  UpdateSeoDto,
  UpdateSecurityDto,
  UpdateBackupSettingsDto,
  UpdateDatabaseSettingsDto,
} from "./dto/settings.dto";

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(SettingsEntity)
    private readonly settingsRepository: Repository<SettingsEntity>,
  ) {}

  private async findOne(): Promise<SettingsEntity> {
    let settings = await this.settingsRepository.findOne({
      where: { id: 1 },
    });

    if (!settings) {
      settings = this.settingsRepository.create({ id: 1 });
      await this.settingsRepository.save(settings);
    }

    return settings;
  }

  async getSeoSettings(): Promise<Partial<SettingsEntity>> {
    const settings = await this.findOne();
    return {
      siteTitle: settings.siteTitle,
      siteDescription: settings.siteDescription,
      keywords: settings.keywords,
    };
  }

  async updateSeo(
    updateSeoDto: UpdateSeoDto,
  ): Promise<Partial<SettingsEntity>> {
    const settings = await this.findOne();
    Object.assign(settings, updateSeoDto);
    const saved = await this.settingsRepository.save(settings);

    return {
      siteTitle: saved.siteTitle,
      siteDescription: saved.siteDescription,
      keywords: saved.keywords,
    };
  }

  async getSecuritySettings(): Promise<Partial<SettingsEntity>> {
    const settings = await this.findOne();
    return {
      twoFactorAuth: settings.twoFactorAuth,
      loginAlert: settings.loginAlert,
    };
  }

  async updateSecurity(
    updateSecurityDto: UpdateSecurityDto,
  ): Promise<Partial<SettingsEntity>> {
    const settings = await this.findOne();
    Object.assign(settings, updateSecurityDto);
    const saved = await this.settingsRepository.save(settings);

    return {
      twoFactorAuth: saved.twoFactorAuth,
      loginAlert: saved.loginAlert,
    };
  }

  async getBackupSettings(): Promise<Partial<SettingsEntity>> {
    const settings = await this.findOne();
    return {
      backupPath: settings.backupPath,
      lastBackupAt: settings.lastBackupAt,
    };
  }

  async updateBackupSettings(
    updateBackupSettingsDto: UpdateBackupSettingsDto,
  ): Promise<Partial<SettingsEntity>> {
    const settings = await this.findOne();
    Object.assign(settings, updateBackupSettingsDto);
    const saved = await this.settingsRepository.save(settings);

    return {
      backupPath: saved.backupPath,
      lastBackupAt: saved.lastBackupAt,
    };
  }

  async updateLastBackupTime(): Promise<void> {
    const settings = await this.findOne();
    settings.lastBackupAt = new Date();
    await this.settingsRepository.save(settings);
  }

  async getDatabaseSettings(): Promise<Partial<SettingsEntity>> {
    const settings = await this.findOne();
    return {
      dbHost: settings.dbHost,
      dbPort: settings.dbPort,
      dbUsername: settings.dbUsername,
      dbName: settings.dbName,
      dbType: settings.dbType,
    };
  }

  async updateDatabaseSettings(
    updateDatabaseDto: UpdateDatabaseSettingsDto,
  ): Promise<Partial<SettingsEntity>> {
    const settings = await this.findOne();
    Object.assign(settings, updateDatabaseDto);
    const saved = await this.settingsRepository.save(settings);

    return {
      dbHost: saved.dbHost,
      dbPort: saved.dbPort,
      dbUsername: saved.dbUsername,
      dbName: saved.dbName,
      dbType: saved.dbType,
    };
  }
}
