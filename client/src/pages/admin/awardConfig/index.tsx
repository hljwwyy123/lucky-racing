import { useEffect, useState } from 'react'
import Taro, { useRouter } from '@tarojs/taro'
import { View } from '@tarojs/components'
import { Drag, FixedNav, Table, Button, Form, InputNumber, Range, Image, Popup, Switch, Input, Divider } from "@nutui/nutui-react-taro"
import { Plus } from '@nutui/icons-react-taro'
import { getActivityInfo } from '../../../api/activity'
import { getAwardInfo, updateAwardConfig } from "../../../api/award"
import { UUID, getUnionId } from "../../../utils"
import { IPrize, TableColumnProps } from "../../../type"
import EmptyContent from '../../../components/EmptyContent'
import { ACTIVITY_STATUS_MAP } from '../../../constants/activity'
import './awardconfig.less'

interface RouterParams {
  activityId?: string
}


export default function AwardConfig() {
  const [openId, setOpenId] = useState<string>('')
  const [activityId, setActivityId] = useState<string>('')
  const [loading, setLoading] = useState(false);
  const [activityInfo, setActivityInfo] = useState<any>({});
  const [prizeList, setPrizeList] = useState<any[]>([]);
  const [showPopup, setShowPopup] = useState<boolean>(false);
  const [saveLoaing, setSaveLoaing] = useState<boolean>(false);
  const [editPrizeInfo, setEditPrizeInfo]  = useState<IPrize>();

  const [columnsStickLeft] = useState<Array<IPrize | TableColumnProps>>([
    {
      title: '奖品名称',
      key: 'prizeName',
      align: 'center',
      fixed: 'left',
      width: 100,
    },
    {
      title: '奖品图片',
      key: 'prizeImage',
      render: (rowData: IPrize, rowIndex: number) => {
        return <Image src={rowData.prizeImage} width={40} height={40} />
      }
    },
    {
      title: '奖品数量',
      key: 'prizeNum',
    },
    {
      title: '中奖概率',
      key: 'probability',
    },
    {
      title: '是否特殊奖池',
      key: 'isSpecial',
      render: (rowData: IPrize, rowIndex: number) => {
        return <Switch checked={rowData.isSpecial} disabled />
      }
    },
  ]);

  const [form] = Form.useForm()
  const router = useRouter<any>();

  useEffect(() => {
    const { params } = router as { params: RouterParams };
    const { activityId = '' } = params;
    setActivityId(activityId)
    getUnionId();
    getData(activityId)
  }, []);

  const getData = async (activityId: string) => {
    Taro.showLoading()
    await Taro.getCloud();
    const activityInfo = await getActivityInfo(activityId)
    console.log({activityInfo})
    setActivityInfo(activityInfo);
    if (activityInfo.prizeId) {
      const awardList = await getAwardInfo(activityId)
      setPrizeList(awardList)
    }
    Taro.hideLoading()
  }


  const onEditPrize = (_prizeInfo: IPrize | null = null) => {
    if (_prizeInfo) {
      setEditPrizeInfo(_prizeInfo)
    } else {
      const prizeId = UUID();
      const prizeInfo:IPrize = {
        key: prizeId,
        prizeId: prizeId,
        prizeName: '',
        prizeImage: '',
        prizeNum: 1,
        probability: 0.1,
        isSpecial: false,
      }
      setEditPrizeInfo(prizeInfo)
    }
    
    setShowPopup(true)
  }

  const onChoosePrizeImage = async (filePath: string) => {
    if (editPrizeInfo) {
      editPrizeInfo.prizeImage = filePath;
      setEditPrizeInfo({...editPrizeInfo});
      console.log('cloudPath', `lucky/${activityId}/${editPrizeInfo.prizeId}.jpg`)
      const result = await Taro.shareCloud.uploadFile({
        cloudPath: `lucky/${activityId}/${editPrizeInfo.prizeId}.jpg`, // 以用户的 OpenID 作为存储路径
        filePath: filePath,
      });
      console.log(result)
    }
    // form.setFieldsValue({prizeImage: filePath})
  }

  const onConfirmAddPrize = (values) => {
    const prizeInfo = values;
    prizeInfo.prizeImage = editPrizeInfo?.prizeImage;
    prizeInfo.id = editPrizeInfo?.prizeId;
    prizeList.push(prizeInfo);
    console.log({prizeInfo})
    setPrizeList([...prizeList])
    setShowPopup(false)
  } 

  const submitAwardConfig = async () => {
    try {
      const res = await updateAwardConfig(activityId, editPrizeInfo);
      if (res) {
        Taro.showToast({
          title: '更新奖品信息成功'
        })
      }
    } catch (error) {
      Taro.showModal({
        content: JSON.stringify(error)
      })
    }
  }

  return (
    <View className='award-container'>
      <div className='info-section'>
        <p>
          <span>{activityInfo.activityName}</span>
          <span className={`activity-status status-${activityInfo.status}`}>{ACTIVITY_STATUS_MAP[`${activityInfo.status}`]}</span>
        </p>
      </div>
      <Divider contentPosition="left">奖品配置</Divider>
      <Table columns={columnsStickLeft} data={prizeList} noData={<EmptyContent />}></Table>
      {/* <Button className='add-prize-btn' onClick={() => onEditPrize()} icon={<Plus />}>添加奖品</Button> */}
      {
        !showPopup &&
        <Drag direction="y" style={{ right: '0px', bottom: '240px' }}>
          <FixedNav
            list={[]}
            content={<View className='custom-fixed-nav'><Plus size={20} color="#fff" />添加奖品</View>}
            visible={false}
            onClick={() => onEditPrize()}
            onChange={() => {}}
          />
        </Drag>
      }
      <Popup 
        visible={showPopup} 
        position="bottom"
        lockScroll
        onClose={() => {
          setShowPopup(false)
        }}
        >
        <Form 
          form={form}
          onFinish={(values) => {
            onConfirmAddPrize(values) 
          }}
          footer={
            <Button loading={saveLoaing} formType="submit" block type="primary">保存</Button>
          }
        >
          <Form.Item
            label="奖品名称"
            required
            name="prizeName"
            rules={[
              { required: true, message: '请输入奖品名称' },
            ]}
          >
            <Input
              className="nut-input-text"
              type="text"
            />
          </Form.Item>
          <Form.Item
            label="奖品图片"
            name="prizeImage"
          >
            {
              editPrizeInfo?.prizeImage ? 
              <Image width="80" height="80" src={editPrizeInfo?.prizeImage} />
              : 
              <div style={{ width: 98 }} onClick={() => {
                Taro.chooseImage({
                  count: 1, // 默认9
                  sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
                  sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有，在H5浏览器端支持使用 `user` 和 `environment`分别指定为前后摄像头
                  success: async function (res) {
                    // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
                    const filePath = res.tempFilePaths[0];
                    onChoosePrizeImage(filePath)
                  }
                })
              }} >
                <Image width="80" height="80" />
                <View style={{width: 80, marginTop: 5, textAlign: 'center', color: '#999'}}>默认</View>
              </div>
            }
          </Form.Item>
          <Form.Item
            label="奖品数量"
            required
            name="prizeNum"
            rules={[
              { required: true, message: '请输入奖品数量' },
            ]}
          >
            <InputNumber  
              className="nut-input-text"
              defaultValue={1} 
            />
          </Form.Item>
          <Form.Item
            label="中奖概率"
            required
            name="probability"
          >
            <Range max={100} min={0} />
          </Form.Item>
          <Form.Item
            label="是否是特殊奖池"
            name="isSpecial"
          >
            <Switch />
          </Form.Item>
        </Form>
      </Popup>
    </View>
  )
}