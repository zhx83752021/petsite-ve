<template>
  <div class="posts-page">
    <div class="page-header">
      <h2>我的动态</h2>
      <el-button type="primary" @click="$router.push('/community')">
        <el-icon><Plus /></el-icon>
        发布动态
      </el-button>
    </div>

    <!-- 动态列表 -->
    <div v-if="posts.length > 0" class="posts-list">
      <div
        v-for="post in posts"
        :key="post.id"
        class="post-card"
      >
        <div class="post-content">
          <p class="post-text">{{ post.content }}</p>
          <div v-if="post.images && post.images.length > 0" class="post-images">
            <img
              v-for="(img, index) in post.images"
              :key="index"
              :src="img"
              :alt="`图片${index + 1}`"
              class="post-image"
            />
          </div>
          <div class="post-tags">
            <el-tag
              v-for="topic in post.topics"
              :key="topic"
              size="small"
              type="primary"
              effect="plain"
            >
              #{{ topic }}
            </el-tag>
          </div>
        </div>

        <div class="post-footer">
          <div class="post-meta">
            <span class="post-time">{{ post.createdAt }}</span>
            <div class="post-stats">
              <span>
                <el-icon><View /></el-icon>
                {{ post.stats.views }}
              </span>
              <span>
                <el-icon><ChatDotRound /></el-icon>
                {{ post.stats.comments }}
              </span>
              <span>
                <el-icon><StarFilled /></el-icon>
                {{ post.stats.likes }}
              </span>
            </div>
          </div>
          <div class="post-actions">
            <el-button size="small" @click="handleEdit(post)">
              编辑
            </el-button>
            <el-button size="small" type="danger" @click="handleDelete(post.id)">
              删除
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <el-empty
      v-else
      description="还没有发布过动态"
    >
      <el-button type="primary" @click="$router.push('/community')">
        发布第一条动态
      </el-button>
    </el-empty>

    <!-- 编辑动态弹窗 -->
    <el-dialog
      v-model="editDialogVisible"
      title="编辑动态"
      width="600px"
    >
      <el-form :model="editForm" label-width="0">
        <el-form-item>
          <el-input
            v-model="editForm.content"
            type="textarea"
            :rows="6"
            placeholder="分享你和宠物的故事..."
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
        <el-form-item>
          <div class="topic-input">
            <span class="topic-label">话题标签:</span>
            <el-tag
              v-for="topic in editForm.topics"
              :key="topic"
              closable
              @close="removeTag(topic)"
            >
              #{{ topic }}
            </el-tag>
            <el-input
              v-if="inputVisible"
              ref="inputRef"
              v-model="inputValue"
              size="small"
              style="width: 100px"
              @keyup.enter="handleInputConfirm"
              @blur="handleInputConfirm"
            />
            <el-button
              v-else
              size="small"
              @click="showInput"
            >
              + 添加话题
            </el-button>
          </div>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveEdit">
          保存
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, View, ChatDotRound, StarFilled } from '@element-plus/icons-vue'
import type { Post } from '@/types'

// 模拟数据
const posts = ref<Post[]>([
  {
    id: '1',
    user: {
      id: 'u1',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop',
      nickname: '宠物爱好者',
    },
    content: '今天带旺财去公园玩了一下午,它特别开心!看它开心我也很满足 😊',
    images: [
      'https://images.unsplash.com/photo-1633722715463-d30f4f325e24?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1615751072497-5f5169febe17?w=600&h=400&fit=crop',
    ],
    topics: ['金毛日常', '遛狗'],
    petTags: ['金毛', '2岁'],
    location: '北京·朝阳公园',
    createdAt: '2024-12-01 15:30',
    stats: {
      likes: 128,
      comments: 23,
      shares: 5,
      views: 856,
    },
    isLiked: true,
  },
  {
    id: '2',
    user: {
      id: 'u1',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop',
      nickname: '宠物爱好者',
    },
    content: '小橘今天又在抢我的键盘了,猫咪真是太可爱了!',
    images: [
      'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=600&h=400&fit=crop',
    ],
    topics: ['橘猫', '猫咪日常'],
    createdAt: '2024-11-28 10:20',
    stats: {
      likes: 89,
      comments: 15,
      shares: 2,
      views: 523,
    },
    isLiked: false,
  },
  {
    id: '3',
    user: {
      id: 'u1',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop',
      nickname: '宠物爱好者',
    },
    content: '分享一些养宠心得:定期体检真的很重要!今天带旺财做了全面体检,一切正常。',
    topics: ['养宠日记', '宠物健康'],
    createdAt: '2024-11-25 14:00',
    stats: {
      likes: 156,
      comments: 34,
      shares: 12,
      views: 1245,
    },
    isLiked: true,
  },
])

// 编辑相关
const editDialogVisible = ref(false)
const editingPost = ref<Post | null>(null)
const editForm = ref({
  content: '',
  topics: [] as string[],
})

const inputVisible = ref(false)
const inputValue = ref('')
const inputRef = ref()

const handleEdit = (post: Post) => {
  editingPost.value = post
  editForm.value = {
    content: post.content,
    topics: [...post.topics],
  }
  editDialogVisible.value = true
}

const handleSaveEdit = () => {
  if (!editForm.value.content.trim()) {
    ElMessage.warning('请输入动态内容')
    return
  }

  if (editingPost.value) {
    const index = posts.value.findIndex((p) => p.id === editingPost.value!.id)
    if (index > -1) {
      posts.value[index].content = editForm.value.content
      posts.value[index].topics = editForm.value.topics
      ElMessage.success('编辑成功')
      editDialogVisible.value = false
    }
  }
}

const handleDelete = async (id: string) => {
  try {
    await ElMessageBox.confirm('确定要删除这条动态吗?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    const index = posts.value.findIndex((p) => p.id === id)
    if (index > -1) {
      posts.value.splice(index, 1)
      ElMessage.success('删除成功')
    }
  } catch {
    // 取消删除
  }
}

// 话题标签相关
const showInput = () => {
  inputVisible.value = true
  nextTick(() => {
    inputRef.value?.focus()
  })
}

const handleInputConfirm = () => {
  if (inputValue.value && !editForm.value.topics.includes(inputValue.value)) {
    editForm.value.topics.push(inputValue.value)
  }
  inputVisible.value = false
  inputValue.value = ''
}

const removeTag = (tag: string) => {
  const index = editForm.value.topics.indexOf(tag)
  if (index > -1) {
    editForm.value.topics.splice(index, 1)
  }
}
</script>

<style scoped lang="scss">
.posts-page {
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;

    h2 {
      margin: 0;
      font-size: 24px;
      color: #1f2937;
    }
  }
}

.posts-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.post-card {
  padding: 20px;
  background: #f9fafb;
  border-radius: 12px;
  transition: all 0.3s;

  &:hover {
    background: #f3f4f6;
  }

  .post-content {
    margin-bottom: 15px;

    .post-text {
      margin: 0 0 15px 0;
      font-size: 15px;
      line-height: 1.6;
      color: #1f2937;
      white-space: pre-wrap;
    }

    .post-images {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 10px;
      margin-bottom: 15px;

      .post-image {
        width: 100%;
        height: 200px;
        object-fit: cover;
        border-radius: 8px;
        cursor: pointer;
        transition: transform 0.3s;

        &:hover {
          transform: scale(1.02);
        }
      }
    }

    .post-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
  }

  .post-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 15px;
    border-top: 1px solid #e5e7eb;

    .post-meta {
      display: flex;
      align-items: center;
      gap: 20px;

      .post-time {
        color: #9ca3af;
        font-size: 14px;
      }

      .post-stats {
        display: flex;
        gap: 15px;
        font-size: 14px;
        color: #6b7280;

        span {
          display: flex;
          align-items: center;
          gap: 4px;

          .el-icon {
            font-size: 16px;
          }
        }
      }
    }

    .post-actions {
      display: flex;
      gap: 10px;
    }
  }
}

// 编辑表单
.topic-input {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;

  .topic-label {
    color: #6b7280;
    font-size: 14px;
  }
}

// 响应式
@media (max-width: 768px) {
  .post-card {
    .post-content {
      .post-images {
        grid-template-columns: 1fr;
      }
    }

    .post-footer {
      flex-direction: column;
      align-items: flex-start;
      gap: 15px;

      .post-meta {
        flex-direction: column;
        align-items: flex-start;
        gap: 10px;
      }

      .post-actions {
        width: 100%;

        .el-button {
          flex: 1;
        }
      }
    }
  }
}
</style>
