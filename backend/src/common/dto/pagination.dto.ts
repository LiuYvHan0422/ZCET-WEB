import { ApiProperty } from "@nestjs/swagger";

export class PaginationDto {
  @ApiProperty({ description: "当前页码", example: 1 })
  page: number;

  @ApiProperty({ description: "每页数量", example: 10 })
  limit: number;

  @ApiProperty({ description: "总数量", example: 100 })
  total: number;

  @ApiProperty({ description: "总页数", example: 10 })
  totalPages: number;
}

export class PaginatedResponseDto<T> {
  @ApiProperty({ description: "状态码", example: 200 })
  code: number;

  @ApiProperty({ description: "消息", example: "success" })
  message: string;

  @ApiProperty({ description: "数据" })
  data: T;

  @ApiProperty({ description: "分页信息", type: PaginationDto })
  pagination: PaginationDto;

  @ApiProperty({ description: "时间戳", example: 1700000000000 })
  timestamp: number;
}

export function createPaginatedResponse<T>(
  data: T,
  page: number,
  limit: number,
  total: number,
): PaginatedResponseDto<T> {
  const totalPages = Math.ceil(total / limit);

  return {
    code: 200,
    message: "success",
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
    timestamp: Date.now(),
  };
}
