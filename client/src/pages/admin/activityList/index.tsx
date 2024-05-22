import { useEffect, useState } from 'react'
import Taro from '@tarojs/taro'
import { View } from '@tarojs/components'
import { Grid, Cell } from "@nutui/nutui-react-taro"
import { Comment, List, Flag, Coupon, Notice, ArrowRight } from '@nutui/icons-react-taro'
import { getActivityStatus } from "../../../api/activity"
import { ACTIVITY_STATUS_MAP } from '../../../constants/activity'
import './activityList.less'


export default function ActivityList() {
  const [list, setList] = useState<any[]>([])

  useEffect(() => {
    getActivityList()
  }, []);

  const getActivityList = async () => {
    await Taro.getCloud();
    const res = await Taro.shareCloud.callFunction({
      name: "lucky_get_activity_list",
    });
    const { result } = res;
    result.data.forEach(d => d.status = getActivityStatus(d))
    setList(result.data)
  }


  return (
    <View className='list-container'>
      <div className='section-title'>抽奖活动列表</div>
      {
        list.map((el) => <Cell extra={<span className='extra-text' onClick={() => Taro.navigateTo({url: '/pages/admin/awardConfig/index?activityId='+el._id})} >奖品配置<ArrowRight /></span>} 
          title={<div className='activity-list-item' >
            {/* <List /> */}
            <span className='activity_name' onClick={() => Taro.navigateTo({url: '/pages/admin/createActivity/index?activityId='+el._id})} style={{ marginLeft: '5px' }}>{el.activityName}</span>
            <span className={`activity-status status-${el.status}`}>{ACTIVITY_STATUS_MAP[`${el.status}`]}</span>
          </div>}
        />)
      }
      
    </View>
  )
}