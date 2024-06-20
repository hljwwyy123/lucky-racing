import Taro, { useRouter } from '@tarojs/taro'
import { useEffect, useState } from 'react'
import { Image, Cell } from "@nutui/nutui-react-taro"
import EmptyContent from '../../components/EmptyContent'
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
        {
            !awardRecordList.length && <EmptyContent text="还没有人中奖" />
        }
          {
              awardRecordList.map((el: any) => <Cell className='record-item' 
                title={<Image className='item-avatar' src={el.avatar} width={30} height={30} radius={"50%"} />} 
                // description={moment(el.createdAt).format('YYYY-MM-DD HH:mm:ss')} 
                description={el.nickName}
                extra={el.prizeName}>
              </Cell>)
          }
    </div>  
}