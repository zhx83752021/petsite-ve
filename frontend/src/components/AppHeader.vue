<template>
  <header class="app-header">
    <div class="header-container">
      <!-- Logo -->
      <router-link to="/" class="logo">
        <span class="logo-icon">🐾</span>
        <span class="logo-text">宠物网</span>
      </router-link>

      <!-- 导航菜单 -->
      <nav class="nav-menu">
        <router-link to="/" class="nav-item">
          首页
        </router-link>
        <router-link to="/shop" class="nav-item">
          商城
        </router-link>
        <router-link to="/community" class="nav-item">
          社区
        </router-link>
        <router-link to="/services" class="nav-item">
          服务
        </router-link>
        <router-link to="/wiki" class="nav-item">
          百科
        </router-link>
      </nav>

      <!-- 搜索框 -->
      <div class="search-box">
        <el-input v-model="searchKeyword" placeholder="搜索商品、动态..." :prefix-icon="Search" clearable
          @keyup.enter="handleSearch" />
      </div>

      <!-- 右侧工具栏 -->
      <div class="toolbar">
        <!-- 购物车 -->
        <router-link to="/cart" class="toolbar-item">
          <el-badge :value="cartCount" :hidden="cartCount === 0" :max="99">
            <el-icon :size="20">
              <ShoppingCart />
            </el-icon>
          </el-badge>
        </router-link>

        <!-- 消息 -->
        <div class="toolbar-item" @click="handleNotification">
          <el-badge :value="unreadCount" :hidden="unreadCount === 0" :max="99">
            <el-icon :size="20">
              <Bell />
            </el-icon>
          </el-badge>
        </div>

        <!-- 用户 -->
        <el-dropdown v-if="userStore.isLogin" trigger="click" @command="handleCommand">
          <div class="user-avatar">
            <el-avatar :src="avatarUrl" :size="32">
              {{ userStore.userInfo?.nickname?.charAt(0) || 'U' }}
            </el-avatar>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="profile">
                个人中心
              </el-dropdown-item>
              <el-dropdown-item command="orders">
                我的订单
              </el-dropdown-item>
              <el-dropdown-item command="pets">
                宠物档案
              </el-dropdown-item>
              <el-dropdown-item command="settings">
                账户设置
              </el-dropdown-item>
              <el-dropdown-item divided command="logout">
                退出登录
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>

        <div v-else class="auth-buttons">
          <el-button size="default" @click="openLogin">
            登录
          </el-button>
          <el-button type="primary" size="default" @click="openRegister">
            注册
          </el-button>
        </div>
      </div>
    </div>

    <!-- 登录注册模态窗口 -->
    <AuthModal v-model="showAuthModal" :default-type="authType" />
  </header>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Search, ShoppingCart, Bell } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'
import AuthModal from './AuthModal.vue'
import { getUserAvatar } from '@/config/images'

const router = useRouter()
const userStore = useUserStore()

const searchKeyword = ref('')
const cartCount = ref(0) // TODO: 从store获取
const unreadCount = ref(0) // TODO: 从store获取
const showAuthModal = ref(false)
const authType = ref<'login' | 'register'>('login')

// 计算头像URL
const avatarUrl = computed(() => {
  if (userStore.userInfo?.avatar) {
    return userStore.userInfo.avatar
  }
  // 使用用户ID或用户名生成默认头像
  const seed = userStore.userInfo?.id || userStore.userInfo?.username || 'default'
  return getUserAvatar(seed)
})

// 打开登录窗口
const openLogin = () => {
  authType.value = 'login'
  showAuthModal.value = true
}

// 打开注册窗口
const openRegister = () => {
  authType.value = 'register'
  showAuthModal.value = true
}

// 搜索
const handleSearch = () => {
  if (!searchKeyword.value.trim()) return
  router.push({
    path: '/search',
    query: { keyword: searchKeyword.value }
  })
}

// 通知
const handleNotification = () => {
  ElMessage.info('暂无新消息')
}

// 下拉菜单命令
const handleCommand = (command: string) => {
  switch (command) {
    case 'profile':
      router.push('/user')
      break
    case 'orders':
      router.push('/user/orders')
      break
    case 'pets':
      router.push('/user/pets')
      break
    case 'settings':
      router.push('/user/settings')
      break
    case 'logout':
      userStore.logout()
      ElMessage.success('已退出登录')
      router.push('/')
      break
  }
}
</script>

<style scoped lang="scss">
.app-header {
  position: sticky;
  top: 0;
  z-index: 1000;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.header-container {
  max-width: 1440px;
  margin: 0 auto;
  padding: 0 24px;
  height: 64px;
  display: flex;
  align-items: center;
  gap: 32px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  flex-shrink: 0;

  .logo-icon {
    font-size: 28px;
  }

  .logo-text {
    font-size: 20px;
    font-weight: bold;
    background: linear-gradient(135deg, #ff6b35 0%, #ff8c5a 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
}

.nav-menu {
  display: flex;
  gap: 32px;

  .nav-item {
    color: #333;
    font-size: 16px;
    font-weight: 500;
    text-decoration: none;
    position: relative;
    transition: color 0.3s;

    &:hover {
      color: #ff6b35;
    }

    &.router-link-active {
      color: #ff6b35;

      &::after {
        content: '';
        position: absolute;
        bottom: -8px;
        left: 0;
        right: 0;
        height: 3px;
        background: #ff6b35;
        border-radius: 2px;
      }
    }
  }
}

.search-box {
  flex: 1;
  max-width: 400px;

  :deep(.el-input__wrapper) {
    border-radius: 20px;
    background: #f5f5f5;
    box-shadow: none;

    &:hover,
    &.is-focus {
      background: #fff;
      box-shadow: 0 0 0 1px #ff6b35;
    }
  }
}

.toolbar {
  display: flex;
  align-items: center;
  gap: 20px;

  .toolbar-item {
    cursor: pointer;
    color: #666;
    transition: color 0.3s;

    &:hover {
      color: #ff6b35;
    }
  }

  .user-avatar {
    cursor: pointer;
  }

  .auth-buttons {
    display: flex;
    gap: 12px;
  }
}

// 移动端适配
@media (max-width: 768px) {
  .header-container {
    padding: 0 12px;
    gap: 12px;
  }

  .nav-menu {
    display: none;
  }

  .search-box {
    max-width: none;
  }

  .logo-text {
    display: none;
  }
}
</style>
