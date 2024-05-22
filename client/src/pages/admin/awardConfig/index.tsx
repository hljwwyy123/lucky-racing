import { useEffect, useState } from 'react'
import Taro, { useRouter } from '@tarojs/taro'
import { View } from '@tarojs/components'
import { Button, Form,  DatePicker, Switch, Image, Input, Divider } from "@nutui/nutui-react-taro"
import { Grid, Cell } from "@nutui/nutui-react-taro"
import { Comment, List, Flag, Coupon, Notice, ArrowRight } from '@nutui/icons-react-taro'
import { getActivityInfo } from '../../../api/activity'
import { getAwardInfo, updateAwardConfig } from "../../../api/award"
import { ACTIVITY_STATUS_MAP } from '../../../constants/activity'
import './my.less'

interface RouterParams {
  activityId?: string
}

export default function AwardConfig() {
  const [openId, setOpenId] = useState<string>('')
  const [activityId, setActivityId] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [activityInfo, setActivityInfo] = useState<any>({})
  const [awardInfo, setAwardInfo] = useState<any>({})
  const router = useRouter<any>();
  const [form] = Form.useForm()

  useEffect(() => {
    const { params } = router as { params: RouterParams };
    const { activityId = '' } = params;
    getData(activityId)
  }, []);

  const getData = async (activityId: string) => {
    Taro.showLoading()
    await Taro.getCloud();
    const activityInfo = await getActivityInfo(activityId)
    // const awardConfig = await getAwardInfo(activityId)
    setActivityInfo(activityInfo.data[0]);
    // setAwardInfo(awardConfig)
    Taro.hideLoading()
  }


  return (
    <View className='award-container'>
        <p>奖品配置: 活动 {activityInfo.activityName} {activityId}</p>
        <p>活动状态：<span className={`activity-status status-${activityInfo.status}`}>{ACTIVITY_STATUS_MAP[`${activityInfo.status}`]}</span></p>
        <Divider />
    </View>
  )
}