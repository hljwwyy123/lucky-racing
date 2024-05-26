import Taro from '@tarojs/taro';
import { ACTIVITY_STATUS } from '../../constants/activity';


export async function getActivityInfo(id: string) {
  const res: any = await Taro.shareCloud.callFunction({
    name: 'lucky_get_activity_info',
    data: { id }
  });
  const { result: { data = []} } = res;
  const activityInfo = data[0];
  activityInfo.status = getActivityStatus(activityInfo)
  return activityInfo
}

export function getActivityStatus(activity) {
  if (!activity) return;
  const now = new Date();
  const { beginTime, endTime, status } = activity;
  const _beginTime = beginTime.replace(/\-/g, '/')
  const _endTime = endTime.replace(/\-/g, '/')
  if (status === ACTIVITY_STATUS.CLOSED) {
    return ACTIVITY_STATUS.CLOSED;
  }

  if (now < new Date(_beginTime)) {
    return ACTIVITY_STATUS.NOT_BEGIN;
  }

  if (now >= new Date(_beginTime) && now <= new Date(_endTime)) {
    return ACTIVITY_STATUS.ONGOING
  }

  if (now > new Date(_endTime)) {
    return ACTIVITY_STATUS.ENDED
  }
}