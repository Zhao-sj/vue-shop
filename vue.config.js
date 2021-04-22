// webpack 自定义配置文件
module.exports = {
    chainWebpack: config => {
        // 生产环境下修改入口文件 发布模式
        config.when(process.env.NODE_ENV == 'production', config => {
            // 将默然入口文件清空在添加自定义入口文件
            config.entry('app').clear().add('./src/main-production.js')

            // 使用 externals 节点配置跳过打包项并在全局window中去查找对应的对象
            config.set('externals', {
                vue: 'Vue',
                'vue-router': 'VueRouter',
                axios: 'axios',
                lodash: '_',
                echarts: 'echarts',
                nprogress: 'NProgress',
                'vue-quill-editor': 'VueQuillEditor'
            })

            // 首页自订制 添加自定义属性判断是否为发布模式
            config.plugin('html').tap(args => {
                args[0].isProduction = true
                return args
            })
        })
    }
}