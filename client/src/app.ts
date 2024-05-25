import { Component, PropsWithChildren } from 'react'
import Taro from '@tarojs/taro'
import { getTaroCloud, initCloud } from './utils'
import './app.less'

class App extends Component<PropsWithChildren>  {
  
  async componentDidMount  () {
    // this.cloud = null;
    if (process.env.TARO_ENV === 'weapp') {
      console.log('initCloud >>> ')
      Taro.initCloud = getTaroCloud
      await initCloud()
    }
  }

  componentDidShow () {}

  componentDidHide () {}

  // this.props.children 是将要会渲染的页面
  render () {
    return this.props.children
  }
}

export default App
