import { GlobalConstants } from '@/constants/global.constants';
import moment from 'moment';

export function humanDateFormat(date: string) {
  return moment(date)
    // .add(GlobalConstants.SERVER_DIFF_HOURS, 'hours')
    .fromNow();
}
