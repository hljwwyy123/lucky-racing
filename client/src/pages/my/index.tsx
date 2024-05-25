import { useEffect, useState } from 'react'
import Taro from '@tarojs/taro'
import { View } from '@tarojs/components'
import { Grid, Cell } from "@nutui/nutui-react-taro"
import { Comment, List, Flag, Coupon, Notice, ArrowRight } from '@nutui/icons-react-taro'
import { formatMilliseconds, getOpenId } from '../../utils'
import './my.less'


export default function Mine() {
  const [openId, setOpenId] = useState<string>('')

  useEffect(() => {
    getOpenId().then(res => setOpenId(res))
  }, []);



  return (
    <View className='mine-container'>
      <div className='section-title'>抽奖记录</div>
      <Cell 
        extra={<ArrowRight />} 
        onClick={() => Taro.navigateTo({url: '/pages/awardHistory/index'})}
        title={<div style={{ display: 'inline-flex', alignItems: 'center' }}>
        <List />
          <span style={{ marginLeft: '5px' }}>中奖记录</span>
        </div>}
      />
      <div className='section-title'>管理员配置</div>
      <Cell 
        extra={<ArrowRight />} 
        onClick={() => Taro.navigateTo({url: '/pages/admin/createActivity/index'})}
        title={<div style={{ display: 'inline-flex', alignItems: 'center' }}>
          <Flag />
          <span style={{ marginLeft: '5px' }}>创建抽奖</span>
        </div>}
      />
      <Cell 
        extra={<ArrowRight />} 
        onClick={() => Taro.navigateTo({url: '/pages/admin/activityList/index'})}
        title={<div style={{ display: 'inline-flex', alignItems: 'center' }}>
          <Flag />
          <span style={{ marginLeft: '5px' }}>抽奖活动列表</span>
        </div>}
      />
      
    </View>
  )
}