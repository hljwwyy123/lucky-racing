import Taro, { useRouter } from '@tarojs/taro'
import { useEffect, useState } from 'react'
import { Image, Cell } from "@nutui/nutui-react-taro"
import { formatMilliseconds } from '../../utils'
import "./awardrecord.less"

const DEFAULT_AVATAR = "https://img.alicdn.com/imgextra/i3/O1CN01Hso8lx1rexUYpctvl_!!6000000005657-2-tps-48-48.png"

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
            name: 'lucky_get_approve_list',
            data: {
                activityId: activityId
            }
        })
        setAwardRecordList(res.result.data)
        Taro.hideLoading()
    }

    return <div className='award-record-container'>
        <div className='table-container'>
            <div className='table-th'>
            <div className='th-no'>Pos</div>
            <div className='th-user'>Driver</div>
            <div className='th-score'>Tm</div>
            <div className='th-seed'>Seed</div>
            <div className='th-gmt'>Tm Image</div>
            </div>
            {
                awardRecordList.map((record, no) => <div className='table-row'>
                <div className='noth-cell'>
                    <div className={`noth`}>
                    <span>{no + 1}</span>
                    </div>
                </div>
                <div className='user-cell'>
                    <Image className='item-avatar' src={record.avatar || DEFAULT_AVATAR} width={30} height={30} radius={"50%"} />
                    <div className='item-name'>
                        {record.nickName ? `${record.nickName}` : 'unknown'}
                    </div>
                </div>
                <div className='score-cell'>
                    {formatMilliseconds(record.score)}
                </div>
                <div className='seed-cell'>
                    {record.randomSeed}
                </div>
                <div className='gmt-cell' >
                    <Image className='item-avatar' src={record.scoreImage} 
                        onClick={() => Taro.previewImage({
                            urls: [record.scoreImage]
                          })}
                        width={30} 
                        height={30} 
                        radius={"50%"} 
                    />
                </div>
                </div>)
            }
        </div>
    </div>  
}