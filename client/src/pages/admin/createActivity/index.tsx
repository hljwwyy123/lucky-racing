import { useEffect, useState } from 'react'
import Taro, { useRouter } from '@tarojs/taro'
import { View } from '@tarojs/components'
import { Button, Form, DatePicker, Switch, Image, Input, Divider } from "@nutui/nutui-react-taro"
import { Edit, Comment, List, Flag, Coupon, Notice, ArrowRight } from '@nutui/icons-react-taro'
import CustomNoticeBar from '../../../components/NoticeBar'
import { sleep } from '../../../utils'
// import './my.less'

interface RouterParams {
  activityId?: string
}

export default function CreateActivity() {
  const [openId, setOpenId] = useState<string>('')
  const [unionId, setUnionId] = useState<string>('')
  const [activityId, setActivityId] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [avatar, setAvatar] = useState<string>("");
  const [avatarFileId, setAvatarFileId] = useState<string>("");
  const [activityInfo, setActivityInfo] = useState<any>(null)
  const [showBeginTime, setShowBeginTime] = useState(false)
  const [showEndTime, setShowEndTime] = useState(false)
  const [needReview, setNeedReview] = useState(false)

  const router = useRouter<any>();
  const [form] = Form.useForm()
  const nowTime = new Date();

  useEffect(() => {
    const { params } = router as { params: RouterParams };
    const { activityId = '' } = params;
    console.log({activityId})
    if (activityId) {
      setActivityId(activityId)
      getActivityInfo(activityId)
    }

  }, []);

  const getActivityInfo = async (id: string) => {
    Taro.showLoading()
    await Taro.getCloud();
    const activityInfo: any = await getActivityInfo(id)
    // if (result.data && result.data.length) {
      // const activityInfo = result.data[0];
    console.log({activityInfo})
    setActivityInfo(activityInfo);
    form.setFieldsValue({ beginTime: activityInfo.beginTime})
    form.setFieldsValue({ endTime: activityInfo.endTime})
    form.setFieldsValue({ activityName: activityInfo.activityName})
    form.setFieldsValue({ needReview: activityInfo.needReview})
    setNeedReview(activityInfo.needReview)

    Taro.hideLoading()
  }


  const submitForm = async (values) => {
    setLoading(true);
    const payload = {...values}
    if (activityId) {
      payload.id = activityId;
    }
    const bindRes = await Taro.shareCloud.callFunction({
      name: 'lucky_create_activity',
      data: {
        ...payload,
      }
    });
    const { id } = bindRes.result; 
    if (bindRes) {
      Taro.showModal({
        title: "创建成功",
        content: "现在去配置奖品吧~",
        confirmText: '去配置',
        cancelText: '稍后再说',
        success: () => {
          Taro.navigateTo({
            url: '/pages/admin/awardConfig/index?activityId='+id
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
            type="text"
          />
        </Form.Item>
        <Form.Item
          required
          label="开始时间"
          name="beginTime"
          onClick={() => setShowBeginTime(true)}
          rules={[
            { required: true, message: '请输入活动开始时间' },
          ]}
        >
          <Input
            className="nut-input-text"
            placeholder="活动开始时间"
            type="text"
          />
        </Form.Item>
        <Form.Item
          required
          label="结束时间"
          name="endTime"
          onClick={() => setShowEndTime(true)}
          rules={[
            { required: true, message: '请输入结束开始时间' },
          ]}
        >
          <Input
            className="nut-input-text"
            placeholder="活动结束时间"
            type="text"
          />
        </Form.Item>
        <Form.Item
          required
          label="是否需要审核"
          name="needReview"
        >
          <Switch onChange={(v) => {
            setNeedReview(v)
          }} checked={needReview} />
        </Form.Item>
        <DatePicker 
          defaultValue={nowTime}
          visible={showBeginTime}
          type="datetime"
          onClose={() => setShowBeginTime(false)}
          onConfirm={(options, values) => {
            const date = values.slice(0, 3).join('-')
            const time = values.slice(3).join(':') + ':00'
            form.setFieldsValue({ beginTime: `${date} ${time}`})
          }}
          
        />
        <DatePicker
          defaultValue={nowTime}
          visible={showEndTime}
          type="datetime"
          onClose={() => setShowEndTime(false)}
          onConfirm={(options, values) => {
            const date = values.slice(0, 3).join('-')
            const time = values.slice(3).join(':') + ':00'
            form.setFieldsValue({ endTime: `${date} ${time}`})
          }}
        />
      </Form>
    </View>
  )
}