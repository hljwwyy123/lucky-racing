import Taro from '@tarojs/taro';
import { getActivityJoinInfo } from '../activity';

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

export async function getRemainTimes(activityId: string) {
    const joinInfo = await getActivityJoinInfo(activityId)
    return joinInfo.times
}

export async function getBookInfo(activityId: string) {
    const res: any = await Taro.shareCloud.callFunction({
        name: 'lucky_get_book_lottery_info',
        data: {
            activityId
        }
    });
    return res
}

export async function bookLottery(activityId: string, payload: any) {
    const res: any = await Taro.shareCloud.callFunction({
        name: 'lucky_book_lottery',
        data: {
            activityId,
            ...payload
        }
    });
    return res
}

export async function approveBooking(activityId: string, approve: boolean, unionId: string) {
    const res: any = await Taro.shareCloud.callFunction({
        name: 'lucky_approve_book_lottery',
        data: {
            activityId,
            unionId,
            approve
        }
    });
    return res
}