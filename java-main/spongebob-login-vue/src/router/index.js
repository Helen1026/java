import { createRouter, createWebHistory } from 'vue-router'
import LoginCard from '../components/LoginCard.vue'
import RegisterCard from '../components/RegisterCard.vue'
import HomeView from '../components/HomeView.vue'
import JellyfishField from '../components/JellyfishField.vue'
import KrustyKrab from '../components/KrustyKrab.vue'
import PineappleHouse from '../components/PineappleHouse.vue'
import AboutBikiniBottom from '../components/AboutBikiniBottom.vue'
import AdminLogin from '../components/AdminLogin.vue'
import AdminDashboard from '../components/AdminDashboard.vue'

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', name: 'login', component: LoginCard },
  { path: '/register', name: 'register', component: RegisterCard },
  // 首页：登录成功后跳转到这里
  { path: '/home', name: 'home', component: HomeView },
  // 水母田：水母捕捞图鉴
  { path: '/jellyfish', name: 'jellyfish', component: JellyfishField },
  // 蟹堡王：菜单 + 购物车
  { path: '/krusty-krab', name: 'krustyKrab', component: KrustyKrab },
  // 菠萝屋：个人中心
  { path: '/pineapple', name: 'pineapple', component: PineappleHouse },
  // 关于比奇堡：小镇介绍
  { path: '/about', name: 'about', component: AboutBikiniBottom },
  // 后台管理：登录页（仅登录，无注册）
  { path: '/admin/login', name: 'adminLogin', component: AdminLogin },
  // 后台管理系统：管理首页展示的全部数据（条目 + 分类）
  {
    path: '/admin',
    name: 'admin',
    component: AdminDashboard,
    meta: { requiresAdmin: true },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// 后台管理需要已登录（携带有效 token）；未登录则跳转到后台登录页。
// 注意：仅校验本地是否存有 token，真正的鉴权由后端 JWT 拦截器在接口调用时完成。
router.beforeEach((to) => {
  if (to.meta?.requiresAdmin) {
    const token = localStorage.getItem('token')
    if (!token) {
      return { path: '/admin/login', query: { redirect: to.fullPath } }
    }
  }
  return true
})

export default router
