import Taro, { useRouter } from '@tarojs/taro'
import { useEffect, useState } from 'react'
import moment from "moment"
import { Divider, Cell } from "@nutui/nutui-react-taro"
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
              awardRecordList.map((el: any) => <Cell className='record-item' 
                title={el.unionId} description={moment(el.createdAt).format('YYYY-MM-DD HH:mm:ss')} 
                extra={el.prizeName}>
              </Cell>)
          }
    </div>  
}