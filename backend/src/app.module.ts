import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";

import { CommonModule } from "./common/common.module";
import { databaseConfig } from "./config/database.config";
import { jwtConfig } from "./config/jwt.config";
import { SeedService } from "./seed.service";

import { ProductsModule } from "./modules/products/products.module";
import { NewsModule } from "./modules/news/news.module";
import { CertificatesModule } from "./modules/certificates/certificates.module";
import { InquiriesModule } from "./modules/inquiries/inquiries.module";
import { CategoriesModule } from "./modules/categories/categories.module";
import { CompanyModule } from "./modules/company/company.module";
import { AuthModule } from "./modules/auth/auth.module";
import { AdminModule } from "./modules/admin/admin.module";
import { DashboardModule } from "./modules/dashboard/dashboard.module";
import { SettingsModule } from "./modules/settings/settings.module";
import { BackupModule } from "./modules/backup/backup.module";
import { NotificationsModule } from "./modules/notifications/notifications.module";
import { HealthModule } from "./modules/health/health.module";
import { UploadModule } from "./modules/upload/upload.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, jwtConfig],
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: "mysql",
        host: configService.get("database.host"),
        port: configService.get("database.port"),
        username: configService.get("database.username"),
        password: configService.get("database.password"),
        database: configService.get("database.database"),
        autoLoadEntities: true,
        synchronize: configService.get<boolean>("database.synchronize"),
        migrationsRun: configService.get<boolean>("database.migrationsRun"),
        retryAttempts: 1,
        retryDelay: 1000,
        logging: configService.get<boolean>("database.logging")
          ? ["query", "error"]
          : false,
        // mysql2 fast parser uses eval/new Function by default, which is blocked in Workers.
        extra: {
          disableEval: true,
          connectTimeout: 10_000,
        },
        entityPrefix: "",
      }),
      inject: [ConfigService],
    }),

    CommonModule,
    ProductsModule,
    NewsModule,
    CertificatesModule,
    InquiriesModule,
    CategoriesModule,
    CompanyModule,
    AuthModule,
    AdminModule,
    DashboardModule,
    SettingsModule,
    BackupModule,
    NotificationsModule,
    HealthModule,
    UploadModule,
  ],
  providers: [SeedService],
})
export class AppModule {}
