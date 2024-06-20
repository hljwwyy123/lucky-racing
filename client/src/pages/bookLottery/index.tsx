import { useEffect, useState } from 'react'
import Taro, { useRouter } from '@tarojs/taro'
import { View } from '@tarojs/components'
import { Button, Picker, Form, Uploader, InputNumber, Switch, Image, Input, Divider } from "@nutui/nutui-react-taro"
import { Edit, Upload } from "@nutui/icons-react-taro"
import { getActivityInfo, getActivityJoinInfo } from "../../api/activity"
import { toCode, decodeMillseconds, formatMilliseconds, getOpenIdAndUnion } from "../../utils"
import { initDatasource }  from "./constants"
import "./book.less"
interface RouterParams {
    activityId?: string
}

export default function CreateActivity() {
    const [activityId, setActivityId] = useState<string>('')
    const [activityInfo, setActivityInfo] = useState<any>(null)
    const [avatar, setAvatar] = useState<string>("");
    const [localImage, setlocalImage] = useState<string>()
    const [loading, setLoading] = useState(false)
    const [scoreDatasource, setScoreDatasource] = useState<any>()
    const [showScorePicker, setShowScorePicker] = useState(false); 
    const [avatarFileId, setAvatarFileId] = useState<string>("");
    const [openId, setOpenId] = useState<string>("");
    const [unionId, setUnionId] = useState<string>("");
    const [joinInfo, setJoinInfo] = useState<any>();
    const [randomSeed, setRandomSeed] = useState<string>('')
    const [fished, setFished] = useState<boolean>(false)

    const router = useRouter<any>();
    const [form] = Form.useForm()
    const nowTime = new Date();

    useEffect(() => {
        const { params } = router as { params: RouterParams };
        const { activityId = '' } = params;
        if (!activityId) {
            Taro.showToast({
                icon: "error",
                title: "没有该活动信息"
            })
        } else {
            setActivityId(activityId)
            getJoinInfo(activityId)
        }
        getUserOpenId()
        genertSeed()
        
        const data = initDatasource()
        setScoreDatasource(data)

        getMyBestScore();
    }, []);

    const getMyBestScore = async () => {
        Taro.showLoading()
        await Taro.initCloud();
        const res: any = await Taro.shareCloud.callFunction({
          name: 'find_my_bestscore',
        });
        if (res.result?.data) {
          const { data } = res.result;
          if (data.record) {
              form.setFieldsValue({score: formatMilliseconds(data.record.single_score)})
          }
        }
        Taro.hideLoading()
      }

    const getJoinInfo = async (_activityId: string) => {
        await Taro.initCloud();
        const joinInfo = await getActivityJoinInfo(_activityId || activityId)
        setJoinInfo(joinInfo)
    }

    const getUserOpenId = async () => {
        const {openId, unionId} = await getOpenIdAndUnion();
        console.log({openId, unionId})
        setOpenId(openId)
        setUnionId(unionId)
    }

    const genertSeed = (range = 1000) => {
        let seed: string | number = ~~(Math.random() * range);
        if (!seed) {
            genertSeed()
            return
        }
        seed = toCode(seed+ '');
        setFished(true)
        setRandomSeed(seed);
        form.setFieldsValue({randomSeed: seed})
    }

    const uploadAvatar = async (e) => {
        const tempFilePath = e.detail.avatarUrl
        setAvatar(e.detail.avatarUrl)
        // 调用云函数上传文件
        try {
            await Taro.initCloud();
            const result = await Taro.shareCloud.uploadFile({
                cloudPath: `${openId}/lucky/avatar.jpg`, // 以用户的 OpenID 作为存储路径
                filePath: tempFilePath,
            });
            
            console.log('上传成功', result.fileID);
            setAvatarFileId(result.fileID)
        } catch (error) {
          console.error('上传失败', error);
        }
      }
    
    const validateAvatar = () => {
        return !!avatarFileId
    }

    const onUploadScoreImage = async (localFilePath: string) => {
        Taro.showLoading()
        setlocalImage(localFilePath)
        const result: any = await Taro.shareCloud.uploadFile({
            cloudPath: `lucky/${activityId}/${unionId}.jpg`, // 以用户的 OpenID 作为存储路径
            filePath: localFilePath,
        });
        console.log({localFilePath, fileId: result.fileID})
        Taro.hideLoading();
        form.setFieldsValue({scoreImage: result.fileID})
      }


    const submitForm = async (values) => {
        setLoading(true);
        const payload = { ...values }
        if (activityId) {
            payload.id = activityId;
        }
        if (payload.score) {
            payload.score = decodeMillseconds(payload.score)
        }
        payload.avatar = avatarFileId
        console.log(payload)
        if (!payload.localImage) {
            Taro.showToast({
                icon: "error",
                title: "请上传成绩证明图片"
            })
            return
        }
        const createRes = await Taro.shareCloud.callFunction({
            name: 'lucky_approve_submit',
            data: {
                payload,
                activityId
            }
        });
        if (createRes.result) {
            Taro.showModal({
                title: "预约成功",
                success: () => {
                    Taro.navigateBack()
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
                        {!!joinInfo ? '修改报名信息' : '报名'}
                    </Button>
                }
            >
                <Form.Item
                    required
                    label="头像"
                    name="avatar"
                    className='avatar-form-item'
                    rules={[
                        { validator: validateAvatar, message: '请上传头像' }
                    ]}
                >
                    <Button className='avatar-choose-btn' openType='chooseAvatar' onChooseAvatar={uploadAvatar}>
                        <Image error="点击上传" className='avatar' src={avatar} width={80} height={80} radius={"50%"} />
                        {!avatar && <div className='upload-tip'>点击上传</div>}
                        {avatar && <Edit className='edit-icon' />}
                    </Button>
                </Form.Item>
                <Form.Item
                    required
                    label="昵称"
                    name="nickName"
                    rules={[
                        { required: true, message: '请输入昵称' },
                    ]}
                >
                    <Input
                        className="nut-input-text"
                        placeholder="请输入用户名，用于在排行榜展示"
                        type="nickname"
                    />
                </Form.Item>
                <Form.Item
                    required
                    label="圈速成绩"
                    name="score"
                    onClick={() => setShowScorePicker(true)}
                    rules={[
                        { required: true, message: '请输入圈速成绩' },
                    ]}
                >
                    <Input
                        className="nut-input-text"
                        readOnly={true}
                        placeholder="成绩"
                        type="text"
                    />
                </Form.Item>
                <Form.Item
                    required
                    label="成绩图片"
                    name="scoreImage"
                >
                    {
                        <div style={{ width: 98 }} className='local-image-preview'onClick={() => {
                            Taro.chooseImage({
                                count: 1, // 默认9
                                sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
                                sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有，在H5浏览器端支持使用 `user` 和 `environment`分别指定为前后摄像头
                                success: async function (res) {
                                    // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
                                    const localFilePath = res.tempFilePaths[0];
                                    onUploadScoreImage(localFilePath)
                                }
                            })
                        }} >
                        { 
                        localImage ? <div>
                            <Image src={localImage} width={98} height={98} />
                            <Edit onClick={() => setlocalImage('')} className='edit-icon' />
                            </div>
                            :
                        <div style={{ width: 98, height: 98 }} className='image-placeholder' >
                            <Upload />
                            <span>成绩图片</span>
                        </div>
                        }
                    </div>
                    }
                </Form.Item>
                <Form.Item
                    required
                    label="抽奖种子"
                    name="randomSeed"
                    rules={[
                        { required: true},
                    ]}
                >
                    <Input className="nut-input-text" readOnly /> 
                </Form.Item>
            </Form>
            <Picker 
                options={scoreDatasource}
                visible={showScorePicker}
                onConfirm={(selectOptions, selectValue) => {
                    setShowScorePicker(false);
                    const formatScore = selectValue[0]+ '\''+ selectValue[1] +'.'+selectValue[2]
                    form.setFieldsValue({ score: formatScore })
                }}
                onCancel={() => setShowScorePicker(false)}
            />
        </View>
    )

} 