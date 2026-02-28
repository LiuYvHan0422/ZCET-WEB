import { Entity, Column } from "typeorm";
import { BaseEntity } from "../../../common/entities/base.entity";

@Entity("certificates")
export class CertificateEntity extends BaseEntity {
  // 继承属性声明
  id!: number;
  createdAt!: Date;
  updatedAt!: Date;

  @Column({ type: "varchar", length: 200 })
  title!: string;

  @Column({ type: "varchar", length: 50, default: "other" })
  type!: string;

  @Column({ type: "text" })
  description!: string;

  @Column({ type: "varchar", length: 500, default: "" })
  image!: string;

  @Column({ type: "varchar", length: 50, default: "" })
  icon!: string;

  @Column({ type: "int", default: 0 })
  sortOrder!: number;

  @Column({ type: "tinyint", default: 1 })
  isActive!: boolean;

  @Column({ type: "varchar", length: 50, default: "" })
  date!: string;

  @Column({ type: "varchar", length: 100, default: "" })
  number!: string;
}
