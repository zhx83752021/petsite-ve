<template>
  <el-container class="admin-layout">
    <!-- 侧边栏 -->
    <el-aside :width="isCollapse ? '64px' : '240px'" class="admin-aside">
      <div class="logo">
        <img v-if="!isCollapse" src="@/assets/logo.svg" alt="宠物网">
        <span v-if="!isCollapse">管理后台</span>
      </div>

      <el-menu :default-active="activeMenu" :collapse="isCollapse" :unique-opened="true" router class="admin-menu">
        <el-menu-item index="/admin">
          <el-icon>
            <HomeFilled />
          </el-icon>
          <template #title>
            工作台
          </template>
        </el-menu-item>

        <el-sub-menu index="system">
          <template #title>
            <el-icon>
              <Setting />
            </el-icon>
            <span>系统管理</span>
          </template>
          <el-menu-item index="/admin/admins">
            <el-icon>
              <UserFilled />
            </el-icon>
            <template #title>
              管理员管理
            </template>
          </el-menu-item>
        </el-sub-menu>

        <el-sub-menu index="user">
          <template #title>
            <el-icon>
              <User />
            </el-icon>
            <span>用户管理</span>
          </template>
          <el-menu-item index="/admin/users">
            <el-icon>
              <User />
            </el-icon>
            <template #title>
              用户列表
            </template>
          </el-menu-item>
        </el-sub-menu>

        <el-sub-menu index="product">
          <template #title>
            <el-icon>
              <ShoppingBag />
            </el-icon>
            <span>商品管理</span>
          </template>
          <el-menu-item index="/admin/categories">
            <el-icon>
              <Menu />
            </el-icon>
            <template #title>
              分类管理
            </template>
          </el-menu-item>
          <el-menu-item index="/admin/brands">
            <el-icon>
              <CollectionTag />
            </el-icon>
            <template #title>
              品牌管理
            </template>
          </el-menu-item>
          <el-menu-item index="/admin/products">
            <el-icon>
              <Goods />
            </el-icon>
            <template #title>
              商品列表
            </template>
          </el-menu-item>
        </el-sub-menu>

        <el-sub-menu index="order">
          <template #title>
            <el-icon>
              <Document />
            </el-icon>
            <span>订单管理</span>
          </template>
          <el-menu-item index="/admin/orders">
            <el-icon>
              <List />
            </el-icon>
            <template #title>
              订单列表
            </template>
          </el-menu-item>
        </el-sub-menu>

        <el-sub-menu index="community">
          <template #title>
            <el-icon>
              <ChatDotSquare />
            </el-icon>
            <span>社区管理</span>
          </template>
          <el-menu-item index="/admin/posts">
            <el-icon>
              <Reading />
            </el-icon>
            <template #title>
              动态管理
            </template>
          </el-menu-item>
        </el-sub-menu>
      </el-menu>
    </el-aside>

    <!-- 主内容区 -->
    <el-container>
      <!-- 顶部导航栏 -->
      <el-header class="admin-header">
        <div class="header-left">
          <el-icon class="collapse-icon" @click="toggleCollapse">
            <Fold v-if="!isCollapse" />
            <Expand v-else />
          </el-icon>
        </div>

        <div class="header-right">
          <el-dropdown @command="handleCommand">
            <div class="admin-info">
              <el-avatar :size="32" :src="adminStore.adminInfo?.avatar">
                {{ adminStore.adminName.charAt(0) }}
              </el-avatar>
              <span class="admin-name">{{ adminStore.adminName }}</span>
              <el-icon>
                <ArrowDown />
              </el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">
                  个人资料
                </el-dropdown-item>
                <el-dropdown-item command="password">
                  修改密码
                </el-dropdown-item>
                <el-dropdown-item divided command="logout">
                  退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <!-- 内容区域 -->
      <el-main class="admin-main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAdminStore } from '@/stores/admin'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  HomeFilled,
  Setting,
  User,
  UserFilled,
  ShoppingBag,
  Menu,
  CollectionTag,
  Goods,
  Document,
  List,
  ChatDotSquare,
  Reading,
  Fold,
  Expand,
  ArrowDown,
} from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const adminStore = useAdminStore()

const isCollapse = ref(false)

const activeMenu = computed(() => route.path)

const toggleCollapse = () => {
  isCollapse.value = !isCollapse.value
}

const handleCommand = async (command: string) => {
  switch (command) {
    case 'profile':
      ElMessage.info('个人资料功能开发中')
      break
    case 'password':
      ElMessage.info('修改密码功能开发中')
      break
    case 'logout':
      try {
        await ElMessageBox.confirm('确定要退出登录吗?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        })
        adminStore.logout()
        router.push('/admin/login')
        ElMessage.success('已退出登录')
      } catch {
        // 用户取消
      }
      break
  }
}
</script>

<style scoped>
.admin-layout {
  height: 100vh;
}

.admin-aside {
  background: #001529;
  transition: width 0.3s;
  overflow-x: hidden;
}

.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: white;
  font-size: 18px;
  font-weight: bold;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.logo img {
  height: 32px;
}

.admin-menu {
  border-right: none;
  background: #001529;
}

:deep(.el-menu-item),
:deep(.el-sub-menu__title) {
  color: rgba(255, 255, 255, 0.65);
}

:deep(.el-menu-item:hover),
:deep(.el-sub-menu__title:hover) {
  color: #fff;
  background: rgba(255, 255, 255, 0.08) !important;
}

:deep(.el-menu-item.is-active) {
  color: #fff;
  background: #1890ff !important;
}

/* 子菜单样式 */
:deep(.el-sub-menu .el-menu) {
  background: #000c17 !important;
}

:deep(.el-sub-menu .el-menu-item) {
  background: #000c17 !important;
  color: rgba(255, 255, 255, 0.65);
  min-width: 0;
  padding-left: 48px !important;
}

:deep(.el-sub-menu .el-menu-item:hover) {
  background: rgba(255, 255, 255, 0.08) !important;
  color: #fff;
}

:deep(.el-sub-menu .el-menu-item.is-active) {
  background: #1890ff !important;
  color: #fff;
}

.admin-header {
  background: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #f0f0f0;
  padding: 0 24px;
}

.header-left {
  display: flex;
  align-items: center;
}

.collapse-icon {
  font-size: 20px;
  cursor: pointer;
  transition: color 0.3s;
}

.collapse-icon:hover {
  color: #1890ff;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 24px;
}

.admin-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
  transition: background 0.3s;
}

.admin-info:hover {
  background: #f5f5f5;
}

.admin-name {
  font-size: 14px;
  color: #333;
}

.admin-main {
  background: #f0f2f5;
  padding: 24px;
  overflow-y: auto;
}
</style>
