import { Entity, Column } from "typeorm";
import { BaseEntity } from "../../../common/entities/base.entity";

@Entity("inquiries")
export class InquiryEntity extends BaseEntity {
  // 继承属性声明
  id!: number;
  createdAt!: Date;
  updatedAt!: Date;

  @Column({ type: "varchar", length: 200, default: "" })
  productName!: string;

  @Column({ type: "varchar", length: 100 })
  customerName!: string;

  @Column({ type: "varchar", length: 50 })
  customerPhone!: string;

  @Column({ type: "varchar", length: 100, default: "" })
  customerEmail!: string;

  @Column({ type: "varchar", length: 200, default: "" })
  companyName!: string;

  @Column({ type: "text", nullable: true })
  message!: string | null;

  @Column({ type: "varchar", length: 20, default: "pending" })
  status!: string;

  @Column({ type: "text", nullable: true })
  remark!: string | null;

  @Column({ type: "int", nullable: true })
  processedBy!: number | null;
}
