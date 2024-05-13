
module.exports = {
  chainWebpack: (config) => {
    config.plugin('define').tap((definitions) => {
      Object.assign(definitions[0], {
        __VUE_OPTIONS_API__: 'true',
        __VUE_PROD_DEVTOOLS__: 'false',
        __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: 'false'
      })
      return definitions
    })
  },
  lintOnSave: false,
  productionSourceMap: false,
  lintOnSave: false,
  productionSourceMap: false,
  publicPath: process.env.VUE_APP_PBPATH,
  //更改页面title
  chainWebpack: (config) => {
    config.plugin('define').tap((definitions) => {
      Object.assign(definitions[0], {
        __VUE_OPTIONS_API__: 'true',
        __VUE_PROD_DEVTOOLS__: 'false',
        __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: 'false'
      })
      return definitions
    })
  },
  // chainWebpack: (config) => {
  //   const oneOfsMap = config.module.rule('scss').oneOfs.store
  //   oneOfsMap.forEach((item) => {
  //     item
  //       .use('sass-resources-loader')
  //       .loader('sass-resources-loader')
  //       .options({
  //         resources: './src/theme/common.scss' //相对路径
  //       })
  //       .end()
  //   })
  // },
  configureWebpack: (config) => {
    const plugins = [
      // new webpack.DefinePlugin({
      //   __VUE_OPTIONS_API__: 'true',
      //   __VUE_PROD_DEVTOOLS__: 'false',
      //   __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: 'false'
      // })
    ]
    // plugins.push(new NodePolyfillPlugin())
  },
  //开发环境代理    
  devServer: {
    historyApiFallback:{
      index:'/index.html'
    },
    // open: process.env.NODE_ENV !== "production",
    // host: 'localhost',
    client: {  
      overlay:false,
      // logging: 'info', // 日志
      // overlay: { // 编译错误或警告时 是否全屏显示
      //   errors: true,
      //   warnings: false,
      // },
      // progress: true, // 在浏览器百分比显示编译进度
      // 指定 URL 到 web socket 服务器
      // To get protocol/hostname/port from browser
      // webSocketURL: 'auto://0.0.0.0:0/ws',
      // webSocketURL: {
      //   hostname: '0.0.0.0', // 不是真正意义上的IP 是一个本地ip的集合
      //   pathname: '/ws',
      //   port: 0, // 指定port 只在port相同时 会热更新
      // },
    },
    proxy: {  
      "/api": {
        target: 'https://192.168.0.48', //配置访问的服务器地址
        pathRewrite: {
          // "^/api": "",
        }, //用于将请求中的/api替换为空，然后访问地址就能正常访问，若不添加此行配置，那么访问地址就变成了：http://localhost:8080/api/request_url,这样的请求会出现404操作
        changeOrigin: true, //是否开启跨域，用于控制请求头中的host值，默认是true
        secure:false,
      },
    },
  },  
};