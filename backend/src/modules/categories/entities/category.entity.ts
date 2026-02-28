import { Entity, Column } from "typeorm";
import { BaseEntity } from "../../../common/entities/base.entity";

@Entity("categories")
export class CategoryEntity extends BaseEntity {
  // 继承属性声明
  id!: number;
  createdAt!: Date;
  updatedAt!: Date;

  @Column({ type: "varchar", length: 100 })
  name!: string;

  @Column({ type: "varchar", length: 500, default: "" })
  description!: string;

  @Column({ type: "varchar", length: 50, default: "" })
  icon!: string;

  @Column({ type: "int", default: 0 })
  sortOrder!: number;
}
