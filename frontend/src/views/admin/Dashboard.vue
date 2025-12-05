<template>
  <div class="dashboard">
    <h2 class="page-title">工作台</h2>

    <!-- 欢迎信息 -->
    <el-card class="welcome-card" shadow="never">
      <div class="welcome-content">
        <div class="welcome-text">
          <h3>欢迎回来,{{ adminStore.adminName }}!</h3>
          <p>今天是 {{ currentDate }},祝您工作愉快!</p>
        </div>
        <div class="welcome-actions">
          <el-button type="primary" @click="$router.push('/admin/products')">
            管理商品
          </el-button>
          <el-button @click="$router.push('/admin/orders')">查看订单</el-button>
        </div>
      </div>
    </el-card>

    <!-- 数据统计卡片 -->
    <el-row :gutter="24" class="stats-row">
      <el-col :xs="12" :sm="12" :md="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-info">
              <div class="stat-title">用户总数</div>
              <div class="stat-value">1,234</div>
            </div>
            <div class="stat-icon user">
              <el-icon :size="32"><User /></el-icon>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="12" :sm="12" :md="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-info">
              <div class="stat-title">商品数量</div>
              <div class="stat-value">567</div>
            </div>
            <div class="stat-icon product">
              <el-icon :size="32"><Goods /></el-icon>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="12" :sm="12" :md="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-info">
              <div class="stat-title">订单数量</div>
              <div class="stat-value">890</div>
            </div>
            <div class="stat-icon order">
              <el-icon :size="32"><Document /></el-icon>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="12" :sm="12" :md="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-info">
              <div class="stat-title">社区动态</div>
              <div class="stat-value">345</div>
            </div>
            <div class="stat-icon community">
              <el-icon :size="32"><ChatDotSquare /></el-icon>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 快捷入口 -->
    <el-card class="quick-links" shadow="never">
      <template #header>
        <h3>快捷入口</h3>
      </template>
      <el-row :gutter="16">
        <el-col :xs="12" :sm="8" :md="6" v-for="link in quickLinks" :key="link.path">
          <div class="quick-link-item" @click="$router.push(link.path)">
            <el-icon :size="24">
              <component :is="link.icon" />
            </el-icon>
            <span>{{ link.title }}</span>
          </div>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAdminStore } from '@/stores/admin'
import {
  User,
  Goods,
  Document,
  ChatDotSquare,
  UserFilled,
  ShoppingBag,
  List,
  CollectionTag,
  Menu,
} from '@element-plus/icons-vue'

const adminStore = useAdminStore()

const currentDate = computed(() => {
  const now = new Date()
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  }
  return now.toLocaleDateString('zh-CN', options)
})

const quickLinks = [
  { title: '管理员管理', path: '/admin/admins', icon: UserFilled },
  { title: '用户列表', path: '/admin/users', icon: User },
  { title: '分类管理', path: '/admin/categories', icon: Menu },
  { title: '品牌管理', path: '/admin/brands', icon: CollectionTag },
  { title: '商品列表', path: '/admin/products', icon: Goods },
  { title: '订单列表', path: '/admin/orders', icon: List },
  { title: '动态管理', path: '/admin/posts', icon: ChatDotSquare },
  { title: '商城首页', path: '/', icon: ShoppingBag },
]
</script>

<style scoped>
.dashboard {
  max-width: 1400px;
}

.page-title {
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin-bottom: 24px;
}

.welcome-card {
  margin-bottom: 24px;
}

.welcome-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.welcome-text h3 {
  font-size: 20px;
  color: #333;
  margin: 0 0 8px 0;
}

.welcome-text p {
  color: #666;
  margin: 0;
}

.welcome-actions {
  display: flex;
  gap: 12px;
}

.stats-row {
  margin-bottom: 24px;
}

.stat-card {
  margin-bottom: 16px;
}

.stat-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-title {
  font-size: 14px;
  color: #999;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #333;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.stat-icon.user {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-icon.product {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.stat-icon.order {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.stat-icon.community {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.quick-links :deep(.el-card__header) {
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
}

.quick-links h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.quick-link-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 24px 16px;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  margin-bottom: 16px;
}

.quick-link-item:hover {
  border-color: #1890ff;
  background: #f0f9ff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.15);
}

.quick-link-item span {
  font-size: 14px;
  color: #666;
}

.quick-link-item:hover span {
  color: #1890ff;
}
</style>
