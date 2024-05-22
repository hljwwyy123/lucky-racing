export enum ACTIVITY_STATUS {
    NOT_BEGIN = 0,
    ONGOING,
    ENDED,
    CLOSED
}

export const ACTIVITY_STATUS_MAP = {
    '0': '未开始',
    '1': '进行中',
    '2': '已结束',
    '3': '已取消'
}