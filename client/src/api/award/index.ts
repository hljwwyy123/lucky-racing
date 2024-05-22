import Taro from '@tarojs/taro';

export async function getAwardInfo(activityId: string) {
    const res: any = await Taro.shareCloud.callFunction({
        name: 'lucky_get_award_info',
        data: { activityId }
    });
    const { result } = res;
    return result
}

export async function updateAwardConfig(activityId: string, payload: any) {
    const res: any = await Taro.shareCloud.callFunction({
        name: 'lucky_update_award_info',
        data: {
            activityId,
            payload
        }
    });
    const { result } = res;
    return result
}