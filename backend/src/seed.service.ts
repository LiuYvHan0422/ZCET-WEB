import { Injectable, OnModuleInit, Logger, Optional } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { hashPassword } from "./common/utils/password.util";

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @Optional()
    @InjectDataSource()
    private readonly dataSource?: DataSource,
  ) {}

  async onModuleInit() {
    if (process.env.NODE_ENV !== "development") {
      return;
    }

    if (!this.dataSource) {
      this.logger.warn(
        "DataSource is not available, skip development seeding.",
      );
      return;
    }

    await this.seedAdmin();
    await this.seedProducts();
  }

  private async seedAdmin() {
    const dataSource = this.dataSource;
    if (!dataSource) {
      return;
    }

    const adminUsername = process.env.SEED_ADMIN_USERNAME || "admin";
    const adminPassword = process.env.SEED_ADMIN_PASSWORD;

    if (!adminPassword) {
      this.logger.warn("SEED_ADMIN_PASSWORD is empty, skip admin seeding.");
      return;
    }

    const queryRunner = dataSource.createQueryRunner();
    await queryRunner.connect();

    try {
      const [admin] = await queryRunner.query(
        `SELECT id FROM admins WHERE username = ? LIMIT 1`,
        [adminUsername],
      );

      if (admin) {
        this.logger.log(`Admin already exists: ${adminUsername}`);
        return;
      }

      await queryRunner.query(
        `INSERT INTO admins (username, password, nickname, role, isActive, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
        [adminUsername, hashPassword(adminPassword), "超级管理员", "admin", 1],
      );

      this.logger.log(`Seeded admin account: ${adminUsername}`);
    } catch (error) {
      this.logger.error("Failed to seed admin account", error as any);
    } finally {
      await queryRunner.release();
    }
  }

  private async seedProducts() {
    const dataSource = this.dataSource;
    if (!dataSource) {
      return;
    }

    const queryRunner = dataSource.createQueryRunner();
    await queryRunner.connect();

    try {
      const [existingProducts] = await queryRunner.query(
        `SELECT COUNT(*) as count FROM products`,
      );
      if (Number(existingProducts?.count || 0) > 0) {
        return;
      }

      await queryRunner.query(
        `INSERT INTO products (name, sku, description, shortDescription, price, stock, category, image, icon, isActive, isFeatured, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          "示例商品",
          "DEMO-001",
          "开发环境示例商品",
          "开发环境示例商品",
          99.0,
          100,
          "示例分类",
          "",
          "📦",
          1,
          0,
        ],
      );

      this.logger.log("Seeded sample products for development.");
    } catch (error) {
      this.logger.error("Failed to seed sample products", error as any);
    } finally {
      await queryRunner.release();
    }
  }
}
