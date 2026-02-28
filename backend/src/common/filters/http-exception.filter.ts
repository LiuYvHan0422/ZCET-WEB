import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { Request, Response } from "express";

interface ErrorResponse {
  code: number;
  message: string;
  errors?: any;
  timestamp: number;
  path: string;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = "Internal server error";
    let errors: any = null;
    let businessCode = 500; // 业务状态码

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === "string") {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === "object") {
        const responseObj = exceptionResponse as Record<string, any>;
        message = responseObj.message || message;
        errors = responseObj.errors || null;
      }

      // 将 HTTP 状态码转换为业务状态码
      switch (status) {
        case HttpStatus.BAD_REQUEST:
          businessCode = 400;
          break;
        case HttpStatus.UNAUTHORIZED:
          businessCode = 401;
          break;
        case HttpStatus.FORBIDDEN:
          businessCode = 403;
          break;
        case HttpStatus.NOT_FOUND:
          businessCode = 404;
          break;
        default:
          businessCode = status;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    // 构建符合前端期望的响应格式
    const errorResponse: ErrorResponse = {
      code: businessCode,
      message: message,
      errors: errors,
      timestamp: Date.now(),
      path: request.url,
    };

    // HTTP 状态码仍使用原始状态，但响应体符合前端期望
    response.status(status).json(errorResponse);
  }
}
