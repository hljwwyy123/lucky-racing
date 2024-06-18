import Taro, { useRouter } from '@tarojs/taro'
import { useEffect, useState } from 'react'
import classnames from "classnames"
import { Image, Swipe, Button, Checkbox } from "@nutui/nutui-react-taro"
import { Checklist } from '@nutui/icons-react-taro'
import { formatMilliseconds, getIsAdmin } from '../../utils'
import "./awardrecord.less"

const DEFAULT_AVATAR = "https://img.alicdn.com/imgextra/i3/O1CN01Hso8lx1rexUYpctvl_!!6000000005657-2-tps-48-48.png"

interface RouterParams {
    activityId?: string
}

export default function LotteryRecord() {
    const router = useRouter<any>();
    const [awardRecordList, setAwardRecordList] = useState<any[]>([]);
    const [isAdmin, setisAdmin] = useState(false)

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
        getIsAdmin().then(res => setisAdmin(res))
        Taro.hideLoading()
    }

    const handleScore = async (flag: boolean) => {
        const { params } = router as { params: RouterParams };
        const { activityId = '' } = params;
        const res = await Taro.shareCloud.callFunction({
            name: 'lucky_update_approve_status',
            data: {
                flag: flag,
                activityId: activityId
            }
        });
        if (res) {
            await getLotteryRecord()
        }
    }

    return <div className='award-record-container'>
        <div className='table-container'>
            <div className='table-th'>
            <div className='th-no'>排名</div>
            <div className='th-user'>Driver</div>
            <div className='th-score'>成绩</div>
            <div className='th-seed'>Seed</div>
            <div className='th-gmt'>成绩照片</div>
            </div>
            {
                awardRecordList.map((record, no) => <Swipe 
                    rightAction={
                        <Button shape="square" type="success" onClick={() => handleScore(true)}>
                            通过
                        </Button>
                    }
                    leftAction={
                        <Button shape="square" type="danger" onClick={() => handleScore(false)}>
                          拒绝
                        </Button>
                      }
                    disabled={!isAdmin}>
                    <div className={classnames('table-row',{'passed': record.isPass !== undefined && record.isPass, 'no-passed': record.isPass !== undefined && !record.isPass, 'no-status': record.isPass == undefined })}>
                        <div className='noth-cell'>
                            <Checkbox checked={record.isPass} disabled={record.isPass !== undefined && !record.isPass} />
                            <span>{no + 1}</span>
                        </div>

                        <div className={classnames('user-cell', {'passed': record.isPass !== undefined && record.isPass, 'no-passed': record.isPass !== undefined && !record.isPass, 'no-status': record.isPass == undefined })} >
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
                </div>
            </Swipe>)
        }
        </div>
    </div>  
}