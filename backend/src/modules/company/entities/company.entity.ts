import { Entity, Column } from "typeorm";
import { BaseEntity } from "../../../common/entities/base.entity";

@Entity("company")
export class CompanyEntity extends BaseEntity {
  // 继承属性声明
  id!: number;
  createdAt!: Date;
  updatedAt!: Date;

  @Column({ type: "varchar", length: 200, default: "" })
  name!: string;

  @Column({ type: "varchar", length: 200, default: "" })
  companyNameEn!: string;

  @Column({ type: "varchar", length: 10, default: "" })
  foundedYear!: string;

  @Column({ type: "varchar", length: 500, default: "" })
  shortDescription!: string;

  @Column({ type: "longtext", nullable: true })
  aboutContent!: string | null;

  @Column({ type: "varchar", length: 100, default: "" })
  contactName!: string;

  @Column({ type: "varchar", length: 50, default: "" })
  phone!: string;

  @Column({ type: "varchar", length: 100, default: "" })
  email!: string;

  @Column({ type: "varchar", length: 50, default: "" })
  fax!: string;

  @Column({ type: "varchar", length: 500, default: "" })
  address!: string;

  @Column({ type: "varchar", length: 500, default: "" })
  logo!: string;

  @Column({ type: "varchar", length: 500, default: "" })
  qrcode!: string;

  @Column({ type: "varchar", length: 200, default: "" })
  wechat!: string;

  @Column({ type: "varchar", length: 200, default: "" })
  wechatOfficial!: string;

  @Column({ type: "varchar", length: 200, default: "" })
  xiaohongshu!: string;

  @Column({ type: "varchar", length: 200, default: "" })
  weibo!: string;

  @Column({ type: "varchar", length: 200, default: "" })
  douyin!: string;

  @Column({ type: "json", nullable: true })
  statistics!: { years: string; customers: string; satisfaction: string };

  @Column({ type: "json", nullable: true })
  timeline!: { year: string; title: string; description: string }[];

  @Column({ type: "json", nullable: true })
  values!: { icon: string; title: string; description: string }[];
}
