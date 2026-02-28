import { Entity, Column } from "typeorm";
import { BaseEntity } from "../../../common/entities/base.entity";

@Entity("admins")
export class AdminEntity extends BaseEntity {
  // 继承属性声明
  id!: number;
  createdAt!: Date;
  updatedAt!: Date;

  @Column({ type: "varchar", length: 100, unique: true })
  username!: string;

  @Column({ type: "varchar", length: 200 })
  password!: string;

  @Column({ type: "varchar", length: 100, default: "" })
  nickname!: string;

  @Column({ type: "varchar", length: 100, default: "" })
  email!: string;

  @Column({ type: "varchar", length: 20, default: "" })
  phone!: string;

  @Column({ type: "varchar", length: 100, default: "admin" })
  role!: string;

  @Column({ type: "boolean", default: true })
  isActive!: boolean;

  @Column({ type: "varchar", length: 50, nullable: true })
  lastLoginIp!: string | null;

  @Column({ type: "timestamp", nullable: true })
  lastLoginAt!: Date | null;
}
