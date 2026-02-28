import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CategoryEntity } from "./entities/category.entity";
import { CreateCategoryDto, UpdateCategoryDto } from "./dto/category.dto";
import { createPaginatedResponse } from "../../common/dto/pagination.dto";

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(CategoryEntity)
    private readonly categoryRepository: Repository<CategoryEntity>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<CategoryEntity> {
    const category = this.categoryRepository.create(createCategoryDto);
    return this.categoryRepository.save(category);
  }

  async findAll(page: number = 1, limit: number = 10) {
    const [items, total] = await this.categoryRepository.findAndCount({
      order: {
        sortOrder: "ASC",
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    return createPaginatedResponse(items, page, limit, total);
  }

  async findOne(id: number): Promise<CategoryEntity> {
    const category = await this.categoryRepository.findOne({ where: { id } });

    if (!category) {
      throw new NotFoundException(`ID 为 ${id} 的分类不存在`);
    }

    return category;
  }

  async update(
    id: number,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<CategoryEntity> {
    const category = await this.findOne(id);

    Object.assign(category, updateCategoryDto);

    return this.categoryRepository.save(category);
  }

  async remove(id: number): Promise<void> {
    const category = await this.findOne(id);
    await this.categoryRepository.remove(category);
  }

  async getAll(): Promise<CategoryEntity[]> {
    return this.categoryRepository.find({
      order: {
        sortOrder: "ASC",
      },
    });
  }
}
