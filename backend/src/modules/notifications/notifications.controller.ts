import {
  Controller,
  Get,
  Put,
  Delete,
  Param,
  ParseIntPipe,
  UseGuards,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { NotificationsService } from "./notifications.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@ApiTags("通知管理")
@Controller("notifications")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: "获取所有通知" })
  async findAll() {
    const notifications = await this.notificationsService.findAll();
    return {
      code: 200,
      data: notifications,
      message: "获取成功",
    };
  }

  @Get("unread")
  @ApiOperation({ summary: "获取未读通知" })
  async findUnread() {
    const notifications = await this.notificationsService.findUnread();
    return {
      code: 200,
      data: notifications,
      message: "获取成功",
    };
  }

  @Get("count")
  @ApiOperation({ summary: "获取未读通知数量" })
  async getUnreadCount() {
    const count = await this.notificationsService.getUnreadCount();
    return {
      code: 200,
      data: { count },
      message: "获取成功",
    };
  }

  @Put(":id/read")
  @ApiOperation({ summary: "标记通知为已读" })
  async markAsRead(@Param("id", ParseIntPipe) id: number) {
    await this.notificationsService.markAsRead(id);
    return {
      code: 200,
      message: "操作成功",
    };
  }

  @Put("read-all")
  @ApiOperation({ summary: "标记所有通知为已读" })
  async markAllAsRead() {
    await this.notificationsService.markAllAsRead();
    return {
      code: 200,
      message: "操作成功",
    };
  }

  @Delete(":id")
  @ApiOperation({ summary: "删除通知" })
  async delete(@Param("id", ParseIntPipe) id: number) {
    await this.notificationsService.delete(id);
    return {
      code: 200,
      message: "删除成功",
    };
  }

  @Delete()
  @ApiOperation({ summary: "清空所有通知" })
  async deleteAll() {
    await this.notificationsService.deleteAll();
    return {
      code: 200,
      message: "清空成功",
    };
  }
}
