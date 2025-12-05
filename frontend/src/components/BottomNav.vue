<template>
  <div class="bottom-nav">
    <router-link to="/" class="nav-item" :class="{ active: currentPath === '/' }">
      <el-icon :size="24">
        <HomeFilled />
      </el-icon>
      <span>首页</span>
    </router-link>

    <router-link to="/shop" class="nav-item" :class="{ active: currentPath.startsWith('/shop') }">
      <el-icon :size="24">
        <ShoppingBag />
      </el-icon>
      <span>商城</span>
    </router-link>

    <div class="nav-item publish-btn" @click="handlePublish">
      <div class="publish-icon">
        <el-icon :size="28">
          <Plus />
        </el-icon>
      </div>
    </div>

    <router-link to="/community" class="nav-item" :class="{ active: currentPath.startsWith('/community') }">
      <el-icon :size="24">
        <ChatDotRound />
      </el-icon>
      <span>社区</span>
    </router-link>

    <router-link to="/user" class="nav-item" :class="{ active: currentPath.startsWith('/user') }">
      <el-icon :size="24">
        <User />
      </el-icon>
      <span>我的</span>
    </router-link>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { HomeFilled, ShoppingBag, Plus, ChatDotRound, User } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const currentPath = computed(() => route.path)

const handlePublish = () => {
  if (!userStore.isLogin) {
    ElMessage.warning('请先登录')
    router.push('/')
    return
  }
  router.push('/community/publish')
}
</script>

<style scoped lang="scss">
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 999;
  height: 56px;
  background: #fff;
  border-top: 1px solid #e4e7ed;
  display: none;
  justify-content: space-around;
  align-items: center;
  padding: 0 8px;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.06);

  .nav-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2px;
    color: #909399;
    text-decoration: none;
    font-size: 12px;
    transition: all 0.3s;
    cursor: pointer;
    position: relative;

    &.active {
      color: #ff6b35;
    }

    &.publish-btn {
      .publish-icon {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        background: linear-gradient(135deg, #ff6b35 0%, #ff8c5a 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        color: #fff;
        box-shadow: 0 4px 12px rgba(255, 107, 53, 0.4);
        margin-bottom: 8px;
      }

      span {
        display: none;
      }
    }
  }
}

// 移动端显示
@media (max-width: 768px) {
  .bottom-nav {
    display: flex;
  }
}
</style>
