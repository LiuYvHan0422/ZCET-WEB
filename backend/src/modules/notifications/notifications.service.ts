import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { NotificationEntity } from "./entities/notification.entity";
import { CreateNotificationDto } from "./dto/notification.dto";

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(NotificationEntity)
    private readonly notificationRepository: Repository<NotificationEntity>,
  ) {}

  async create(
    createNotificationDto: CreateNotificationDto,
  ): Promise<NotificationEntity> {
    const notification = this.notificationRepository.create(
      createNotificationDto,
    );
    return this.notificationRepository.save(notification);
  }

  async findAll(): Promise<NotificationEntity[]> {
    return this.notificationRepository.find({
      order: { createdAt: "DESC" },
    });
  }

  async findUnread(): Promise<NotificationEntity[]> {
    return this.notificationRepository.find({
      where: { isRead: false },
      order: { createdAt: "DESC" },
    });
  }

  async getUnreadCount(): Promise<number> {
    return this.notificationRepository.count({
      where: { isRead: false },
    });
  }

  async markAsRead(id: number): Promise<void> {
    await this.notificationRepository.update(id, { isRead: true });
  }

  async markAllAsRead(): Promise<void> {
    await this.notificationRepository.update(
      { isRead: false },
      { isRead: true },
    );
  }

  async delete(id: number): Promise<void> {
    await this.notificationRepository.delete(id);
  }

  async deleteAll(): Promise<void> {
    await this.notificationRepository.clear();
  }
}
