import Taro from '@tarojs/taro';
import { ACTIVITY_STATUS } from '../../constants/activity';


export async function getActivityInfo(id: string) {
    const res: any = await Taro.shareCloud.callFunction({
        name: 'lucky_get_activity_info',
        data: { id }
    });
    const { result } = res;
    result.activityStatus = getActivityStatus(result)
    return result
}

export function getActivityStatus(activity) {
    const now = new Date();
    const { beginTime, endTime, status } = activity;
  
    if (status === ACTIVITY_STATUS.CLOSED) {
      return ACTIVITY_STATUS.CLOSED;
    }
  
    if (now < new Date(beginTime)) {
      return ACTIVITY_STATUS.NOT_BEGIN;
    }
  
    if (now >= new Date(beginTime) && now <= new Date(endTime)) {
      return ACTIVITY_STATUS.ONGOING
    }
  
    if (now > new Date(endTime)) {
      return ACTIVITY_STATUS.ENDED
    }
  }