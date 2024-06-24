import Taro, { useRouter } from '@tarojs/taro'
import { useEffect, useState } from 'react'
import classnames from "classnames"
import { Image, Swipe, Button } from "@nutui/nutui-react-taro"
import { TriangleDown, TriangleUp, CheckDisabled, Checked, CheckNormal } from "@nutui/icons-react-taro"
import { formatMilliseconds, getIsAdmin } from '../../utils'
import EmptyContent from '../../components/EmptyContent'
import cloneDeep from 'lodash.clonedeep'
import "./awardrecord.less"

const DEFAULT_AVATAR = "https://img.alicdn.com/imgextra/i3/O1CN01Hso8lx1rexUYpctvl_!!6000000005657-2-tps-48-48.png"

interface RouterParams {
    activityId?: string
}

export default function LotteryRecord() {
    const router = useRouter<any>();
    const [awardRecordList, setAwardRecordList] = useState<any[]>([]);
    const [isAdmin, setisAdmin] = useState(false)
    const [sortItem, setSortItem] = useState('score')
    const [sortRule, setSortRule] = useState('desc')

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

    const sortDataSource = (sortItem: 'score' | 'randomSeed', sort: 'desc' | 'asc') => {
        const dataSource = cloneDeep(awardRecordList)
        const recordList = dataSource.sort((a, b) => {
            if (sortRule === 'asc') {
              return a[sortItem] - b[sortItem];
            } else {
              return b[sortItem] - a[sortItem];
            }
          });
        setAwardRecordList(recordList)
        setSortItem(sortItem)
        setSortRule(sort)
    }

    const handleScore = async (flag: boolean) => {
        if (!isAdmin) return
        const { params } = router as { params: RouterParams };
        const { activityId = '' } = params;
        Taro.showModal({
            title: '提示',
            content: `确定${flag ? '给予TA': '剥夺TA的'}Ta抽奖机会吗？`,
            success: async (e) => {
                if (e.confirm) {
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
            }
        })
    }

    return <div className='award-record-container'>
        <div className='table-container'>
            <div className='table-th'>
            <div className='th-no'>排名</div>
            <div className='th-user'>Driver</div>
            <div className='th-score' onClick={() => sortDataSource('score', sortRule == 'asc' ? 'desc' : 'asc' )}>
                成绩<span className='sort-icon'>
                    <TriangleUp color={(sortItem == 'score' && sortRule == 'asc') ? 'red' : ''} />
                    <TriangleDown color={(sortItem == 'score' && sortRule == 'desc') ? 'red' : ''} /></span>
            </div>
            <div className='th-seed' onClick={() => sortDataSource('randomSeed', sortRule == 'asc' ? 'desc' : 'asc' )}>
                Seed<span className='sort-icon'>
                    <TriangleUp color={(sortItem == 'randomSeed' && sortRule == 'asc') ? 'red' : ''} />
                    <TriangleDown color={(sortItem == 'randomSeed' && sortRule == 'desc') ? 'red' : ''} />
                </span>
            </div>
            <div className='th-gmt'>成绩照片</div>
        </div>
            {
                !awardRecordList.length && <EmptyContent text="还没有人报名" />
            }
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
                            {/* <Checkbox checked={record.isPass} disabled={record.isPass !== undefined && !record.isPass} /> */}
                            {
                                // !record.isPass ? <CheckDisabled color='#8c8c8c' /> : <Checked color='#00bc14' />
                                record.isPass == undefined ?  
                                    <CheckNormal /> : 
                                    (!record.isPass ? <CheckDisabled color='#8c8c8c' /> : <Checked color='#00bc14' />) 
                            }
                            <span className='no-i'>{no + 1}</span>
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