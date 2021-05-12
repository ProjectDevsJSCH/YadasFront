import axiosInstance from '@/config/http-common';
import { NotificationDTO } from '@/model/notification/notification.dto';
import { Notification } from '@/model/notification/notification.model';

export class NotificationsApi {
  static async getAll(): Promise<Notification[]> {
    const { data }: { data: NotificationDTO[]; } = await axiosInstance.get('/notifications/');

    return data.map((value) => new Notification(value));
  }
}
