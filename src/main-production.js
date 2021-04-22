import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

Vue.config.productionTip = false

// 引入公共样式
import './assets/common.css'

// 引入字体图标库
import '../src/assets/font/iconfont.css'

// 引入nprogress进度条
import NProgress from 'nprogress'

// 引入axios
import axios from 'axios'
axios.defaults.baseURL = 'api/private/v1'
// 添加请求拦截
axios.interceptors.request.use(request => {
  // 发起请求之前开始展示进度条
  NProgress.start()
  // 添加token令牌
  request.headers.Authorization = window.sessionStorage.getItem('token')
  return request
})

// 响应拦截
axios.interceptors.response.use(config => {
  // 进度条展示完毕
  NProgress.done()
  return config
})
Vue.prototype.$axios = axios

// 引入第三方树形表格ui插件
import TreeTable from 'vue-table-with-tree-grid'
Vue.use(TreeTable);

// 全局注册时间格式化过滤器
Vue.filter('dateFormat', function(originDate) {
  // originDate 时间毫秒数
  const date = new Date(originDate);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1 + '').padStart(2, '0');
  const day = (date.getDate() + '').padStart(2, '0');

  const hour = (date.getHours() + '').padStart(2, '0');
  const minute = (date.getMinutes() + '').padStart(2, '0');
  const seconds = (date.getSeconds() + '').padStart(2, '0');
  return `${year}-${month}-${day} ${hour}:${minute}:${seconds}`;
});

// 引入第三方富文本编辑器
import VueQuillEditor from 'vue-quill-editor'
Vue.use(VueQuillEditor)

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
