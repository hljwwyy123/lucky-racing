export default {
  pages: [
    'pages/index/index',
    'pages/my/index',
    'pages/activityRegistry/index',
    'pages/awardHistory/index',
    'pages/admin/activityList/index',
    'pages/admin/approve/index',
    'pages/admin/awardConfig/index',
    'pages/admin/createActivity/index',
    'pages/lottery/index',
    'pages/activityJoin/index',
    'pages/lotteryRecord/index',
    'pages/bookLottery/index',
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: 'WeChat',
    navigationBarTextStyle: 'black'
  },
  cloud: true,
  tabBar: {
    // custom: true,
    color: '#333',
    selectedColor: '#f53d4d',
    // backgroundColor: '#1f232d',
    list: [
      {
        pagePath: 'pages/index/index',
        text: '抽奖',
        iconPath: 'assets/images/rank.png',
        selectedIconPath: 'assets/images/rank-active.png',
      },
      {
        pagePath: 'pages/my/index',
        text: '我的',
        iconPath: 'assets/images/my.png',
        selectedIconPath: 'assets/images/my-active.png',
      },
    ]
  }
}
