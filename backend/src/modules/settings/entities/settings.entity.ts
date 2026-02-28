import { Entity, Column } from "typeorm";
import { BaseEntity } from "../../../common/entities/base.entity";

@Entity("settings")
export class SettingsEntity extends BaseEntity {
  // 继承属性声明
  id!: number;
  createdAt!: Date;
  updatedAt!: Date;

  @Column({ type: "varchar", length: 200, default: "" })
  siteTitle!: string;

  @Column({ type: "varchar", length: 500, default: "" })
  siteDescription!: string;

  @Column({ type: "varchar", length: 500, default: "" })
  keywords!: string;

  @Column({ type: "boolean", default: false })
  twoFactorAuth!: boolean;

  @Column({ type: "boolean", default: true })
  loginAlert!: boolean;

  @Column({ type: "varchar", length: 500, default: "" })
  backupPath!: string;

  @Column({ type: "timestamp", nullable: true })
  lastBackupAt!: Date | null;

  // 数据库配置
  @Column({ type: "varchar", length: 100, default: "localhost" })
  dbHost!: string;

  @Column({ type: "int", default: 3306 })
  dbPort!: number;

  @Column({ type: "varchar", length: 100, default: "" })
  dbUsername!: string;

  @Column({ type: "varchar", length: 100, default: "", select: false })
  dbPassword!: string;

  @Column({ type: "varchar", length: 100, default: "" })
  dbName!: string;

  @Column({ type: "varchar", length: 50, default: "mysql" })
  dbType!: string;
}
