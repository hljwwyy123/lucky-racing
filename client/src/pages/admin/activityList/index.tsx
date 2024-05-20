import { useEffect, useState } from 'react'
import Taro from '@tarojs/taro'
import { View } from '@tarojs/components'
import { Grid, Cell } from "@nutui/nutui-react-taro"
import { Comment, List, Flag, Coupon, Notice, ArrowRight } from '@nutui/icons-react-taro'
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
    setList(result.data)
  }


  return (
    <View className='list-container'>
      <div className='section-title'>抽奖活动列表</div>
      {
        list.map((el) => <Cell extra={<span className='extra-text' onClick={() => Taro.navigateTo({url: '/pages/admin/awardConfig/index'})} >奖品配置<ArrowRight /></span>} 
          title={<div style={{ display: 'inline-flex', alignItems: 'center' }}>
            <List />
            <span className='activity_name' onClick={() => Taro.navigateTo({url: '/pages/admin/createActivity/index?activityId='+el._id})} style={{ marginLeft: '5px' }}>{el.activityName}</span>
          </div>}
        />)
      }
      
    </View>
  )
}