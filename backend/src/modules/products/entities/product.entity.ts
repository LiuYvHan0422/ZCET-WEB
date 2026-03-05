import { Entity, Column, Index } from "typeorm";
import { BaseEntity } from "../../../common/entities/base.entity";

@Index("idx_products_active_category_created", ["isActive", "category", "createdAt"])
@Index("idx_products_active_featured_created", ["isActive", "isFeatured", "createdAt"])
@Entity("products")
export class ProductEntity extends BaseEntity {
  // 继承属性声明
  id!: number;
  createdAt!: Date;
  updatedAt!: Date;

  @Column({ type: "varchar", length: 200 })
  name!: string;

  @Column({ type: "varchar", length: 100, unique: true })
  sku!: string;

  @Column({ type: "text" })
  description!: string;

  @Column({ type: "text", nullable: true })
  shortDescription?: string;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  price!: number;

  @Column({ type: "int", default: 0 })
  stock!: number;

  @Column({ type: "varchar", length: 100 })
  category!: string;

  @Column({ type: "varchar", length: 255, nullable: true, default: "" })
  image!: string;

  @Column({ type: "varchar", length: 50, default: "" })
  icon!: string;

  @Column({ type: "json", nullable: true })
  features!: string[];

  @Column({ type: "json", nullable: true })
  details!: string[];

  @Column({ type: "boolean", default: true })
  isActive!: boolean;

  @Column({ type: "boolean", default: false })
  isFeatured!: boolean;
}
