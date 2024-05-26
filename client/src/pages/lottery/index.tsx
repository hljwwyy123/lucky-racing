import Taro, { useRouter } from '@tarojs/taro'
import { useEffect, useRef, useState } from 'react'
import LuckyWheel from '@lucky-canvas/taro/react/LuckyWheel'
import { getActivityInfo } from '../../api/activity'
import { getAwardInfo } from '../../api/award'
import { ACTIVITY_STATUS } from '../../constants/activity'
import debounce from "lodash.debounce"
import "./lottery.less"

interface RouterParams {
    activityId?: string
}

const prizeListConfig = {
    blocks: [{
        padding: '64rpx',
        imgs: [{
            src: 'https://img2.imgtp.com/2024/05/26/tEyas91e.png',
            width: '100%',
            height: '100%',
            rotate: true
        }]
    }],
    buttons: [
      {
        radius: '45%',
        imgs: [{
            src: 'https://img2.imgtp.com/2024/05/26/twmfKZ16.png',
            width: '100%',
            top: '-130%'
        }]
      },
    ],
  }
let _awardList = [];

export default function Lottery() {
    const router = useRouter<any>();
    const [activityInfo, setActivityInfo] = useState<any>({});
    const [prizeList, setPrizeList] = useState<any[]>([]);
    const [activityId, setActivityId] = useState<string>('');
    const [drawing, setDrawing] = useState<boolean>(false)
    const lotteryRef = useRef<any>();

    useEffect(() => {
        getPrizeList()
    },[]);

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
        setActivityId(activityId)
        await Taro.initCloud();
        const activityInfo = await getActivityInfo(activityId)
        if (activityInfo.status > ACTIVITY_STATUS.CLOSED) {
            Taro.showModal({
                content: '活动已结束'
            });
            return
        }
        setActivityInfo(activityInfo);
        const awardList = await getAwardInfo(activityId)
        awardList.forEach((el: any, index: number) => {
            el.fonts = [{
                text: el.prizeName, 
                fontSize: el.prizeImage ? "12px" : "22px", 
                fontColor: "#ed6252", 
                top: '8%' 
            },{
                text: `剩余:${el.totalNum - el.offerNum}`,
                fontSize: "10px", 
                fontColor: "#aaa", 
                top: '92%' 
            }];
            el.background = index % 2 ? '#fbd6d5' : '#fff'
            if (el.prizeImage) {
                el.imgs =  [{
                    src: el.prizeImage || 'https://img2.imgtp.com/2024/05/26/MI4S1Kxe.png',
                    width: '30%',
                    top: '30%'
                }]
            }
            
        });
        awardList.push({
            prizeName: "谢谢参与",
            prizeId: 0,
            fonts: [{
                text: "谢谢参与", 
                fontSize: "14px", 
                fontColor: "#aaa", 
                top: '10%' 
            }],
            background: (awardList.length) % 2 ? '#fbd6d5' : '#fff',
            imgs: [{
                src: 'https://img2.imgtp.com/2024/05/26/MI4S1Kxe.png',
                width: '33%',
                top: '40%'
            }]
        });
        setPrizeList(awardList)
        _awardList = awardList;
        Taro.hideLoading()
    }

    const doDraw = debounce(async () => {
        try {
            // if (drawing) {
            //     console.log({drawing})
            //     return
            // }
            setDrawing(true)
            if (activityInfo.status === ACTIVITY_STATUS.NOT_BEGIN) {
                Taro.showToast({
                    title: "活动还未开始"
                })
                return
            }
            Taro.showLoading()
            const res: any = await Taro.shareCloud.callFunction({
                name: 'lucky_lottery',
                data: {
                    activityId: activityId,
                }
            });
            console.log('抽奖： ',res)
            Taro.hideLoading();
            const { result } = res;
            if (result.prize) {
                lotteryRef?.current.play()
                // 调用抽奖组件的play方法开始游戏
                console.log(_awardList, result.prize.prizeId)
                let awardIndex = _awardList.findIndex((el: any) => el._id === result.prize.prizeId)
                console.log({awardIndex})
                setTimeout(() => {
                    lotteryRef.current.stop(awardIndex);
                }, 3000);
            } else {
                if (result?.errorMsg){
                    Taro.showModal({
                        content: result.errorMsg
                    }); 
                    // lotteryRef.current.stop(_awardList.length - 1)
                } else {
                    lotteryRef?.current.play()
                    setTimeout(() => {
                        lotteryRef.current.stop(_awardList.length - 1)
                    }, 1500);
                }
            } 
        } catch (error) {
            Taro.showModal({
                // content: JSON.stringify(error)
                content: error.errMsg
            })
        } finally {
            Taro.hideLoading()
            setDrawing(false)
        }
    }, 300)

    const getLotteryRecord = () => {

    }

    const bookActivity = () => {
        Taro.showToast({
            title: "预约活动"
        })
    }

    return <div className='lottery-wrapper'>
        <div className='bg'>
        <div className='sologan'></div>
        {
            !!prizeList.length && 
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
                    buttons={prizeListConfig.buttons}
                    onStart={doDraw}
                    onEnd={prize => { // 抽奖结束会触发end回调
                        console.log({prize})
                        Taro.showModal({
                            title: prize.id ? '恭喜中奖' : '很遗憾没中奖',
                            content: prize.id ? '获得奖品:'+prize.prizeName : "好运++下次必中!"
                        })
                    }}
                    />
                <div className='drawer-bottom'></div>
                {
                    activityInfo.status === ACTIVITY_STATUS.NOT_BEGIN &&
                    <div className='activity-btn' onClick={bookActivity}>报名抽奖</div>
                }
            </div>
        }
        </div>
    </div>
}