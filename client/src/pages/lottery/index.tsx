import Taro, { useRouter, useShareAppMessage } from '@tarojs/taro'
import { useEffect, useRef, useState } from 'react'
import { NoticeBar } from "@nutui/nutui-react-taro"
import LuckyWheel from '@lucky-canvas/taro/react/LuckyWheel'
import { getActivityInfo, getActivityJoinInfo } from '../../api/activity'
import { getAwardInfo, getRemainTimes } from '../../api/award'
import { ACTIVITY_STATUS } from '../../constants/activity'
import debounce from "lodash.debounce"
import "./lottery.less"

interface RouterParams {
    activityId?: string
}

const DRAW_BTN_IMAGE = 'https://img.alicdn.com/imgextra/i3/O1CN01Bk2rxs1jC5cQfZDAg_!!6000000004511-2-tps-235-266.png';
const DRAW_BTN_IMAGE_DISABLE= 'https://img2.imgtp.com/2024/05/26/rktUvZTE.png';
const PRIZE_BLOCK_BG_1 = "#fee7e9"; // #fee7e9 #fbd6d5
const PRIZE_BLOCK_BG_2 = "#ffffff";
const PRIZE_BLOCK_TEXT = "#993f36"; // #ed6252

const prizeListConfig = {
    blocks: [{
        padding: '66rpx',
        imgs: [{
            // src: 'https://img.alicdn.com/imgextra/i1/O1CN01xy8Kkj1KmOc2bqD6G_!!6000000001206-2-tps-700-700.png',
            src: 'https://img.alicdn.com/imgextra/i3/O1CN0119Bgfg28W7KfUKjrU_!!6000000007939-2-tps-1284-1284.png',
            // src: 'https://img.alicdn.com/imgextra/i1/O1CN01fpSNp91RszdUgogCX_!!6000000002168-2-tps-690-690.png',
            width: '100%',
            height: '100%',
            rotate: true,
            // top: '4'
        }]
    }],
}
let _awardList = [];
let _drawing = false

export default function Lottery() {
    const router = useRouter<any>();
    const [activityInfo, setActivityInfo] = useState<any>({});
    const [prizeList, setPrizeList] = useState<any[]>([]);
    const [activityId, setActivityId] = useState<string>('');
    const [fetchingData, setFetching] = useState<boolean>(false)
    const [joinInfo, setJoinInfo] = useState<any>();
    const [drawing, setDrawing] = useState<boolean>(false);
    const [awardRecordList, setAwardRecordList] = useState<any[]>([]);
    const [drawBtn, setDrawBtn] = useState<any>([{
        radius: '45%',
        imgs: [{
            src: DRAW_BTN_IMAGE,
            width: '100%',
            top: '-130%'
        }]
    }]);
    const [remainTimes, setRemainTimes] = useState<number>(1)

    const lotteryRef = useRef<any>();

    useShareAppMessage((res) => {
        return {
            title: activityInfo.activityName,
            path: '/pages/lottery/index?activityId='+activityId
        };
    });

    useEffect(() => {
        const { params } = router as { params: RouterParams };
        const { activityId = '' } = params;
        setActivityId(activityId)
        getPrizeList()
        getJoinInfo();
    },[]);

    const getJoinInfo = async () => {
        const { params } = router as { params: RouterParams };
        const { activityId = '' } = params;
        await Taro.initCloud();
        const joinInfo = await getActivityJoinInfo(activityId)
        console.log({joinInfo})
        setJoinInfo(joinInfo)
    }


    const getPrizeList = async () => {
        Taro.showLoading()
        const { params } = router as { params: RouterParams };
        const { activityId = '' } = params;
        if (!activityId) {
            Taro.showModal({
                content: '没有该活动'
            })
            return
        }
        setFetching(true)
        setActivityId(activityId)
        await Taro.initCloud();
        const activityInfo = await getActivityInfo(activityId)
        if (activityInfo.status > ACTIVITY_STATUS.ENDED) {
            Taro.showModal({
                content: '活动已结束'
            });
            setFetching(false)
            return
        }
        
        setActivityInfo(activityInfo);
        const awardList = await getAwardInfo(activityId)
        awardList.forEach((el: any, index: number) => {
            el.fonts = [{
                text: el.prizeName, 
                fontSize: el.prizeImage ? "12px" : "22px", 
                fontColor: PRIZE_BLOCK_TEXT,
                top: '8%' 
            },{
                text: `剩余:${el.totalNum - el.offerNum}`,
                fontSize: "10px", 
                fontColor: "#aaa", 
                top: '92%' 
            }];
            el.background = index % 2 ? PRIZE_BLOCK_BG_1 : PRIZE_BLOCK_BG_2

            if (el.prizeImage) {
                el.imgs =  [{
                    src: el.prizeImage || 'https://img.alicdn.com/imgextra/i4/O1CN01w3w5w61edVFEfnnWL_!!6000000003894-2-tps-92-92.png',
                    width: '30%',
                    top: '30%'
                }]
            }
            
        });
        if (awardList.length) {
            awardList.push({
                prizeName: "谢谢参与",
                prizeId: 0,
                fonts: [{
                    text: "谢谢参与", 
                    fontSize: "14px", 
                    fontColor: PRIZE_BLOCK_TEXT, 
                    top: '10%' 
                }],
                background: (awardList.length) % 2 ? PRIZE_BLOCK_BG_1 : PRIZE_BLOCK_BG_2,
                imgs: [{
                    src: 'https://img.alicdn.com/imgextra/i4/O1CN01w3w5w61edVFEfnnWL_!!6000000003894-2-tps-92-92.png',
                    width: '33%',
                    top: '40%'
                }]
            });
            setTimeout(() => {
                getLotteryRecord()
            }, 300);
        }
        setPrizeList(awardList)
        _awardList = awardList;
        Taro.hideLoading()
        setFetching(false)
    }

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

    const doDraw = debounce(async () => {
        try {
            // lotteryRef?.current.play()
            // setTimeout(() => {
            //     lotteryRef.current.stop(1)
            // }, 1500);
            // return
            if (_drawing) {
                console.log('current is drawing ~~~ !')
                return null;
            } 
            if (!joinInfo) {
                Taro.showToast({
                    icon: 'none',
                    title: "先报名参加活动哦~"
                })
                return
            } else if (!joinInfo.isPass){
                Taro.showToast({
                    icon: 'none',
                    title: "您没有获得抽奖资格~"
                })
                return
            }

            if (activityInfo.status === ACTIVITY_STATUS.NOT_BEGIN) {
                Taro.showToast({
                    icon: 'none',
                    title: "活动还未开始"
                })
                return
            }
            // const _remainTimes = await getRemainTimes(activityId)
            if (remainTimes <=0 ) {
                Taro.showToast({
                    icon: 'none',
                    title: "您已经抽过了~"
                })
                return
            }
            _drawing = true;
            setDrawing(true)
            Taro.showLoading()
            const res: any = await Taro.shareCloud.callFunction({
                name: 'lucky_lottery',
                data: {
                    activityId: activityId,
                }
            });
            console.log('中奖结果： ',res.result)
            Taro.hideLoading();
            const { result } = res;
            if (result.prize) {
                lotteryRef?.current.play()
                // 调用抽奖组件的play方法开始游戏
                // console.log(_awardList, result.prize.prizeId)
                let awardIndex = _awardList.findIndex((el: any) => el._id === result.prize.prizeId)
                // console.log({awardIndex})
                setTimeout(() => {
                    lotteryRef.current.stop(awardIndex);
                }, 3000);
                setRemainTimes(remainTimes-1)
            } else {
                if (result?.errorMsg){
                    Taro.showModal({
                        content: result.errorMsg
                    }); 
                    setDrawing(false)
                    _drawing = false;
                    // lotteryRef.current.stop(_awardList.length - 1)
                } else {
                    lotteryRef?.current.play()
                    setTimeout(() => {
                        lotteryRef.current.stop(_awardList.length - 1)
                    }, 1500);
                    setRemainTimes(remainTimes-1)
                }
            } 
        } catch (error) {
            Taro.showModal({
                content: error.errMsg
            });
            _drawing = false;
        } finally {
            Taro.hideLoading()
        }
    }, 300)


    const bookActivity = () => {
        Taro.navigateTo({
            url: `/pages/bookLottery/index?activityId=${activityId}`
        })
    }

    return <div className='lottery-wrapper'>
        <div className='bg'>
        <div className='sologan'></div>
        {
            !!prizeList.length ? 
            <div className='wheel-container'>
                <LuckyWheel
                    ref={lotteryRef}
                    width='360px'
                    height='360px'
                    blocks={prizeListConfig.blocks}
                    prizes={prizeList}
                    defaultConfig={{
                        stopRange: 0.8
                    }}
                    buttons={drawBtn}
                    onStart={doDraw}
                    onEnd={prize => { // 抽奖结束会触发end回调
                        console.log({prize})
                        Taro.showModal({
                            title: prize.id ? '恭喜中奖' : '很遗憾没中奖',
                            content: prize.id ? '获得奖品:'+prize.prizeName : "下次必中!"
                        });
                        if (prize.id) {
                            getLotteryRecord()
                        }
                        _drawing = false
                        setDrawing(false)
                    }}
                />
                <div className='drawer-bottom'>
                    {/* <div className='draw-times-tip'>抽奖次数：{remainTimes}次</div> */}
                    <div className='draw-times-tip'>{joinInfo ? (joinInfo.isPass ? "获得抽奖资格": "很遗憾没有获得抽奖资格"): ("报名通过") }</div>
                </div>
                
                {
                    activityInfo.status >= ACTIVITY_STATUS.NOT_BEGIN && 
                    <NoticeBar className='record-notice' direction="vertical"
                        leftIcon={null}
                        list={awardRecordList.map((e: any) => `${e.unionId}抽中了奖品：${e.prizeName}`)}
                        speed={10}
                        duration={1000}
                        height={30}
                        onClick={(e) => {
                            Taro.navigateTo({url: "/pages/lotteryRecord/index?activityId="+activityId})
                        }}
                        closeable={false} 
                    />
                }
             </div>
            :(fetchingData ? null : <div className='empty-tip'>
                {activityInfo?.status >= ACTIVITY_STATUS.ENDED ? "活动已结束" : "敬请期待哦~"}
            </div>)
        }
        {
            activityInfo.status === ACTIVITY_STATUS.NOT_BEGIN && !joinInfo && 
            <div className='join-activity-btn' onClick={bookActivity}>报名抽奖</div>
        }
        {
            joinInfo &&
            <div className='join-activity-btn' onClick={() => Taro.navigateTo({url: "/pages/activityJoin/index?activityId="+activityId})}>报名记录</div>
        }
        {
            !!awardRecordList.length && <span className='record-link' onClick={() => Taro.navigateTo({url: "/pages/lotteryRecord/index?activityId="+activityId})}>中奖记录》</span>
        }
        {
            !!activityInfo?.rules?.length &&
            <div className='award-rules-container'>
                <h2>抽奖规则</h2>
                <ul>
                    {
                        activityInfo?.rules?.map((el: any) => <li className='rule-item'>
                            {el}
                        </li>)
                    }
                </ul>
            </div>
        }
        </div>
    </div>
}