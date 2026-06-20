export default defineAppConfig({
  pages: [
    'pages/index/index',
    'pages/works/index',
    'pages/workDetail/index',
    'pages/about/index',
  ],
  window: {
    backgroundTextStyle: 'dark',
    navigationBarBackgroundColor: '#0A0A0F',
    navigationBarTitleText: 'AI Creative Studio',
    navigationBarTextStyle: 'white',
    backgroundColor: '#0A0A0F',
  },
  tabBar: {
    color: '#6B7280',
    selectedColor: '#7C3AED',
    backgroundColor: '#12121A',
    borderStyle: 'black',
    list: [
      {
        pagePath: 'pages/index/index',
        text: '首页',
        iconPath: 'assets/icons/home.png',
        selectedIconPath: 'assets/icons/home-active.png',
      },
      {
        pagePath: 'pages/works/index',
        text: '作品',
        iconPath: 'assets/icons/works.png',
        selectedIconPath: 'assets/icons/works-active.png',
      },
      {
        pagePath: 'pages/about/index',
        text: '关于',
        iconPath: 'assets/icons/about.png',
        selectedIconPath: 'assets/icons/about-active.png',
      },
    ],
  },
})