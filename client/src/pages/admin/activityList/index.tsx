import { useEffect, useState } from 'react'
import Taro, { useShareAppMessage } from '@tarojs/taro'
import { View } from '@tarojs/components'
import { Button, Cell } from "@nutui/nutui-react-taro"
import { Share, ArrowRight, Edit } from '@nutui/icons-react-taro'
import { getActivityStatus } from "../../../api/activity"
import { ACTIVITY_STATUS, ACTIVITY_STATUS_MAP } from '../../../constants/activity'
import './activityList.less'

export default function ActivityList() {
  const [list, setList] = useState<any[]>([])
  const [shareActivityInfo, setShareActivityInfo] = useState<any>()

  useEffect(() => {
    getActivityList()
  }, []);

  useShareAppMessage((res) => {
    let sharePath = "";
    let shareTitle = "上官喊你来抽奖啦~";
    let imageUrl = ''
    if (res.from === 'button') {
        // 来自页面内分享按钮
        shareTitle = shareActivityInfo.activityName;
        sharePath = '/pages/lottery/index?activityId=' + shareActivityInfo?._id; // 分享卡片的小程序路径
        imageUrl = 'https://img2.imgtp.com/2024/05/26/shex3OcZ.png';
    } else {
        // 右上角分享好友
        sharePath = '/pages/index/index'
    }

    return {
        title: shareTitle, // 分享卡片的title
        path: sharePath,
        imageUrl: imageUrl // 分享卡片的图片链接
    };
  })
  
  const getActivityList = async () => {
    await Taro.initCloud();
    const res = await Taro.shareCloud.callFunction({
      name: "lucky_get_activity_list",
    });
    const { result } = res;
    result.data.forEach(d => d.status = getActivityStatus(d))
    setList(result.data)
  }

  const onShare = (e: any, activityInfo: any) => {
    e.stopPropagation()
    setShareActivityInfo(activityInfo)
  }


  return (
    <View className='list-container'>
      {
        list.map((el) => <Cell extra={<span className='extra-text' 
            onClick={() => Taro.navigateTo({url: '/pages/admin/awardConfig/index?activityId='+el._id})} >
            {
              +el.status <= ACTIVITY_STATUS.ONGOING &&
              <Button className='share-btn' onClick={(e) => onShare(e, el)} openType="share" ><Share /></Button>
            }
            奖品配置<ArrowRight />
          </span>} 
          title={<div className='activity-list-item' >
            <span className='activity_name' onClick={() => Taro.navigateTo({url: '/pages/admin/createActivity/index?activityId='+el._id})} style={{ marginLeft: '5px' }}>{el.activityName}<Edit /></span>
            <span className={`activity-status status-${el.status}`}>{ACTIVITY_STATUS_MAP[`${el.status}`]}</span>
          </div>}
        />)
      }
      
    </View>
  )
}