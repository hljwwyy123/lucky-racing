import { useEffect, useState } from 'react'
import Taro, { useRouter } from '@tarojs/taro'
import { View } from '@tarojs/components'
import { Button, Form, DatePicker, TextArea, Switch, Image, Input } from "@nutui/nutui-react-taro"
import { Edit, Upload } from '@nutui/icons-react-taro'
import { getActivityInfo } from "../../../api/activity"
import { UUID } from '../../../utils'
import './index.less'

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
  const [localImage, setlocalImage] = useState<string>()

  const router = useRouter<any>();
  const [form] = Form.useForm()
  const nowTime = new Date();

  useEffect(() => {
    const { params } = router as { params: RouterParams };
    const { activityId = '' } = params;
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
    form.setFieldsValue({ beginTime: activityInfo.beginTime})
    form.setFieldsValue({ endTime: activityInfo.endTime})
    form.setFieldsValue({ activityName: activityInfo.activityName})
    form.setFieldsValue({ needReview: activityInfo.needReview})
    form.setFieldsValue({ bannerImage: activityInfo.bannerImage })
    setlocalImage(activityInfo.bannerImage)
    setNeedReview(activityInfo.needReview)

    Taro.hideLoading()
  }


  const submitForm = async (values) => {
    setLoading(true);
    const payload = {...values}
    if (activityId) {
      payload.id = activityId;
    }
    const createRes = await Taro.shareCloud.callFunction({
      name: 'lucky_create_activity',
      data: {
        ...payload,
      }
    });
    const { id } = createRes.result; 
    if (createRes) {
      Taro.showModal({
        title: "创建成功",
        content: "现在去配置奖品吧~",
        success: () => {
          Taro.navigateTo({
            url: '/pages/admin/awardConfig/index?activityId='+id
          })
        },
        fail: () => {
          Taro.navigateBack()
        }
      })
    }
    setLoading(false)
  }

  const onUploadImage = async (localFilePath: string) => {
    Taro.showLoading()
    setlocalImage(localFilePath)
    await Taro.initCloud()
    const result: any = await Taro.shareCloud.uploadFile({
        cloudPath: `lucky/banner/${UUID()}.jpg`, // 以用户的 OpenID 作为存储路径
        filePath: localFilePath,
    });
    Taro.hideLoading();
    form.setFieldsValue({bannerImage: result.fileID})
  }

  return (
    <View className='create-activity-container'>
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
            maxLength={11}
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
            label="活动banner"
            name="bannerImage"
        >
            {
                <div style={{ width: 197 }} className='local-image-preview' onClick={() => {
                    Taro.chooseImage({
                        count: 1, // 默认9
                        sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
                        sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有，在H5浏览器端支持使用 `user` 和 `environment`分别指定为前后摄像头
                        success: async function (res) {
                            // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
                            const localFilePath = res.tempFilePaths[0];
                            onUploadImage(localFilePath)
                        }
                    })
                }} >
                {
                localImage ? <div>
                    <Image src={localImage} width={197} height={80} />
                    <Edit onClick={() => setlocalImage('')} className='edit-icon' />
                    </div>
                    :
                <div style={{ width: 197, height: 80 }} className='image-placeholder' >
                    <Upload size={16} />
                    <span>banner图片 790 * 320</span>
                </div>
                }
            </div>
            }
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
        <Form.Item
          required
          label="抽奖规则"
          name="rules"
          rules={[
            { required: true, message: '请输入抽奖规则' },
          ]}
        >
          <TextArea
            placeholder="抽奖规则"
          />
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

