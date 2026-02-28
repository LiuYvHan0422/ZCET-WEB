import {
  Injectable,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, FindOptionsWhere, ILike } from "typeorm";
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
    } = query;

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

    const [items, total] = await this.productRepository.findAndCount({
      where: shouldSearch
        ? [
            { ...where, name: ILike(`%${keyword}%`) },
            { ...where, description: ILike(`%${keyword}%`) },
          ]
        : where,
      order: {
        [safeSortBy]: safeSortOrder,
      },
      skip: (safePage - 1) * safePageSize,
      take: safePageSize,
    });

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
}
