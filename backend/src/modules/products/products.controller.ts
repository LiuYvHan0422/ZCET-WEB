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
import { ProductsService } from "./products.service";
import {
  CreateProductDto,
  UpdateProductDto,
  ProductQueryDto,
} from "./dto/product.dto";
import { ProductEntity } from "./entities/product.entity";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@ApiTags("产品管理")
@Controller("products")
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "创建产品" })
  @ApiResponse({ status: 201, description: "产品创建成功" })
  async create(@Body() createProductDto: CreateProductDto) {
    const product = await this.productsService.create(createProductDto);
    return {
      code: 200,
      data: product,
      message: "产品创建成功",
    };
  }

  @Get()
  @ApiOperation({ summary: "获取产品列表" })
  @ApiResponse({ status: 200, description: "获取产品列表成功" })
  findAll(@Query() query: ProductQueryDto) {
    return this.productsService.findAll(query);
  }

  @Get("categories")
  @ApiOperation({ summary: "获取所有产品分类" })
  @ApiResponse({ status: 200, description: "获取分类成功" })
  getCategories(): Promise<string[]> {
    return this.productsService.getCategories();
  }

  @Get("featured")
  @ApiOperation({ summary: "获取推荐产品" })
  @ApiResponse({ status: 200, description: "获取推荐产品成功" })
  getFeaturedProducts(
    @Query("limit") limit?: number,
  ): Promise<ProductEntity[]> {
    return this.productsService.getFeaturedProducts(limit);
  }

  @Get(":id")
  @ApiOperation({ summary: "获取产品详情" })
  @ApiResponse({ status: 200, description: "获取产品成功" })
  async findOne(@Param("id") id: string) {
    const product = await this.productsService.findOne(+id);
    return {
      code: 200,
      data: product,
      message: "获取产品成功",
    };
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "更新产品" })
  @ApiResponse({ status: 200, description: "产品更新成功" })
  async update(
    @Param("id") id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    const product = await this.productsService.update(+id, updateProductDto);
    return {
      code: 200,
      data: product,
      message: "产品更新成功",
    };
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "删除产品" })
  @ApiResponse({ status: 200, description: "产品删除成功" })
  async remove(@Param("id") id: string) {
    await this.productsService.remove(+id);
    return {
      code: 200,
      message: "产品删除成功",
    };
  }
}
