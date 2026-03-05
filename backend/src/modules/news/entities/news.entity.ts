import { Entity, Column, Index } from "typeorm";
import { BaseEntity } from "../../../common/entities/base.entity";

@Index("idx_news_published_category_created", ["isPublished", "category", "createdAt"])
@Index("idx_news_published_date_created", ["isPublished", "date", "createdAt"])
@Entity("news")
export class NewsEntity extends BaseEntity {
  // 继承属性声明
  id!: number;
  createdAt!: Date;
  updatedAt!: Date;

  @Column({ type: "varchar", length: 200 })
  title!: string;

  @Column({ type: "varchar", length: 500 })
  excerpt!: string;

  @Column({ type: "longtext" })
  content!: string;

  @Column({ type: "varchar", length: 20, default: "" })
  date!: string;

  @Column({ type: "varchar", length: 50, default: "" })
  icon!: string;

  @Column({ type: "boolean", default: true })
  isPublished!: boolean;

  @Column({ type: "varchar", length: 50, default: "" })
  category!: string;

  @Column({ type: "varchar", length: 100, default: "" })
  author!: string;

  @Column({ type: "text", nullable: true })
  summary!: string;

  @Column({ type: "varchar", length: 500, default: "" })
  coverImage!: string;
}
