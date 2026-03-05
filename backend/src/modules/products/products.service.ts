import {
  Injectable,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, FindOptionsWhere, ILike, SelectQueryBuilder } from "typeorm";
import { ProductEntity } from "./entities/product.entity";
import {
  CreateProductDto,
  UpdateProductDto,
  ProductQueryDto,
} from "./dto/product.dto";
import { createPaginatedResponse } from "../../common/dto/pagination.dto";

const PRODUCT_SORT_FIELDS: Array<keyof ProductEntity> = [
  "createdAt",
  "updatedAt",
  "name",
  "price",
  "stock",
];

type ProductListQuery = {
  keyword: string;
  category?: string;
  status?: string;
  sortBy: keyof ProductEntity;
  sortOrder: "ASC" | "DESC";
  page: number;
  pageSize: number;
};

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<ProductEntity> {
    const existingProduct = await this.productRepository.findOne({
      where: { sku: createProductDto.sku },
    });
    if (existingProduct) {
      throw new ConflictException(
        `SKU already exists: ${createProductDto.sku}`,
      );
    }

    const product = this.productRepository.create(createProductDto);
    return this.productRepository.save(product);
  }

  async findAll(query: ProductQueryDto) {
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

    const where: FindOptionsWhere<ProductEntity> = {};
    if (category) {
      where.category = category;
    }
    if (status === "active") {
      where.isActive = true;
    } else if (status === "inactive") {
      where.isActive = false;
    }

    const shouldSearch = keyword.trim().length > 0;
    const safeSortBy = PRODUCT_SORT_FIELDS.includes(
      sortBy as keyof ProductEntity,
    )
      ? (sortBy as keyof ProductEntity)
      : "createdAt";
    const safeSortOrder =
      String(sortOrder).toUpperCase() === "ASC" ? "ASC" : "DESC";
    const safePage = Math.max(1, Number(page) || 1);
    const safePageSize = Math.min(100, Math.max(1, Number(pageSize) || 10));
    const queryOptions: ProductListQuery = {
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
            { ...where, name: ILike(`%${keyword}%`) },
            { ...where, shortDescription: ILike(`%${keyword}%`) },
            { ...where, description: ILike(`%${keyword}%`) },
          ]
        : where,
      order: {
        [safeSortBy]: safeSortOrder,
      },
      skip: (safePage - 1) * safePageSize,
      take: safePageSize,
    } as const;

    const items = await this.productRepository.find(commonOptions);
    const total = shouldCount
      ? await this.productRepository.count({ where: commonOptions.where })
      : (safePage - 1) * safePageSize + items.length;

    return createPaginatedResponse(items, safePage, safePageSize, total);
  }

  async findOne(id: number): Promise<ProductEntity> {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException(`Product not found: ${id}`);
    }
    return product;
  }

  async update(
    id: number,
    updateProductDto: UpdateProductDto,
  ): Promise<ProductEntity> {
    const product = await this.findOne(id);
    Object.assign(product, updateProductDto);
    return this.productRepository.save(product);
  }

  async remove(id: number): Promise<void> {
    const product = await this.findOne(id);
    await this.productRepository.remove(product);
  }

  async getCategories(): Promise<string[]> {
    const result = await this.productRepository
      .createQueryBuilder("product")
      .select("DISTINCT product.category", "category")
      .where("product.isActive = :isActive", { isActive: true })
      .getRawMany();

    return result.map((item) => item.category).filter(Boolean);
  }

  async getFeaturedProducts(limit: number = 6): Promise<ProductEntity[]> {
    const safeLimit = Math.min(50, Math.max(1, Number(limit) || 6));
    return this.productRepository.find({
      where: { isActive: true, isFeatured: true },
      order: { createdAt: "DESC" },
      take: safeLimit,
    });
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

  private normalizeSummary(text: unknown, maxLength = 140): string {
    const plainText = String(text || "")
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    if (!plainText) return "";
    if (plainText.length <= maxLength) return plainText;
    return `${plainText.slice(0, maxLength)}...`;
  }

  private applyListFilters(
    qb: SelectQueryBuilder<ProductEntity>,
    query: Pick<ProductListQuery, "keyword" | "category" | "status">,
  ): void {
    if (query.category) {
      qb.andWhere("product.category = :category", { category: query.category });
    }

    if (query.status === "active") {
      qb.andWhere("product.isActive = :isActive", { isActive: true });
    } else if (query.status === "inactive") {
      qb.andWhere("product.isActive = :isActive", { isActive: false });
    }

    if (query.keyword.trim().length > 0) {
      qb.andWhere(
        "(product.name LIKE :keyword OR product.shortDescription LIKE :keyword OR product.description LIKE :keyword)",
        { keyword: `%${query.keyword}%` },
      );
    }
  }

  private async findAllCompact(query: ProductListQuery, withCount: boolean) {
    const qb = this.productRepository
      .createQueryBuilder("product")
      .select("product.id", "id")
      .addSelect("product.name", "name")
      .addSelect("product.sku", "sku")
      .addSelect("product.shortDescription", "shortDescription")
      .addSelect("SUBSTRING(product.description, 1, 240)", "description")
      .addSelect("product.price", "price")
      .addSelect("product.stock", "stock")
      .addSelect("product.category", "category")
      .addSelect("product.image", "image")
      .addSelect("product.icon", "icon")
      .addSelect("product.isActive", "isActive")
      .addSelect("product.isFeatured", "isFeatured")
      .addSelect("product.createdAt", "createdAt")
      .addSelect("product.updatedAt", "updatedAt");

    this.applyListFilters(qb, query);

    qb.orderBy(`product.${query.sortBy}`, query.sortOrder)
      .skip((query.page - 1) * query.pageSize)
      .take(query.pageSize);

    const rows = await qb.getRawMany<Record<string, any>>();
    const items = rows.map((row) => {
      const shortDescription =
        this.normalizeSummary(row.shortDescription) ||
        this.normalizeSummary(row.description);

      return {
        id: Number(row.id),
        name: row.name,
        sku: row.sku,
        shortDescription,
        description: this.normalizeSummary(row.description, 240),
        price: typeof row.price === "string" ? Number(row.price) : row.price,
        stock: Number(row.stock || 0),
        category: row.category,
        image: row.image,
        icon: row.icon,
        isActive: Boolean(Number(row.isActive)),
        isFeatured: Boolean(Number(row.isFeatured)),
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      };
    });

    let total = (query.page - 1) * query.pageSize + items.length;
    if (withCount) {
      const countQb = this.productRepository.createQueryBuilder("product");
      this.applyListFilters(countQb, query);
      total = await countQb.getCount();
    }

    return createPaginatedResponse(items, query.page, query.pageSize, total);
  }
}
