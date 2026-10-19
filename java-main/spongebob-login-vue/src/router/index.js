import { createRouter, createWebHistory } from 'vue-router'
import LoginCard from '../components/LoginCard.vue'
import RegisterCard from '../components/RegisterCard.vue'
import HomeView from '../components/HomeView.vue'

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', name: 'login', component: LoginCard },
  { path: '/register', name: 'register', component: RegisterCard },
  // 首页：登录成功后跳转到这里
  // 后续如需强制登录才能访问，可加 meta: { requiresAuth: true } 并在下方 beforeEach 中拦截
  { path: '/home', name: 'home', component: HomeView },
]

export default createRouter({
  history: createWebHistory(),
  routes,
})
