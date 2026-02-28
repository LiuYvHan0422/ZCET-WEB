import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { CategoriesService } from "./categories.service";
import { CreateCategoryDto, UpdateCategoryDto } from "./dto/category.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@ApiTags("分类管理")
@Controller("categories")
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "创建分类" })
  @ApiResponse({ status: 201, description: "分类创建成功" })
  async create(@Body() createCategoryDto: CreateCategoryDto) {
    const data = await this.categoriesService.create(createCategoryDto);
    return { code: 200, message: "分类创建成功", data };
  }

  @Get()
  @ApiOperation({ summary: "获取分类列表" })
  @ApiResponse({ status: 200, description: "获取分类列表成功" })
  findAll(@Query("page") page?: number, @Query("limit") limit?: number) {
    return this.categoriesService.findAll(page, limit);
  }

  @Get("all")
  @ApiOperation({ summary: "获取所有分类" })
  @ApiResponse({ status: 200, description: "获取所有分类成功" })
  getAll() {
    return this.categoriesService.getAll();
  }

  @Get(":id")
  @ApiOperation({ summary: "获取分类详情" })
  @ApiResponse({ status: 200, description: "获取分类成功" })
  findOne(@Param("id") id: string) {
    return this.categoriesService.findOne(+id);
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "更新分类" })
  @ApiResponse({ status: 200, description: "分类更新成功" })
  async update(
    @Param("id") id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    const data = await this.categoriesService.update(+id, updateCategoryDto);
    return { code: 200, message: "分类更新成功", data };
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "删除分类" })
  @ApiResponse({ status: 200, description: "分类删除成功" })
  async remove(@Param("id") id: string) {
    await this.categoriesService.remove(+id);
    return { code: 200, message: "分类删除成功" };
  }
}
