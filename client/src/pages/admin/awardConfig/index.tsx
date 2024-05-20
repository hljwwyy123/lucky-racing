import { useEffect, useState } from 'react'
import Taro from '@tarojs/taro'
import { View } from '@tarojs/components'
import { Grid, Cell } from "@nutui/nutui-react-taro"
import { Comment, List, Flag, Coupon, Notice, ArrowRight } from '@nutui/icons-react-taro'
import './my.less'


export default function Mine() {
  const [openId, setOpenId] = useState<string>('')

  useEffect(() => {
  }, []);



  return (
    <View className='award-container'>
        奖品配置
    </View>
  )
}