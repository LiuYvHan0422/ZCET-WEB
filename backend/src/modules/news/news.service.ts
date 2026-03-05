import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import {
  Repository,
  ILike,
  FindOptionsWhere,
  SelectQueryBuilder,
} from "typeorm";
import { NewsEntity } from "./entities/news.entity";
import { CreateNewsDto, UpdateNewsDto, NewsQueryDto } from "./dto/news.dto";
import { createPaginatedResponse } from "../../common/dto/pagination.dto";

const NEWS_SORT_FIELDS: Array<keyof NewsEntity> = [
  "createdAt",
  "updatedAt",
  "title",
  "date",
];

type NewsListQuery = {
  keyword: string;
  category?: string;
  status?: string;
  sortBy: keyof NewsEntity;
  sortOrder: "ASC" | "DESC";
  page: number;
  pageSize: number;
};

@Injectable()
export class NewsService {
  constructor(
    @InjectRepository(NewsEntity)
    private readonly newsRepository: Repository<NewsEntity>,
  ) {}

  async create(createNewsDto: CreateNewsDto): Promise<Record<string, any>> {
    const news = this.newsRepository.create(this.normalizeInput(createNewsDto));
    const saved = await this.newsRepository.save(news);
    return this.mapOutput(saved);
  }

  async findAll(query: NewsQueryDto) {
    const {
      keyword = "",
      category,
      status,
      sortBy = "createdAt",
      sortOrder = "DESC",
      page = 1,
      pageSize = 10,
      compact,
      withCount,
    } = query;

    const compactMode = this.parseBooleanFlag(compact, false);
    const shouldCount = this.parseBooleanFlag(withCount, true);

    const where: FindOptionsWhere<NewsEntity> = {};
    if (category) {
      where.category = category;
    }

    if (status === "published") {
      where.isPublished = true;
    } else if (status === "draft") {
      where.isPublished = false;
    }

    const shouldSearch = keyword.trim().length > 0;
    const safeSortBy = NEWS_SORT_FIELDS.includes(sortBy as keyof NewsEntity)
      ? (sortBy as keyof NewsEntity)
      : "createdAt";
    const safeSortOrder =
      String(sortOrder).toUpperCase() === "ASC" ? "ASC" : "DESC";
    const safePage = Math.max(1, Number(page) || 1);
    const safePageSize = Math.min(100, Math.max(1, Number(pageSize) || 10));
    const queryOptions: NewsListQuery = {
      keyword,
      category,
      status,
      sortBy: safeSortBy,
      sortOrder: safeSortOrder,
      page: safePage,
      pageSize: safePageSize,
    };

    if (compactMode) {
      return this.findAllCompact(queryOptions, shouldCount);
    }

    const commonOptions = {
      where: shouldSearch
        ? [
            { ...where, title: ILike(`%${keyword}%`) },
            { ...where, excerpt: ILike(`%${keyword}%`) },
          ]
        : where,
      order: {
        [safeSortBy]: safeSortOrder,
      },
      skip: (safePage - 1) * safePageSize,
      take: safePageSize,
    } as const;

    const items = await this.newsRepository.find(commonOptions);
    const total = shouldCount
      ? await this.newsRepository.count({ where: commonOptions.where })
      : (safePage - 1) * safePageSize + items.length;

    return createPaginatedResponse(
      items.map((item) => this.mapOutput(item)),
      safePage,
      safePageSize,
      total,
    );
  }

  async findOne(id: number): Promise<Record<string, any>> {
    const news = await this.newsRepository.findOne({ where: { id } });
    if (!news) {
      throw new NotFoundException(`News not found: ${id}`);
    }
    return this.mapOutput(news);
  }

  async update(
    id: number,
    updateNewsDto: UpdateNewsDto,
  ): Promise<Record<string, any>> {
    const news = await this.newsRepository.findOne({ where: { id } });
    if (!news) {
      throw new NotFoundException(`News not found: ${id}`);
    }

    Object.assign(news, this.normalizeInput(updateNewsDto));
    const saved = await this.newsRepository.save(news);
    return this.mapOutput(saved);
  }

  async remove(id: number): Promise<void> {
    const news = await this.newsRepository.findOne({ where: { id } });
    if (!news) {
      throw new NotFoundException(`News not found: ${id}`);
    }
    await this.newsRepository.remove(news);
  }

  async getLatestNews(
    limit: number = 6,
    isPublished?: boolean,
  ): Promise<Record<string, any>[]> {
    const safeLimit = Math.min(50, Math.max(1, Number(limit) || 6));
    const where: FindOptionsWhere<NewsEntity> = {};
    if (isPublished === true) {
      where.isPublished = true;
    }

    const items = await this.newsRepository.find({
      where,
      order: { createdAt: "DESC" },
      take: safeLimit,
    });
    return items.map((item) => this.mapOutput(item));
  }

  private normalizeInput(
    input: Partial<CreateNewsDto | UpdateNewsDto>,
  ): Partial<NewsEntity> {
    const data: any = { ...input };

    if (typeof data.image === "string") {
      data.coverImage = data.image;
      delete data.image;
    }

    if (typeof data.summary === "string") {
      data.excerpt = data.summary;
      delete data.summary;
    }

    if (typeof data.status === "string") {
      data.isPublished = data.status === "published";
      delete data.status;
    }

    return data;
  }

  private parseBooleanFlag(value: unknown, defaultValue: boolean): boolean {
    if (value === undefined || value === null || value === "") {
      return defaultValue;
    }

    const normalized = String(value).trim().toLowerCase();
    if (["1", "true", "yes", "on"].includes(normalized)) {
      return true;
    }
    if (["0", "false", "no", "off"].includes(normalized)) {
      return false;
    }
    return defaultValue;
  }

  private applyListFilters(
    qb: SelectQueryBuilder<NewsEntity>,
    query: Pick<NewsListQuery, "keyword" | "category" | "status">,
  ): void {
    if (query.category) {
      qb.andWhere("news.category = :category", { category: query.category });
    }

    if (query.status === "published") {
      qb.andWhere("news.isPublished = :isPublished", { isPublished: true });
    } else if (query.status === "draft") {
      qb.andWhere("news.isPublished = :isPublished", { isPublished: false });
    }

    if (query.keyword.trim().length > 0) {
      qb.andWhere("(news.title LIKE :keyword OR news.excerpt LIKE :keyword)", {
        keyword: `%${query.keyword}%`,
      });
    }
  }

  private async findAllCompact(query: NewsListQuery, withCount: boolean) {
    const qb = this.newsRepository
      .createQueryBuilder("news")
      .select("news.id", "id")
      .addSelect("news.title", "title")
      .addSelect("news.excerpt", "excerpt")
      .addSelect("news.date", "date")
      .addSelect("news.icon", "icon")
      .addSelect("news.category", "category")
      .addSelect("news.author", "author")
      .addSelect("news.coverImage", "coverImage")
      .addSelect("news.isPublished", "isPublished")
      .addSelect("news.createdAt", "createdAt")
      .addSelect("news.updatedAt", "updatedAt");

    this.applyListFilters(qb, query);

    qb.orderBy(`news.${query.sortBy}`, query.sortOrder)
      .skip((query.page - 1) * query.pageSize)
      .take(query.pageSize);

    const rows = await qb.getRawMany<Record<string, any>>();
    const items = rows.map((row) => ({
      id: Number(row.id),
      title: row.title,
      excerpt: row.excerpt || "",
      date: row.date || "",
      icon: row.icon || "",
      category: row.category || "",
      author: row.author || "",
      coverImage: row.coverImage || "",
      image: row.coverImage || "",
      isPublished: Boolean(Number(row.isPublished)),
      status: Boolean(Number(row.isPublished)) ? "published" : "draft",
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      views: 0,
    }));

    let total = (query.page - 1) * query.pageSize + items.length;
    if (withCount) {
      const countQb = this.newsRepository.createQueryBuilder("news");
      this.applyListFilters(countQb, query);
      total = await countQb.getCount();
    }

    return createPaginatedResponse(items, query.page, query.pageSize, total);
  }

  private mapOutput(item: NewsEntity): Record<string, any> {
    return {
      ...item,
      image: item.coverImage,
      summary: item.excerpt || item.summary || "",
      status: item.isPublished ? "published" : "draft",
      views: 0,
    };
  }
}
