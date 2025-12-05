<template>
  <LayoutMain>
    <div class="community-page">
      <div class="community-container">
        <!-- 顶部发布区域 -->
        <div class="publish-section">
          <img :src="userAvatar" alt="头像" class="user-avatar" />
          <el-input v-model="postContent" type="textarea" :rows="3" placeholder="分享你和宠物的故事..." class="publish-input" />
          <div class="publish-actions">
            <div class="action-buttons">
              <el-button text>
                <el-icon>
                  <Picture />
                </el-icon>
                图片
              </el-button>
              <el-button text>
                <el-icon>
                  <VideoCamera />
                </el-icon>
                视频
              </el-button>
              <el-button text>
                <el-icon>
                  <LocationInformation />
                </el-icon>
                位置
              </el-button>
            </div>
            <el-button type="primary" @click="handlePublish">发布动态</el-button>
          </div>
        </div>

        <!-- 话题标签 -->
        <div class="topics-section">
          <div class="topic-tags">
            <el-tag v-for="topic in topics" :key="topic.id" :type="selectedTopic === topic.id ? '' : 'info'"
              size="large" @click="selectedTopic = topic.id" class="topic-tag">
              #{{ topic.name }}
            </el-tag>
          </div>
        </div>

        <!-- 动态列表 -->
        <div class="posts-list">
          <div v-for="post in posts" :key="post.id" class="post-card">
            <!-- 用户信息 -->
            <div class="post-header">
              <img :src="post.user.avatar" alt="头像" class="post-avatar" />
              <div class="post-user-info">
                <div class="username">{{ post.user.nickname }}</div>
                <div class="post-time">{{ post.createTime }}</div>
              </div>
              <el-button text>
                <el-icon>
                  <MoreFilled />
                </el-icon>
              </el-button>
            </div>

            <!-- 内容 -->
            <div class="post-content">
              <p>{{ post.content }}</p>
              <div v-if="post.images.length" class="post-images">
                <img v-for="(img, idx) in post.images" :key="idx" :src="img" alt="图片" class="post-image" />
              </div>
              <div v-if="post.topic" class="post-topic">
                <el-tag size="small">#{{ post.topic }}</el-tag>
              </div>
            </div>

            <!-- 互动栏 -->
            <div class="post-actions">
              <div class="action-item" @click="handleLike(post)">
                <el-icon>
                  <Promotion />
                </el-icon>
                <span>{{ post.likes }}</span>
              </div>
              <div class="action-item" @click="handleComment(post)">
                <el-icon>
                  <ChatDotRound />
                </el-icon>
                <span>{{ post.comments }}</span>
              </div>
              <div class="action-item" @click="handleShare(post)">
                <el-icon>
                  <Share />
                </el-icon>
                <span>{{ post.shares }}</span>
              </div>
            </div>
          </div>

          <!-- 加载更多 -->
          <div class="load-more">
            <el-button @click="loadMore">加载更多</el-button>
          </div>
        </div>
      </div>
    </div>
  </LayoutMain>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Picture,
  VideoCamera,
  LocationInformation,
  MoreFilled,
  Promotion,
  ChatDotRound,
  Share,
} from '@element-plus/icons-vue'
import LayoutMain from '@/components/LayoutMain.vue'

const userAvatar = 'https://picsum.photos/seed/user/100'
const postContent = ref('')
const selectedTopic = ref('all')

const topics = [
  { id: 'all', name: '全部' },
  { id: 'daily', name: '日常分享' },
  { id: 'help', name: '求助' },
  { id: 'cute', name: '萌宠' },
  { id: 'health', name: '健康' },
  { id: 'train', name: '训练' },
]

const posts = ref([
  {
    id: '1',
    user: {
      id: 'u1',
      nickname: '爱宠小王',
      avatar: 'https://picsum.photos/seed/user1/100',
    },
    content: '今天带狗狗去公园玩，它超级开心！看到其他小狗就想上去玩，真是太可爱了~',
    images: [
      'https://picsum.photos/seed/post1-1/400',
      'https://picsum.photos/seed/post1-2/400',
      'https://picsum.photos/seed/post1-3/400',
    ],
    topic: '日常分享',
    createTime: '2小时前',
    likes: 128,
    comments: 23,
    shares: 5,
  },
  {
    id: '2',
    user: {
      id: 'u2',
      nickname: '猫奴日记',
      avatar: 'https://picsum.photos/seed/user2/100',
    },
    content: '猫主子今天心情不好，一直不理我，求问各位铲屎官有什么好办法吗？',
    images: ['https://picsum.photos/seed/post2-1/400'],
    topic: '求助',
    createTime: '5小时前',
    likes: 85,
    comments: 42,
    shares: 3,
  },
  {
    id: '3',
    user: {
      id: 'u3',
      nickname: '宠物训练师',
      avatar: 'https://picsum.photos/seed/user3/100',
    },
    content:
      '分享一个简单的训练方法：用零食引导+口令强化，每天坚持15分钟，一周就能看到效果。大家可以试试！',
    images: [],
    topic: '训练',
    createTime: '1天前',
    likes: 256,
    comments: 67,
    shares: 89,
  },
])

const handlePublish = () => {
  if (!postContent.value.trim()) {
    ElMessage.warning('请输入内容')
    return
  }
  ElMessage.success('发布成功')
  postContent.value = ''
}

const handleLike = (post: any) => {
  post.likes++
  ElMessage.success('点赞成功')
}

const handleComment = (post: any) => {
  ElMessage.info('评论功能开发中')
}

const handleShare = (post: any) => {
  ElMessage.info('分享功能开发中')
}

const loadMore = () => {
  ElMessage.info('加载更多功能开发中')
}
</script>

<style scoped>
.community-page {
  background: #f5f7fa;
  min-height: calc(100vh - 60px);
  padding: 24px 0;
}

.community-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

.publish-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.user-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
}

.publish-input {
  flex: 1;
  min-width: 300px;
}

.publish-actions {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
}

.action-buttons {
  display: flex;
  gap: 16px;
}

.topics-section {
  background: white;
  border-radius: 12px;
  padding: 16px 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.topic-tags {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.topic-tag {
  cursor: pointer;
  transition: all 0.3s;
}

.topic-tag:hover {
  transform: translateY(-2px);
}

.posts-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.post-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: all 0.3s;
}

.post-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.post-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.post-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.post-user-info {
  flex: 1;
}

.username {
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
}

.post-time {
  font-size: 12px;
  color: #999;
}

.post-content p {
  color: #333;
  line-height: 1.6;
  margin-bottom: 12px;
}

.post-images {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 8px;
  margin-bottom: 12px;
}

.post-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 8px;
  cursor: pointer;
}

.post-topic {
  margin-top: 12px;
}

.post-actions {
  display: flex;
  gap: 32px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #eee;
}

.action-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #666;
  cursor: pointer;
  transition: all 0.3s;
}

.action-item:hover {
  color: #ff6b35;
}

.action-item .el-icon {
  font-size: 18px;
}

.load-more {
  text-align: center;
  padding: 24px 0;
}

@media (max-width: 768px) {
  .community-container {
    padding: 0 12px;
  }

  .publish-input {
    min-width: 100%;
  }

  .post-images {
    grid-template-columns: 1fr;
  }

  .post-image {
    height: 250px;
  }
}
</style>
