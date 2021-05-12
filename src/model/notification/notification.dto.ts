import { ProductTypeSelect } from '@/interfaces/product-type-select.interface';
import { MerchandiseNotificationTypes } from './notification-types.enum';

export interface MerchandiseNotification {
  id: number;
  idProducto: string;
  tipo: MerchandiseNotificationTypes;
  fecha: string;
  producto?: {
    Referencia: string;
    Descripcion: string;
  };
}

export class NotificationDTO implements MerchandiseNotification {
  id!: number;
  idProducto!: string;
  tipo!: MerchandiseNotificationTypes;
  fecha!: string;
}
