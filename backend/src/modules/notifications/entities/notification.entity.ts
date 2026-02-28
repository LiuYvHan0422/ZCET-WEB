import { Entity, Column } from "typeorm";
import { BaseEntity } from "../../../common/entities/base.entity";

@Entity("notifications")
export class NotificationEntity extends BaseEntity {
  // 继承属性声明
  id!: number;
  createdAt!: Date;
  updatedAt!: Date;

  @Column({ type: "varchar", length: 100 })
  title!: string;

  @Column({ type: "varchar", length: 500 })
  content!: string;

  @Column({ type: "varchar", length: 50, default: "info" })
  type!: string; // info, warning, success, inquiry

  @Column({ type: "varchar", length: 100, default: "" })
  link!: string; // 跳转链接

  @Column({ type: "boolean", default: false })
  isRead!: boolean;

  @Column({ type: "varchar", length: 50, default: "" })
  relatedId!: string; // 关联数据的ID，如询盘ID
}
