import Taro, { useRouter } from '@tarojs/taro'
import { useEffect, useState } from 'react'
import { Divider } from "@nutui/nutui-react-taro"
import "./awardrecord.less"

interface RouterParams {
    activityId?: string
}

export default function LotteryRecord() {
    const router = useRouter<any>();
    const [awardRecordList, setAwardRecordList] = useState<any[]>([]);

    useEffect(() => {
        getLotteryRecord()
    },[]);

    const getLotteryRecord = async () => {
        Taro.showLoading()
        const { params } = router as { params: RouterParams };
        const { activityId = '' } = params;
        await Taro.initCloud();
        const res = await Taro.shareCloud.callFunction({
            name: 'lucky_get_activity_lottery_record',
            data: {
                activityId: activityId
            }
        })
        setAwardRecordList(res.result.data)
        Taro.hideLoading()
    }

    return <div className='award-record-container'>
          <Divider contentPosition="left">中奖记录</Divider>
          {
              awardRecordList.map((el: any) => <div className='record-item'>
                  <span>{el.prizeName}</span>
                  <span>{el.unionId}</span>
              </div>)
          }
    </div>  
}