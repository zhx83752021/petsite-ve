<template>
  <LayoutMain>
    <div class="user-center-page">
      <div class="user-sidebar">
        <div class="user-profile">
          <img :src="userInfo.avatar" alt="用户头像" class="user-avatar">
          <h3 class="user-name">
            {{ userInfo.nickname }}
          </h3>
          <p class="user-level">
            VIP会员
          </p>
        </div>

        <el-menu :default-active="activeMenu" class="sidebar-menu" @select="handleMenuSelect">
          <el-menu-item index="/user/pets">
            <el-icon>
              <Avatar />
            </el-icon>
            <span>宠物档案</span>
          </el-menu-item>
          <el-menu-item index="/user/orders">
            <el-icon>
              <ShoppingBag />
            </el-icon>
            <span>我的订单</span>
          </el-menu-item>
          <el-menu-item index="/user/posts">
            <el-icon>
              <ChatDotSquare />
            </el-icon>
            <span>我的动态</span>
          </el-menu-item>
          <el-menu-item index="/user/settings">
            <el-icon>
              <Setting />
            </el-icon>
            <span>账户设置</span>
          </el-menu-item>
        </el-menu>
      </div>

      <div class="user-content">
        <router-view />
      </div>
    </div>
  </LayoutMain>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  Avatar,
  ShoppingBag,
  ChatDotSquare,
  Setting,
} from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import LayoutMain from '@/components/LayoutMain.vue'
import { getUserAvatar } from '@/config/images'

const userStore = useUserStore()
const router = useRouter()
const route = useRoute()

// 用户信息
const userInfo = computed(() => {
  const info = userStore.userInfo
  if (!info) return null

  // 如果有头像就用头像，否则生成默认头像
  const avatarUrl = info.avatar || getUserAvatar(info.id || info.username || 'User')

  return {
    ...info,
    avatar: avatarUrl
  }
})

// 当前激活的菜单
const activeMenu = computed(() => route.path)

const handleMenuSelect = (index: string) => {
  router.push(index)
}
</script>

<style scoped lang="scss">
.user-center-page {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
  display: flex;
  gap: 20px;
  min-height: calc(100vh - 80px);
}

.user-sidebar {
  width: 260px;
  flex-shrink: 0;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  height: fit-content;
  position: sticky;
  top: 20px;
}

.user-profile {
  padding: 30px 20px;
  text-align: center;
  background: linear-gradient(135deg, #ff6b35, #f7931e);
  color: white;

  .user-avatar {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    object-fit: cover;
    border: 3px solid rgba(255, 255, 255, 0.3);
    margin-bottom: 15px;
  }

  .user-name {
    margin: 0 0 5px 0;
    font-size: 18px;
    font-weight: 600;
  }

  .user-level {
    margin: 0;
    font-size: 13px;
    opacity: 0.9;
  }
}

.sidebar-menu {
  border: none;

  .el-menu-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 0 20px;
    height: 50px;

    &.is-active {
      background: #fff5f0;
      color: #ff6b35;

      .el-icon {
        color: #ff6b35;
      }
    }
  }
}

.user-content {
  flex: 1;
  background: white;
  border-radius: 12px;
  padding: 30px;
  min-height: 600px;
}

// 响应式
@media (max-width: 768px) {
  .user-center-page {
    flex-direction: column;
    padding: 15px;
  }

  .user-sidebar {
    width: 100%;
    position: static;
  }

  .user-content {
    padding: 20px;
  }
}
</style>
