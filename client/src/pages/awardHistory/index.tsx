import { useEffect, useState } from 'react'
import Taro from '@tarojs/taro'
import { View } from '@tarojs/components'
import { Grid, Cell, Divider } from "@nutui/nutui-react-taro"
import './my.less'
import { IPrize } from 'src/type'


export default function LotteryRecord() {
  const [list, setList] = useState<any[]>([])

  useEffect(() => {
    getData()
  }, []);

  const getData = async () => {
    try {
      await Taro.showLoading()
      await Taro.initCloud();
      const res = await Taro.shareCloud.callFunction({
        name: 'lucky_get_my_lottery_record'
      });
      const data = res.result.data;
      const aggregatedRecords = data.reduce((acc, record) => {
        // 检查是否存在对应活动 ID 的对象
        if (acc[record.activityId]) {
          // 存在，则将当前记录添加到该对象的 list 中
          acc[record.activityId].list.push({ prizeName: record.prizeName });
        } else {
          // 不存在，则创建一个新对象，并将当前记录作为第一个元素的 list
          acc[record.activityId] = {
            activityName: record.activityName,
            list: [{ prizeName: record.prizeName }]
          };
        }
        return acc;
      }, {});
      
      // 将对象中的值提取出来，得到最终的聚合结果（数组）
      const aggregatedRecordsArray = Object.values(aggregatedRecords);
      console.log(aggregatedRecordsArray)
      setList(aggregatedRecordsArray)
    } catch (error) {
      Taro.showModal({
        title: "加载失败请重试",
        content: JSON.stringify(error)
      }) 
    } finally {
      Taro.hideLoading()
    }
  }


  return (
    <View className='mine-container'>
      {
        list.map((el: any) => <View>
          <Divider contentPosition="left" >{el.activityName}</Divider>  
          {
            el.list.map((prize: IPrize) => <Cell title={prize.prizeName}></Cell> )
          }
          
        </View>
        )
      }
    </View>
  )
}