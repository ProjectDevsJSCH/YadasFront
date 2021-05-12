import Vue from 'vue';

export enum MessageTypes {
  ERROR = 'error',
  SUCCESS = 'success',
  WARNING = 'warning',
  INFO = 'info'
}

export default function globalMessaging(
  this: Vue,
  {
    title = '',
    message = '',
    time = 2000,
    type = MessageTypes.INFO,
  }: {
    title: string;
    message: string;
    time: number;
    type: MessageTypes;
  },
) {
  this.$store.commit('messaging/setGlobalMessage', {
    type,
    title,
    message,
    time,
  });
}
