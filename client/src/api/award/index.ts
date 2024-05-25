import Taro from '@tarojs/taro';

export async function getAwardInfo(activityId: string) {
    const res: any = await Taro.shareCloud.callFunction({
        name: 'lucky_get_award_info',
        data: { activityId: activityId }
    });
    const { result } = res;
    const list = result.data;
    list.forEach(e => e.isSpecial = !!e?.isSpecial)
    return list
}

export async function updateAwardConfig(activityId: string, payload: any) {
    const res: any = await Taro.shareCloud.callFunction({
        name: 'lucky_update_award_info',
        data: {
            activityId,
            prizeInfo: {...payload},
            id: payload.id
        }
    });
    const { result } = res;
    return result
}

export async function deleteAward(id: string) {
    const res: any = await Taro.shareCloud.callFunction({
        name: 'lucky_delete_award_info',
        data: {
            id
        }
    });
    return res
}