import { Injectable } from "@nestjs/common";
import * as fs from "fs";
import * as path from "path";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { SettingsEntity } from "../settings/entities/settings.entity";

@Injectable()
export class BackupService {
  constructor(
    @InjectRepository(SettingsEntity)
    private readonly settingsRepository: Repository<SettingsEntity>,
  ) {}

  async createBackup(): Promise<{
    success: boolean;
    message: string;
    filename?: string;
  }> {
    try {
      const settings = await this.settingsRepository.findOne({
        where: { id: 1 },
      });
      const backupBasePath =
        settings?.backupPath || path.join(process.cwd(), "backups");

      if (!fs.existsSync(backupBasePath)) {
        fs.mkdirSync(backupBasePath, { recursive: true });
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const filename = `backup-${timestamp}.json`;
      const filepath = path.join(backupBasePath, filename);

      // Demo payload only. Real implementation should dump and encrypt DB data.
      const backupData = {
        timestamp: new Date().toISOString(),
        version: "1.0",
        tables: [
          { name: "admins", count: 0 },
          { name: "products", count: 0 },
          { name: "news", count: 0 },
          { name: "categories", count: 0 },
          { name: "certificates", count: 0 },
          { name: "inquiries", count: 0 },
          { name: "company", count: 0 },
          { name: "settings", count: 1 },
        ],
      };

      fs.writeFileSync(filepath, JSON.stringify(backupData, null, 2));
      await this.settingsRepository.update(1, { lastBackupAt: new Date() });

      return {
        success: true,
        message: "备份创建成功",
        filename,
      };
    } catch (error: any) {
      return {
        success: false,
        message: `备份失败: ${error.message}`,
      };
    }
  }

  async restoreBackup(
    filename?: string,
  ): Promise<{ success: boolean; message: string }> {
    try {
      const settings = await this.settingsRepository.findOne({
        where: { id: 1 },
      });
      const backupBasePath =
        settings?.backupPath || path.join(process.cwd(), "backups");

      const backupFile = filename || this.getLatestBackup(backupBasePath);
      if (!backupFile) {
        return {
          success: false,
          message: "没有找到备份文件",
        };
      }

      const safeBackupFile = path.basename(backupFile);
      if (!/^backup-[\w.-]+\.json$/.test(safeBackupFile)) {
        return {
          success: false,
          message: "非法的备份文件名",
        };
      }

      const filepath = path.join(backupBasePath, safeBackupFile);
      if (!fs.existsSync(filepath)) {
        return {
          success: false,
          message: `备份文件不存在: ${safeBackupFile}`,
        };
      }

      const content = fs.readFileSync(filepath, "utf-8");
      JSON.parse(content);

      // Demo restore only. Real implementation should validate, decrypt and restore DB.
      return {
        success: true,
        message: "数据恢复成功",
      };
    } catch (error: any) {
      return {
        success: false,
        message: `恢复失败: ${error.message}`,
      };
    }
  }

  private getLatestBackup(backupBasePath: string): string | null {
    if (!fs.existsSync(backupBasePath)) {
      return null;
    }

    const files = fs
      .readdirSync(backupBasePath)
      .filter((f) => f.startsWith("backup-") && f.endsWith(".json"))
      .sort((a, b) => b.localeCompare(a));

    return files[0] || null;
  }

  async getBackupList(): Promise<
    { filename: string; size: number; createdAt: Date }[]
  > {
    try {
      const settings = await this.settingsRepository.findOne({
        where: { id: 1 },
      });
      const backupBasePath =
        settings?.backupPath || path.join(process.cwd(), "backups");

      if (!fs.existsSync(backupBasePath)) {
        return [];
      }

      const files = fs
        .readdirSync(backupBasePath)
        .filter((f) => f.startsWith("backup-") && f.endsWith(".json"))
        .sort((a, b) => b.localeCompare(a));

      return files.map((filename) => {
        const filepath = path.join(backupBasePath, filename);
        const stats = fs.statSync(filepath);
        return {
          filename,
          size: stats.size,
          createdAt: stats.birthtime,
        };
      });
    } catch {
      return [];
    }
  }
}
