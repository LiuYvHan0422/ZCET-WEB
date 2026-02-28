import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, ILike, FindOptionsWhere } from "typeorm";
import { NewsEntity } from "./entities/news.entity";
import { CreateNewsDto, UpdateNewsDto, NewsQueryDto } from "./dto/news.dto";
import { createPaginatedResponse } from "../../common/dto/pagination.dto";

const NEWS_SORT_FIELDS: Array<keyof NewsEntity> = [
  "createdAt",
  "updatedAt",
  "title",
  "date",
];

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
    } = query;

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

    const [items, total] = await this.newsRepository.findAndCount({
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
    });

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
