import { AxiosInstance } from 'axios';
import { MessageTypes } from '@/instance/global-messaging';

interface ReportMessage {
  title: string;
  message?: string;
  time?: number;
  type?: MessageTypes;
}

declare module 'vue/types/vue' {
  interface Vue {
    $http: AxiosInstance;
    $report: (this: Vue, options: ReportMessage) => void;
    $useLoader: <T>(promise: Promise<T>) => Promise<T>;
  }
}
