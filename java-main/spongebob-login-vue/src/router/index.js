import { createRouter, createWebHistory } from 'vue-router'
import LoginCard from '../components/LoginCard.vue'
import RegisterCard from '../components/RegisterCard.vue'
import HomeView from '../components/HomeView.vue'
import JellyfishField from '../components/JellyfishField.vue'
import KrustyKrab from '../components/KrustyKrab.vue'
import PineappleHouse from '../components/PineappleHouse.vue'
import AboutBikiniBottom from '../components/AboutBikiniBottom.vue'

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', name: 'login', component: LoginCard },
  { path: '/register', name: 'register', component: RegisterCard },
  // 首页：登录成功后跳转到这里
  // 后续如需强制登录才能访问，可加 meta: { requiresAuth: true } 并在下方 beforeEach 中拦截
  { path: '/home', name: 'home', component: HomeView },
  // 水母田：水母捕捞图鉴
  { path: '/jellyfish', name: 'jellyfish', component: JellyfishField },
  // 蟹堡王：菜单 + 购物车
  { path: '/krusty-krab', name: 'krustyKrab', component: KrustyKrab },
  // 菠萝屋：个人中心
  { path: '/pineapple', name: 'pineapple', component: PineappleHouse },
  // 关于比奇堡：小镇介绍
  { path: '/about', name: 'about', component: AboutBikiniBottom },
]

export default createRouter({
  history: createWebHistory(),
  routes,
})
