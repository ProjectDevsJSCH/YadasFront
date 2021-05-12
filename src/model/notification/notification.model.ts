import { MerchandiseNotificationTypes } from './notification-types.enum';
import { NotificationDTO } from './notification.dto';
import moment from 'moment';

export interface NotificationUI extends NotificationDTO {
  bulletColor?: string;
  notificationColor?: string;
  formattedDate?: string;
}

export class Notification extends NotificationDTO {
  constructor(dto: NotificationDTO) {
    super();
    Object.assign(this, dto);
  }

  static notificationTypes(): MerchandiseNotificationTypes[] {
    return [
      MerchandiseNotificationTypes.ACTIVATED,
      MerchandiseNotificationTypes.DISABLED,
      MerchandiseNotificationTypes.NEW_MERCHANDISE,
      MerchandiseNotificationTypes.UPDATED_MERCHANDISE,
    ];
  }

  toUI(): NotificationUI {
    const color = 'green';
    moment.locale('es');
    const date = moment(this.fecha).add(5, 'hours').fromNow();

    return {
      ...this,
      formattedDate: `${date[0].toUpperCase()}${date.substring(1)}`,
      bulletColor: color,
      notificationColor: this.getNotificationColor(this.tipo),
    };
  }

  private getNotificationColor(type: MerchandiseNotificationTypes) {
    switch (type) {
      case MerchandiseNotificationTypes.UPDATED_MERCHANDISE:
        return 'orange';
      case MerchandiseNotificationTypes.NEW_MERCHANDISE:
        return 'cyan darken-1';
      case MerchandiseNotificationTypes.ACTIVATED:
        return 'green';
      case MerchandiseNotificationTypes.DISABLED:
        return 'blue-grey darken-1';
      default:
        return 'primary';
    }
  }
}
