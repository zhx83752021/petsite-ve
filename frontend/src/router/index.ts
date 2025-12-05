import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import { ElMessage } from 'element-plus'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue'),
    meta: { title: '首页' },
  },
  {
    path: '/shop',
    name: 'Shop',
    component: () => import('@/views/shop/Index.vue'),
    meta: { title: '商城' },
  },
  {
    path: '/product/:id',
    name: 'ProductDetail',
    component: () => import('@/views/shop/ProductDetail.vue'),
    meta: { title: '商品详情' },
  },
  {
    path: '/cart',
    name: 'Cart',
    component: () => import('@/views/shop/Cart.vue'),
    meta: { title: '购物车', requiresAuth: true },
  },
  {
    path: '/community',
    name: 'Community',
    component: () => import('@/views/community/Index.vue'),
    meta: { title: '社区' },
  },
  {
    path: '/post/:id',
    name: 'PostDetail',
    component: () => import('@/views/community/PostDetail.vue'),
    meta: { title: '动态详情' },
  },
  {
    path: '/user',
    name: 'UserCenter',
    component: () => import('@/views/user/Index.vue'),
    meta: { title: '个人中心', requiresAuth: true },
    redirect: '/user/pets',
    children: [
      {
        path: 'pets',
        name: 'UserPets',
        component: () => import('@/views/user/Pets.vue'),
        meta: { title: '宠物档案' },
      },
      {
        path: 'orders',
        name: 'UserOrders',
        component: () => import('@/views/user/Orders.vue'),
        meta: { title: '我的订单' },
      },
      {
        path: 'posts',
        name: 'UserPosts',
        component: () => import('@/views/user/Posts.vue'),
        meta: { title: '我的动态' },
      },
      {
        path: 'settings',
        name: 'UserSettings',
        component: () => import('@/views/user/Settings.vue'),
        meta: { title: '账户设置' },
      },
    ],
  },
  {
    path: '/services',
    name: 'Services',
    component: () => import('@/views/services/Index.vue'),
    meta: { title: '宠物服务' },
  },
  {
    path: '/services/consultation',
    name: 'Consultation',
    component: () => import('@/views/services/Consultation.vue'),
    meta: { title: '在线问诊' },
  },
  {
    path: '/services/grooming',
    name: 'Grooming',
    component: () => import('@/views/services/Grooming.vue'),
    meta: { title: '宠物美容' },
  },
  {
    path: '/services/boarding',
    name: 'Boarding',
    component: () => import('@/views/services/Boarding.vue'),
    meta: { title: '宠物寄养' },
  },
  {
    path: '/services/adoption',
    name: 'Adoption',
    component: () => import('@/views/services/Adoption.vue'),
    meta: { title: '领养中心' },
  },
  {
    path: '/wiki',
    name: 'Wiki',
    component: () => import('@/views/wiki/Index.vue'),
    meta: { title: '宠物百科' },
  },
  {
    path: '/wiki/:id',
    name: 'WikiDetail',
    component: () => import('@/views/wiki/Detail.vue'),
    meta: { title: '百科详情' },
  },
  // 后台管理系统路由
  {
    path: '/admin/login',
    name: 'AdminLogin',
    component: () => import('@/views/admin/Login.vue'),
    meta: { title: '后台登录' },
  },
  {
    path: '/admin',
    component: () => import('@/views/admin/Layout.vue'),
    meta: { requiresAdminAuth: true },
    redirect: '/admin/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'AdminDashboard',
        component: () => import('@/views/admin/Dashboard.vue'),
        meta: { title: '工作台' },
      },
      {
        path: 'admins',
        name: 'AdminList',
        component: () => import('@/views/admin/admins/Index.vue'),
        meta: { title: '管理员管理' },
      },
      {
        path: 'users',
        name: 'AdminUsers',
        component: () => import('@/views/admin/users/Index.vue'),
        meta: { title: '用户管理' },
      },
      {
        path: 'categories',
        name: 'AdminCategories',
        component: () => import('@/views/admin/categories/Index.vue'),
        meta: { title: '分类管理' },
      },
      {
        path: 'brands',
        name: 'AdminBrands',
        component: () => import('@/views/admin/brands/Index.vue'),
        meta: { title: '品牌管理' },
      },
      {
        path: 'products',
        name: 'AdminProducts',
        component: () => import('@/views/admin/products/Index.vue'),
        meta: { title: '商品管理' },
      },
      {
        path: 'orders',
        name: 'AdminOrders',
        component: () => import('@/views/admin/orders/Index.vue'),
        meta: { title: '订单管理' },
      },
      {
        path: 'posts',
        name: 'AdminPosts',
        component: () => import('@/views/admin/posts/Index.vue'),
        meta: { title: '社区管理' },
      },
      {
        path: 'roles',
        name: 'AdminRoles',
        component: () => import('@/views/admin/roles/Index.vue'),
        meta: { title: '角色管理' },
      },
      {
        path: 'banners',
        name: 'AdminBanners',
        component: () => import('@/views/admin/banners/Index.vue'),
        meta: { title: 'Banner管理' },
      },
      {
        path: 'coupons',
        name: 'AdminCoupons',
        component: () => import('@/views/admin/coupons/Index.vue'),
        meta: { title: '优惠券管理' },
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

// 路由守卫
router.beforeEach((to, _from, next) => {
  // 设置页面标题
  document.title = `${to.meta.title} - 宠物网` || '宠物网'

  // 检查后台管理权限
  if (to.meta.requiresAdminAuth) {
    const adminToken = localStorage.getItem('admin_token')
    if (!adminToken) {
      next({ name: 'AdminLogin', query: { redirect: to.fullPath } })
      return
    }
  }

  // 检查前台用户登录
  if (to.meta.requiresAuth) {
    const token = localStorage.getItem('token')
    if (!token) {
      // 前台需要登录时，跳转到首页并提示
      ElMessage.warning('请先登录')
      next({ name: 'Home' })
      return
    }
  }

  next()
})

export default router
