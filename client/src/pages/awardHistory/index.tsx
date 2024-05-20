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
      <div className='section-title'>抽奖活动列表</div>
      
      
    </View>
  )
}