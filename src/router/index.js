import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

// 使用路由懒加载
const routes = [
  {
    path: '/home',
    component: () => import (/* webpackChunkName: "home" */ '../views/Home.vue'),
    redirect: '/welcome',
    children: [
      { path: '/welcome', component: () => import (/* webpackChunkName: "home" */ '../components/Welcome.vue') },
      { path: '/users', component: () => import (/* webpackChunkName: "user" */ '../components/user/Users.vue') },
      { path: '/rights', component: () => import (/* webpackChunkName: "user" */ '../components/competence/Rights.vue') },
      { path: '/roles', component: () => import (/* webpackChunkName: "user" */ '../components/competence/Roles.vue') },
      { path: '/categories', component: () => import (/* webpackChunkName: "goods" */ '../components/goods/Categories.vue') },
      { path: '/params', component: () => import (/* webpackChunkName: "goods" */ '../components/goods/Params.vue') },
      { path: '/goods', component: () => import (/* webpackChunkName: "goods" */ '../components/goods/List.vue') },
      { path: '/addgoods', component: () => import (/* webpackChunkName: "goods" */ '../components/goods/AddGoods.vue') },
      { path: '/orders', component: () => import (/* webpackChunkName: "order" */ '../components/order/Order.vue') },
      { path: '/reports', component: () => import (/* webpackChunkName: "order" */ '../components/report/Report.vue') }
    ]
  },
  { path: '/login', component: () => import (/* webpackChunkName: "login" */ '../components/Login.vue') }
]

const router = new VueRouter({
  routes
})

// 添加导航守卫 实现路由拦截
router.beforeEach((to, from, next) => {
  if (to.path == '/login') return next()
  const token = window.sessionStorage.getItem('token')
  token ? next() : next('/login')
})

export default router
