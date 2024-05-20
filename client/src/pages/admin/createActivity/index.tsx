import { useEffect, useState } from 'react'
import Taro, { useRouter } from '@tarojs/taro'
import { View } from '@tarojs/components'
import { Button, Form, DatePicker, Image, Input, Divider } from "@nutui/nutui-react-taro"
import { Edit, Comment, List, Flag, Coupon, Notice, ArrowRight } from '@nutui/icons-react-taro'
import CustomNoticeBar from '../../../components/NoticeBar'
// import './my.less'

interface RouterParams {
  activityId?: string
}

export default function Mine() {
  const [openId, setOpenId] = useState<string>('')
  const [unionId, setUnionId] = useState<string>('')
  const [activityId, setActivityId] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [avatar, setAvatar] = useState<string>("");
  const [avatarFileId, setAvatarFileId] = useState<string>("");
  const [activityInfo, setActivityInfo] = useState<any>(null)

  const router = useRouter<any>();
  const [form] = Form.useForm()

  useEffect(() => {
    const { params } = router as { params: RouterParams };
    const { activityId = '' } = params;
    if (activityId) {
      setActivityId(activityId)
      getActivityInfo()
    }

  }, []);

  const getActivityInfo = async () => {
    const res = await Taro.shareCloud.callFunction({
      name: 'lucky_get_activityInfo',
      data: {
        activityId
      }
    });
    console.log('getActivityInfo --> ',res)
    setActivityInfo(res)
  }


  const submitForm = async (values) => {
    setLoading(true);
    const bindRes = await Taro.shareCloud.callFunction({
      name: 'lucky_create_activity',
      data: {
        ...values,
      }
    });
    if (bindRes) {
      Taro.showModal({
        title: "创建成功",
        content: "现在去配置奖品吧~",
        success: () => {
          Taro.navigateTo({
            url: '/pages/admin/awardConfig/index'
          })
        }
      })
    }
    setLoading(false)
  }

  return (
    <View className='mine-container'>
      {/* <CustomNoticeBar closeable={true} text="如发现成绩作弊取消抽奖资格" /> */}
      <Form 
        form={form}
        onFinish={(values) => {
          submitForm(values) 
        }}
        footer={
          <Button loading={loading} formType="submit" block type="primary">
            提交绑定
          </Button>
        }
      >
        <Form.Item
          label="活动名称"
          name="activityName"
        >
          <Input
            className="nut-input-text"
            placeholder="比如300排量组，600排量组，随意起"
            type="text"
          />
        </Form.Item>
        <Form.Item
          required
          label=""
          name="beginTime"
          rules={[
            { required: true, message: '请输入活动开始时间' },
          ]}
        >
          <DatePicker 
            defaultValue={new Date()}
            visible={showBeginTime}
            type="datetime"
            // onClose={() => setShow(false)}
            onConfirm={(options, values) => confirm(values, options)}
          />
        </Form.Item>
        <Divider />
        
      </Form>
    </View>
  )
}