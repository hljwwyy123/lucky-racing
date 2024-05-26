import { useEffect, useState } from 'react'
import Taro, { useRouter } from '@tarojs/taro'
import { View } from '@tarojs/components'
import { Grid, Cell } from "@nutui/nutui-react-taro"
import { Comment, List, Flag, Coupon, Notice, ArrowRight } from '@nutui/icons-react-taro'
import { getBookInfo } from '../../../api/award'
import EmptyContent from '../../../components/EmptyContent'
import './my.less'


interface Params {
  activityId?: string; // 抽奖活动ID
}
export default function Mine() {
  const router = useRouter<any>();
  const [openId, setOpenId] = useState<string>('')
  const [activityId, setActivityId] = useState<string>('')

  useEffect(() => {
    const { params } = router as { params: Params };
    const { activityId = '' } = params;
    setActivityId(activityId);
    getDataList();
  }, []);

  const getDataList = async () => {
    const { params } = router as { params: Params };
    const { activityId = '' } = params;
    const res = await getBookInfo(activityId)
    console.log(res)
  }

  if (!activityId) {
    return <EmptyContent text={`活动： ${activityId} 还没有人报名`} />
  }

  return (
    <View className='award-container'>
        报名审核
        <h2>活动：{activityId}</h2>
    </View>
  )
}