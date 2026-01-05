// 导入Vue Router核心功能
import { createRouter, createWebHistory } from 'vue-router'
// 导入页面组件
import Home from '../views/Home.vue'
import PostDetail from '../views/PostDetail.vue'
import AllPosts from '../views/AllPosts.vue'
import makePost from '../views/makePost.vue'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import Profile from '../views/Profile.vue'
import About from '../views/About.vue'

// 定义路由配置数组
const routes = [
  // 首页路由
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  // 所有文章列表页路由
  {
    path: '/posts',
    name: 'AllPosts',
    component: AllPosts
  },
  // 文章详情页路由：动态参数 :id
  {
    path: '/post/:id',
    name: 'PostDetail',
    component: PostDetail,
    props: true // 将路由参数作为组件props传递
  },
  // 文章发布页路由
  {
    path: '/make-post',
    name: 'makePost',
    component: makePost
  },
  // 文章编辑页路由：动态参数 :id
  {
    path: '/edit-post/:id',
    name: 'EditPost',
    component: makePost,
    props: true
  },
  // 登录页路由
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  // 注册页路由
  {
    path: '/register',
    name: 'Register',
    component: Register
  },
  // 个人中心路由
  {
    path: '/profile',
    name: 'Profile',
    component: Profile
  },
  // 关于页路由
  {
    path: '/about',
    name: 'About',
    component: About
  }
]

// 创建路由实例
const router = createRouter({
  history: createWebHistory(), // 使用HTML5 History模式
  routes // 路由配置
})

// 导出路由实例
export default router
