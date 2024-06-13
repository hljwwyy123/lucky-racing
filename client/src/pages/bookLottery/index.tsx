import { useEffect, useState } from 'react'
import Taro, { useRouter } from '@tarojs/taro'
import { View } from '@tarojs/components'
import { Button, Form, DatePicker, Switch, Image, Input, Divider } from "@nutui/nutui-react-taro"
import { getActivityInfo } from "../../api/activity"

interface RouterParams {
    activityId?: string
  }

export default function CreateActivity() {
  const [activityId, setActivityId] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [activityInfo, setActivityInfo] = useState<any>(null)

  const router = useRouter<any>();
  const [form] = Form.useForm()
  const nowTime = new Date();

  useEffect(() => {
    const { params } = router as { params: RouterParams };
    const { activityId = '' } = params;
    console.log({activityId})
    if (activityId) {
      setActivityId(activityId)
      getData(activityId)
    }

  }, []);

  const getData = async (id: string) => {
    Taro.showLoading()
    await Taro.initCloud();
    const activityInfo: any = await getActivityInfo(id)
    setActivityInfo(activityInfo);
    Taro.hideLoading()
  }

  const submitForm = async (values) => {
    setLoading(true);
    const payload = {...values}
    if (activityId) {
      payload.id = activityId;
    }
    const createRes = await Taro.shareCloud.callFunction({
      name: 'lucky_book_activity',
      data: {
        ...payload,
      }
    });
    if (createRes.result) {
      Taro.showModal({
        title: "预约成功",
        success: () => {
          Taro.navigateTo({
            url: '/pages/index/index'
          })
        },
        fail: () => {
          Taro.navigateBack()
        }
      })
    }
    setLoading(false)
  }
  return (
    <View className='mine-container'>
        <Form 
            form={form}
            onFinish={(values) => {
            submitForm(values) 
            }}
            footer={
            <Button loading={loading} formType="submit" block type="primary">
                {!!activityId ? '修改活动信息' : '创建活动'}
            </Button>
            }
        >
        <Form.Item
          label="活动名称"
          required
          name="activityName"
          rules={[
            { required: true, message: '请输入活动名称' },
          ]}
        >
          <Input
            className="nut-input-text"
            placeholder="比如300排量组，600排量组，随意起"
            maxLength={11}
            type="text"
          />
        </Form.Item>
        


      </Form>
    </View>
  )

} 