import { useEffect, useState } from 'react'
import Taro, { useShareAppMessage } from '@tarojs/taro'
import { View } from '@tarojs/components'
import { Button, Cell } from "@nutui/nutui-react-taro"
import classnames from "classnames"
import { getActivityStatus } from "../../api/activity"
import { ACTIVITY_STATUS, ACTIVITY_STATUS_MAP, DEFAULT_BANNER_IMAGE } from '../../constants/activity'
import './index.less'

export default function ActivityList() {
  const [list, setList] = useState<any[]>([])

  useEffect(() => {
    getActivityList()
  }, []);

  useShareAppMessage((res) => {
    return {
        path: '/pages/index/index',
    };
  })
  
  const getActivityList = async () => {
    await Taro.initCloud();
    const res = await Taro.shareCloud.callFunction({
      name: "lucky_get_activity_list",
    });
    const { result } = res;
    result.data.forEach(d => {
      d.status = getActivityStatus(d)
    })
    result.data[3].bannerImage = 'https://img.alicdn.com/imgextra/i3/O1CN01kZW6ZO1PpfWsGi767_!!6000000001890-0-tps-1280-524.jpg'
    setList(result.data)
  }


  return (
    <View className='activity-list-container'>
      {
        list.map((el) => <div
          className='activity-item'
          style={{ backgroundImage: `linear-gradient(
            to right bottom,
            rgba(255, 255, 225, 0.35),
            rgba(0, 0, 255, 0.15)
          ), url('${el?.bannerImage || DEFAULT_BANNER_IMAGE}')`}}
          onClick={() => Taro.navigateTo({url: '/pages/lottery/index?activityId='+el._id})}
        >
          <div className={`status-corner status-${el.status}`}>
            <div className={`status-text status-${el.status}`}>{ACTIVITY_STATUS_MAP[`${el.status}`]}</div>
          </div>
          <div className='activity-list-item' >
            <span className='activity_name' style={{ marginLeft: '5px' }}>{el.activityName}</span>
          </div>
          {
            +el.status <= ACTIVITY_STATUS.ONGOING && 
            <div className='button-line'>
              <Button type='success'>去抽奖</Button>
            </div>
          }
        </div>)
      }
      
    </View>
  )
}