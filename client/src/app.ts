import { Component, PropsWithChildren } from 'react'
import Taro, { Config, Cloud } from '@tarojs/taro'

import './app.less'

class App extends Component<PropsWithChildren>  {
  
  async componentDidMount  () {
    // this.cloud = null;
    if (process.env.TARO_ENV === 'weapp') {
      await this.initCloud()
    }
  }

  initCloud = async () => {
    const cloud = new Taro.cloud.Cloud({
      resourceAppid: 'wx98786041f7a0b60d',
      resourceEnv: 'racing-7gxq1capbac7539a'
    });
    await cloud.init();
    Taro.shareCloud = cloud
  }

  componentDidShow () {}

  componentDidHide () {}

  // this.props.children 是将要会渲染的页面
  render () {
    return this.props.children
  }
}

export default App
