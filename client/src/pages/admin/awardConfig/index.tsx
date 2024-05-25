import { useEffect, useState } from 'react'
import Taro, { useRouter } from '@tarojs/taro'
import { View } from '@tarojs/components'
import { Drag, FixedNav, Table, Button, Form, InputNumber, Range, Image, Popup, Switch, Input, Divider } from "@nutui/nutui-react-taro"
import { Plus, Edit } from '@nutui/icons-react-taro'
import { getActivityInfo } from '../../../api/activity'
import { deleteAward, getAwardInfo, updateAwardConfig } from "../../../api/award"
import { UUID, getUnionId } from "../../../utils"
import { IPrize, TableColumnProps } from "../../../type"
import EmptyContent from '../../../components/EmptyContent'
import { ACTIVITY_STATUS_MAP } from '../../../constants/activity'
import './awardconfig.less'

interface RouterParams {
  activityId?: string
}

let ACTIVITY_ID = '';

export default function AwardConfig() {
  const [activityId, setActivityId] = useState<string>('')
  const [activityInfo, setActivityInfo] = useState<any>({});
  const [prizeList, setPrizeList] = useState<any[]>([]);
  const [localImage, setlocalImage] = useState<string>()
  const [showPopup, setShowPopup] = useState<boolean>(false);
  const [saveLoaing, setSaveLoaing] = useState<boolean>(false);
  const [isEditSpecial, setIsEditSpecial] = useState<boolean>(false);
  const [editPrizeInfo, setEditPrizeInfo]  = useState<IPrize>();

  const [columnsStickLeft] = useState<Array<IPrize | TableColumnProps>>([
    {
      title: '奖品名称',
      key: 'prizeName',
      align: 'center',
      fixed: 'left',
      width: 80,
      render: (rowData: IPrize, rowIndex: number) => {
        return <div className='activity-name-cell' onClick={() => onEditPrize(rowData)}>{rowData.prizeName}<Edit /></div>
      }
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
      key: 'totalNum',
      width: 40,
    },
    {
      title: '剩余数量',
      key: 'remainNum',
      width: 40,
      render: (rowData: IPrize, rowIndex: number) => {
        return rowData.totalNum - rowData.offerNum
      }
    },
    {
      title: '中奖概率',
      key: 'probability',
      width: 40,
      render: (rowData: IPrize, rowIndex: number) => {
        return <div >{rowData.probability}%</div>
      }
    },
    {
      title: '是否特殊奖池',
      key: 'isSpecial',
      width: 50,
      render: (rowData: IPrize, rowIndex: number) => {
        return <Switch key={rowData._id} checked={rowData.isSpecial} />
      }
    },
    {
      title: '操作',
      key: 'action',
      render: (rowData: IPrize, rowIndex: number) => {
        return <Button type='danger' onClick={() => onDeleteAward(rowData._id + '')}  >删除</Button>
      }
    },
  ]);

  const [form] = Form.useForm()
  const router = useRouter<any>();

  useEffect(() => {
    const { params } = router as { params: RouterParams };
    const { activityId = '' } = params;
    ACTIVITY_ID = activityId;
    if (activityId) {
      setActivityId(activityId)
      getUnionId();
      getPrizeList()
    } else {
      Taro.showModal({
        content: '没有找到活动'
      })
    }
  }, []);

  const getPrizeList = async () => {
    Taro.showLoading()
    await Taro.initCloud();
    const activityInfo = await getActivityInfo(ACTIVITY_ID)
    setActivityInfo(activityInfo);
    const awardList = await getAwardInfo(ACTIVITY_ID)
    setPrizeList(awardList)
    Taro.hideLoading()
  }


  const onEditPrize = (_prizeInfo: IPrize | null = null) => {
    try {
      if (_prizeInfo) {
        setShowPopup(true)
        setTimeout(() => {
          form.setFieldsValue({
            id: _prizeInfo._id,
            prizeName: _prizeInfo.prizeName,
            totalNum: _prizeInfo.totalNum,
            probability: _prizeInfo.probability,
          })
        }, 100);

        setEditPrizeInfo({..._prizeInfo})
        setIsEditSpecial(!!_prizeInfo?.isSpecial)
        setlocalImage(_prizeInfo.prizeImage)
      } else {
        const prizeuuid = UUID();
        const prizeInfo:IPrize = {
          key: prizeuuid,
          prizeName: '',
          prizeImage: '',
          totalNum: 1,
          offerNum: 0,
          probability: 0.01,
          isSpecial: false,
        }
        setEditPrizeInfo(prizeInfo)
      }
      setShowPopup(true)
    } catch (error) {
      console.error(error)
    }
  }

  const onChoosePrizeImage = async (localFilePath: string) => {
    if (!editPrizeInfo) return
    Taro.showLoading()
    setlocalImage(localFilePath)
    console.log({localFilePath})
    const result: any = await Taro.shareCloud.uploadFile({
      cloudPath: `lucky/${activityId}/${editPrizeInfo.key}.jpg`, // 以用户的 OpenID 作为存储路径
      filePath: localFilePath,
    });
    editPrizeInfo.prizeImage = result.fileID
    Taro.hideLoading()
    setEditPrizeInfo(editPrizeInfo);
  }

  const onConfirmAddPrize = async (values) => {
    setSaveLoaing(true)
    const payload = {...values, isSpecial: isEditSpecial}
    if (editPrizeInfo?.prizeImage) {
      if (editPrizeInfo?.prizeImage.includes('cloud:')) {
        payload.prizeImage = editPrizeInfo?.prizeImage
      }
    }
    if (!payload.id) {
      payload.offerNum = 0;
    }
    await submitAwardConfig(payload);
    setShowPopup(false)
    setSaveLoaing(false)
    getPrizeList()
  } 

  const submitAwardConfig = async (payload: any) => {
    try {
      const res = await updateAwardConfig(activityId, payload);
      if (res) {
        Taro.showToast({
          title: '更新成功'
        })
      }
    } catch (error) {
      Taro.showModal({
        content: JSON.stringify(error)
      })
    }
  }

  const onDeleteAward = async (id: any) => {
    try {
      Taro.showModal({
        title: "确定删除吗",
        success: async () => {
          const res: any = await deleteAward(id);
          if (res) {
            Taro.showToast({
              title: '删除成功'
            });
            getPrizeList()
          }
        }
      })
    } catch (error) {
      Taro.showModal({
        content: JSON.stringify(error)
      })
    }
  }

  return (
    <View className='award-container'>
      <Divider contentPosition="left">{activityInfo?.activityName}<span className={`activity-status status-${activityInfo?.status}`}>{ACTIVITY_STATUS_MAP[`${activityInfo?.status}`]}</span></Divider>
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
          form.resetFields()
          setlocalImage('')
          setIsEditSpecial(false) 
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
                <div style={{ width: 98 }} className='local-image-preview'onClick={() => {
                  Taro.chooseImage({
                    count: 1, // 默认9
                    sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
                    sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有，在H5浏览器端支持使用 `user` 和 `environment`分别指定为前后摄像头
                    success: async function (res) {
                      // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
                      const localFilePath = res.tempFilePaths[0];
                      onChoosePrizeImage(localFilePath)
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
                    <span>默认</span>
                  </div>
                }
              </div>
            }
          </Form.Item>
          <Form.Item
            label="奖品数量"
            required
            name="totalNum"
            rules={[
              { required: true, message: '请输入奖品数量' },
            ]}
          >
             {/* <ConfigProvider theme={{nutuiInputnumberButtonWidth: '30px',
                  nutuiInputnumberButtonHeight: '30px',
                  nutuiInputnumberButtonBorderRadius: '2px',
                  nutuiInputnumberButtonBackgroundColor: `#f4f4f4`,
                  nutuiInputnumberInputHeight: '30px',
                  nutuiInputnumberInputMargin: '0 2px'}}> */}
                <InputNumber  
                  className="nut-input-text prize-num-input"
                  defaultValue={1} 
                  min={editPrizeInfo ? (editPrizeInfo.offerNum) : 1}
                />
             {/* </ConfigProvider> */}
          </Form.Item>
          <Form.Item
            label="中奖概率"
            required
            name="probability"
          >
            <Range max={100} currentDescription={(value) => `${value}%`} min={0} />
          </Form.Item>
          <Form.Item
            label="进特殊奖池"
            name="isSpecial"
          >
            <Switch checked={isEditSpecial} onChange={(v) => {
              setIsEditSpecial(v)
            }} />
          </Form.Item>
        </Form>
      </Popup>
    </View>
  )
}