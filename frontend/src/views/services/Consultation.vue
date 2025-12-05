<template>
  <LayoutMain>
    <div class="consultation-page">
      <!-- 顶部搜索栏 -->
      <div class="search-section">
        <div class="search-wrapper">
          <el-input v-model="searchKeyword" placeholder="搜索医生姓名或擅长领域" size="large" clearable>
            <template #prefix>
              <el-icon>
                <Search />
              </el-icon>
            </template>
          </el-input>
        </div>
      </div>

      <!-- 筛选选项 -->
      <div class="filter-section">
        <div class="filter-tabs">
          <button v-for="status in statusOptions" :key="status.value"
            :class="['filter-tab', { active: selectedStatus === status.value }]" @click="selectedStatus = status.value">
            {{ status.label }}
          </button>
        </div>
        <div class="filter-sort">
          <el-select v-model="sortBy" size="small">
            <el-option label="综合排序" value="default" />
            <el-option label="好评优先" value="rating" />
            <el-option label="价格从低到高" value="price_asc" />
            <el-option label="价格从高到低" value="price_desc" />
          </el-select>
        </div>
      </div>

      <!-- 医生列表 -->
      <div class="doctors-list">
        <div v-for="doctor in filteredDoctors" :key="doctor.id" class="doctor-card">
          <div class="doctor-avatar">
            <img :src="doctor.avatar" :alt="doctor.name">
            <span :class="['status-badge', doctor.status]">
              {{ doctor.status === 'online' ? '在线' : '离线' }}
            </span>
          </div>

          <div class="doctor-info">
            <div class="doctor-header">
              <h3 class="doctor-name">
                {{ doctor.name }}
              </h3>
              <span class="doctor-title">{{ doctor.title }}</span>
            </div>

            <p class="doctor-hospital">
              {{ doctor.hospital }}
            </p>

            <div class="doctor-expertise">
              <span v-for="item in doctor.expertise.slice(0, 3)" :key="item" class="expertise-tag">
                {{ item }}
              </span>
            </div>

            <div class="doctor-stats">
              <div class="stat-item">
                <el-icon>
                  <Star />
                </el-icon>
                <span>{{ doctor.rating }}分</span>
              </div>
              <div class="stat-item">
                <el-icon>
                  <ChatDotRound />
                </el-icon>
                <span>{{ doctor.consultCount }}次咨询</span>
              </div>
              <div class="stat-item">
                <el-icon>
                  <Calendar />
                </el-icon>
                <span>{{ doctor.experience }}年经验</span>
              </div>
            </div>
          </div>

          <div class="doctor-action">
            <div class="price">
              ¥<span class="price-value">{{ doctor.price }}</span>/次
            </div>
            <el-button type="primary" :disabled="doctor.status === 'offline'" @click="handleConsult(doctor)">
              立即咨询
            </el-button>
          </div>
        </div>

        <!-- 空状态 -->
        <el-empty v-if="filteredDoctors.length === 0" description="暂无符合条件的医生" />
      </div>

      <!-- 咨询弹窗 -->
      <el-dialog v-model="consultDialogVisible" title="开始咨询" width="500px">
        <div v-if="selectedDoctor" class="consult-dialog">
          <div class="doctor-brief">
            <img :src="selectedDoctor.avatar" class="brief-avatar">
            <div class="brief-info">
              <h4>{{ selectedDoctor.name }} {{ selectedDoctor.title }}</h4>
              <p>{{ selectedDoctor.hospital }}</p>
            </div>
          </div>

          <el-form :model="consultForm" label-width="80px">
            <el-form-item label="宠物类型">
              <el-select v-model="consultForm.petType" placeholder="请选择">
                <el-option label="狗狗" value="dog" />
                <el-option label="猫咪" value="cat" />
                <el-option label="其他" value="other" />
              </el-select>
            </el-form-item>

            <el-form-item label="问题描述">
              <el-input v-model="consultForm.description" type="textarea" :rows="4" placeholder="请详细描述宠物的症状、持续时间等信息"
                maxlength="500" show-word-limit />
            </el-form-item>

            <el-form-item label="上传图片">
              <el-upload v-model:file-list="consultForm.images" action="#" list-type="picture-card" :auto-upload="false"
                :limit="6">
                <el-icon>
                  <Plus />
                </el-icon>
              </el-upload>
              <div class="upload-tip">
                最多上传6张图片,帮助医生更好地了解情况
              </div>
            </el-form-item>
          </el-form>

          <div class="price-info">
            <span>咨询费用</span>
            <span class="amount">¥{{ selectedDoctor.price }}</span>
          </div>
        </div>

        <template #footer>
          <el-button @click="consultDialogVisible = false">
            取消
          </el-button>
          <el-button type="primary" @click="handleConfirmConsult">
            确认支付
          </el-button>
        </template>
      </el-dialog>
    </div>
  </LayoutMain>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import LayoutMain from '@/components/LayoutMain.vue'
import {
  Search,
  Star,
  ChatDotRound,
  Calendar,
  Plus,
} from '@element-plus/icons-vue'
import type { Doctor } from '@/types'

// 搜索和筛选
const searchKeyword = ref('')
const selectedStatus = ref<'all' | 'online' | 'offline'>('all')
const sortBy = ref('default')

const statusOptions = [
  { label: '全部', value: 'all' },
  { label: '在线', value: 'online' },
  { label: '离线', value: 'offline' },
]

// 模拟数据
const doctors = ref<Doctor[]>([
  {
    id: '1',
    avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&h=200&fit=crop',
    name: '张医生',
    title: '主任医师',
    hospital: '宠爱动物医院',
    expertise: ['皮肤病', '内科', '外科'],
    experience: 15,
    consultCount: 2856,
    rating: 4.9,
    price: 99,
    status: 'online',
  },
  {
    id: '2',
    avatar: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=200&h=200&fit=crop',
    name: '李医生',
    title: '副主任医师',
    hospital: '爱宠宠物医院',
    expertise: ['骨科', '牙科', '眼科'],
    experience: 10,
    consultCount: 1523,
    rating: 4.8,
    price: 79,
    status: 'online',
  },
  {
    id: '3',
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&h=200&fit=crop',
    name: '王医生',
    title: '主治医师',
    hospital: '宠康动物医院',
    expertise: ['传染病', '疫苗', '体检'],
    experience: 8,
    consultCount: 987,
    rating: 4.7,
    price: 59,
    status: 'offline',
  },
  {
    id: '4',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop',
    name: '赵医生',
    title: '主任医师',
    hospital: '瑞派宠物医院',
    expertise: ['心脏病', '肾病', '内分泌'],
    experience: 12,
    consultCount: 2103,
    rating: 4.9,
    price: 89,
    status: 'online',
  },
  {
    id: '5',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop',
    name: '陈医生',
    title: '主治医师',
    hospital: '芭比堂动物医院',
    expertise: ['寄生虫病', '营养咨询', '行为训练'],
    experience: 6,
    consultCount: 745,
    rating: 4.6,
    price: 49,
    status: 'online',
  },
])

// 筛选后的医生列表
const filteredDoctors = computed(() => {
  let result = doctors.value

  // 按状态筛选
  if (selectedStatus.value !== 'all') {
    result = result.filter((d) => d.status === selectedStatus.value)
  }

  // 按关键词搜索
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(
      (d) =>
        d.name.toLowerCase().includes(keyword) ||
        d.expertise.some((e) => e.toLowerCase().includes(keyword))
    )
  }

  // 排序
  switch (sortBy.value) {
    case 'rating':
      result = [...result].sort((a, b) => b.rating - a.rating)
      break
    case 'price_asc':
      result = [...result].sort((a, b) => a.price - b.price)
      break
    case 'price_desc':
      result = [...result].sort((a, b) => b.price - a.price)
      break
  }

  return result
})

// 咨询相关
const consultDialogVisible = ref(false)
const selectedDoctor = ref<Doctor | null>(null)
const consultForm = ref({
  petType: '',
  description: '',
  images: [] as any[],
})

const handleConsult = (doctor: Doctor) => {
  selectedDoctor.value = doctor
  consultDialogVisible.value = true
}

const handleConfirmConsult = () => {
  if (!consultForm.value.petType) {
    ElMessage.warning('请选择宠物类型')
    return
  }
  if (!consultForm.value.description) {
    ElMessage.warning('请描述问题')
    return
  }

  ElMessage.success('咨询订单已创建,请前往支付')
  consultDialogVisible.value = false

  // 重置表单
  consultForm.value = {
    petType: '',
    description: '',
    images: [],
  }
}
</script>

<style scoped lang="scss">
.consultation-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

// 搜索区域
.search-section {
  margin-bottom: 20px;

  .search-wrapper {
    max-width: 600px;
    margin: 0 auto;
  }
}

// 筛选区域
.filter-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 15px;
  background: white;
  border-radius: 8px;

  .filter-tabs {
    display: flex;
    gap: 10px;
  }

  .filter-tab {
    padding: 8px 20px;
    border: 1px solid #e5e7eb;
    background: white;
    border-radius: 20px;
    cursor: pointer;
    transition: all 0.3s;

    &:hover {
      border-color: #ff6b35;
      color: #ff6b35;
    }

    &.active {
      background: linear-gradient(135deg, #ff6b35, #f7931e);
      color: white;
      border-color: transparent;
    }
  }
}

// 医生列表
.doctors-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.doctor-card {
  display: flex;
  gap: 20px;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s;

  &:hover {
    box-shadow: 0 4px 16px rgba(255, 107, 53, 0.15);
    transform: translateY(-2px);
  }
}

.doctor-avatar {
  position: relative;
  flex-shrink: 0;

  img {
    width: 100px;
    height: 100px;
    border-radius: 12px;
    object-fit: cover;
  }

  .status-badge {
    position: absolute;
    bottom: -5px;
    left: 50%;
    transform: translateX(-50%);
    padding: 2px 10px;
    font-size: 12px;
    border-radius: 10px;
    white-space: nowrap;

    &.online {
      background: #10b981;
      color: white;
    }

    &.offline {
      background: #9ca3af;
      color: white;
    }
  }
}

.doctor-info {
  flex: 1;

  .doctor-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 8px;
  }

  .doctor-name {
    font-size: 18px;
    font-weight: 600;
    margin: 0;
  }

  .doctor-title {
    padding: 2px 8px;
    background: #fef3c7;
    color: #d97706;
    font-size: 12px;
    border-radius: 4px;
  }

  .doctor-hospital {
    color: #6b7280;
    font-size: 14px;
    margin: 0 0 10px 0;
  }

  .doctor-expertise {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 12px;
  }

  .expertise-tag {
    padding: 4px 12px;
    background: #f3f4f6;
    color: #374151;
    font-size: 12px;
    border-radius: 12px;
  }

  .doctor-stats {
    display: flex;
    gap: 20px;
  }

  .stat-item {
    display: flex;
    align-items: center;
    gap: 4px;
    color: #6b7280;
    font-size: 14px;

    .el-icon {
      color: #ff6b35;
    }
  }
}

.doctor-action {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;

  .price {
    font-size: 14px;
    color: #6b7280;

    .price-value {
      font-size: 24px;
      font-weight: 600;
      color: #ff6b35;
    }
  }
}

// 咨询弹窗
.consult-dialog {
  .doctor-brief {
    display: flex;
    gap: 15px;
    padding: 15px;
    background: #f9fafb;
    border-radius: 8px;
    margin-bottom: 20px;

    .brief-avatar {
      width: 60px;
      height: 60px;
      border-radius: 8px;
      object-fit: cover;
    }

    .brief-info {
      h4 {
        margin: 0 0 5px 0;
        font-size: 16px;
      }

      p {
        margin: 0;
        color: #6b7280;
        font-size: 14px;
      }
    }
  }

  .upload-tip {
    color: #9ca3af;
    font-size: 12px;
    margin-top: 5px;
  }

  .price-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px;
    background: #fef3c7;
    border-radius: 8px;
    margin-top: 20px;

    .amount {
      font-size: 24px;
      font-weight: 600;
      color: #ff6b35;
    }
  }
}

// 响应式
@media (max-width: 768px) {
  .consultation-page {
    padding: 15px;
  }

  .doctor-card {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .doctor-info {
    width: 100%;

    .doctor-header,
    .doctor-stats {
      justify-content: center;
    }

    .doctor-expertise {
      justify-content: center;
    }
  }

  .filter-section {
    flex-direction: column;
    gap: 15px;

    .filter-tabs {
      width: 100%;
      justify-content: center;
    }
  }
}
</style>
