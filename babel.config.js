// 项目发布阶段需要用到的babel插件
let productionPlugins = []

// 生产环境添加 删除打印 插件
if (process.env.NODE_ENV == 'production') {
  productionPlugins.push('babel-plugin-transform-remove-console')
}

module.exports = {
  presets: [
    '@vue/cli-plugin-babel/preset'
  ],
  plugins: [
    // 使用 babel 插件
    ...productionPlugins,
    '@babel/plugin-syntax-dynamic-import'
  ]
}
