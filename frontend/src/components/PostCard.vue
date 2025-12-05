<template>
  <div
    class="post-card"
    @click="goToDetail"
  >
    <!-- 用户信息 -->
    <div class="post-header">
      <el-avatar
        :src="post.user.avatar"
        :size="40"
      >
        {{ post.user.nickname.charAt(0) }}
      </el-avatar>
      <div class="user-info">
        <div class="user-name">
          {{ post.user.nickname }}
        </div>
        <div class="post-time">
          {{ formatTime(post.createdAt) }}
        </div>
      </div>
    </div>

    <!-- 内容 -->
    <div class="post-content">
      <p>{{ post.content }}</p>
    </div>

    <!-- 图片 -->
    <div
      v-if="post.images && post.images.length"
      class="post-images"
    >
      <div
        v-for="(image, index) in post.images.slice(0, 4)"
        :key="index"
        class="image-item"
        :class="`images-${Math.min(post.images.length, 4)}`"
      >
        <img
          :src="image"
          :alt="`图片${index + 1}`"
        >
        <div
          v-if="index === 3 && post.images.length > 4"
          class="more-images"
        >
          +{{ post.images.length - 4 }}
        </div>
      </div>
    </div>

    <!-- 视频 -->
    <div
      v-if="post.video"
      class="post-video"
    >
      <div class="video-cover">
        <img
          :src="post.video.cover"
          alt="视频封面"
        >
        <div class="play-btn">
          <el-icon :size="48">
            <VideoPlay />
          </el-icon>
        </div>
        <div class="video-duration">
          {{ formatDuration(post.video.duration) }}
        </div>
      </div>
    </div>

    <!-- 话题标签 -->
    <div
      v-if="post.topics && post.topics.length"
      class="post-topics"
    >
      <span
        v-for="topic in post.topics"
        :key="topic"
        class="topic"
      >#{{ topic }}</span>
    </div>

    <!-- 互动数据 -->
    <div class="post-footer">
      <div
        class="stat-item"
        :class="{ active: post.isLiked }"
        @click.stop="handleLike"
      >
        <span>❤️</span>
        <span>{{ formatNumber(post.stats.likes) }}</span>
      </div>
      <div
        class="stat-item"
        @click.stop="handleComment"
      >
        <el-icon><ChatDotRound /></el-icon>
        <span>{{ formatNumber(post.stats.comments) }}</span>
      </div>
      <div
        class="stat-item"
        @click.stop="handleShare"
      >
        <el-icon><Share /></el-icon>
        <span>{{ formatNumber(post.stats.shares) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ChatDotRound, Share, VideoPlay } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import type { Post } from '@/types'

interface Props {
  post: Post
}

const props = defineProps<Props>()
const router = useRouter()

const goToDetail = () => {
  router.push(`/post/${props.post.id}`)
}

const handleLike = () => {
  // TODO: 实现点赞功能
  ElMessage.success(props.post.isLiked ? '取消点赞' : '点赞成功')
}

const handleComment = () => {
  router.push(`/post/${props.post.id}#comments`)
}

const handleShare = () => {
  // TODO: 实现分享功能
  ElMessage.info('分享功能开发中...')
}

const formatTime = (time: string): string => {
  const now = new Date()
  const postTime = new Date(time)
  const diff = now.getTime() - postTime.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`
  return time
}

const formatDuration = (seconds: number): string => {
  const min = Math.floor(seconds / 60)
  const sec = seconds % 60
  return `${min}:${sec.toString().padStart(2, '0')}`
}

const formatNumber = (num: number): string => {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + '万'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k'
  }
  return num.toString()
}
</script>

<style scoped lang="scss">
.post-card {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

  &:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  }
}

.post-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.user-info {
  flex: 1;

  .user-name {
    font-size: 14px;
    font-weight: 500;
    color: #333;
    margin-bottom: 4px;
  }

  .post-time {
    font-size: 12px;
    color: #999;
  }
}

.post-content {
  margin-bottom: 12px;

  p {
    margin: 0;
    font-size: 14px;
    line-height: 1.6;
    color: #333;
    word-break: break-word;
  }
}

.post-images {
  display: grid;
  gap: 4px;
  margin-bottom: 12px;
  border-radius: 8px;
  overflow: hidden;

  &:has(.images-1) {
    grid-template-columns: 1fr;
  }

  &:has(.images-2) {
    grid-template-columns: repeat(2, 1fr);
  }

  &:has(.images-3),
  &:has(.images-4) {
    grid-template-columns: repeat(2, 1fr);
  }

  .image-item {
    position: relative;
    width: 100%;
    padding-top: 100%;
    overflow: hidden;
    background: #f5f5f5;

    img {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .more-images {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(0, 0, 0, 0.5);
      color: #fff;
      font-size: 24px;
      font-weight: bold;
    }
  }

  .images-1 {
    padding-top: 66.67%; // 3:2比例
  }
}

.post-video {
  margin-bottom: 12px;

  .video-cover {
    position: relative;
    width: 100%;
    padding-top: 56.25%; // 16:9比例
    border-radius: 8px;
    overflow: hidden;
    background: #000;

    img {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .play-btn {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 64px;
      height: 64px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255, 255, 255, 0.9);
      border-radius: 50%;
      color: #ff6b35;
      cursor: pointer;
      transition: all 0.3s;

      &:hover {
        background: #fff;
        transform: translate(-50%, -50%) scale(1.1);
      }
    }

    .video-duration {
      position: absolute;
      bottom: 8px;
      right: 8px;
      padding: 4px 8px;
      background: rgba(0, 0, 0, 0.7);
      color: #fff;
      font-size: 12px;
      border-radius: 4px;
    }
  }
}

.post-topics {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;

  .topic {
    color: #ff6b35;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: color 0.3s;

    &:hover {
      color: #ff8c5a;
    }
  }
}

.post-footer {
  display: flex;
  gap: 32px;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;

  .stat-item {
    display: flex;
    align-items: center;
    gap: 6px;
    color: #666;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.3s;

    .el-icon {
      font-size: 18px;
    }

    &:hover {
      color: #ff6b35;
    }

    &.active {
      color: #ff6b35;
    }
  }
}

// 移动端适配
@media (max-width: 768px) {
  .post-card {
    padding: 12px;
  }

  .post-content p {
    font-size: 13px;
  }

  .post-footer {
    gap: 24px;

    .stat-item {
      font-size: 13px;

      .el-icon {
        font-size: 16px;
      }
    }
  }
}
</style>
