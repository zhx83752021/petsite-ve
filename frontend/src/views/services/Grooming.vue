<template>
  <LayoutMain>
    <div class="grooming-page">
      <!-- 顶部banner -->
      <div class="page-banner">
        <h1>宠物美容预约</h1>
        <p>专业美容师,呵护您的爱宠</p>
      </div>

      <!-- 筛选区域 -->
      <div class="filter-section">
        <div class="filter-item">
          <span class="filter-label">所在地区:</span>
          <el-select v-model="selectedCity" placeholder="请选择">
            <el-option label="全部" value="" />
            <el-option label="北京" value="beijing" />
            <el-option label="上海" value="shanghai" />
            <el-option label="广州" value="guangzhou" />
            <el-option label="深圳" value="shenzhen" />
          </el-select>
        </div>

        <div class="filter-item">
          <span class="filter-label">排序:</span>
          <el-select v-model="sortBy">
            <el-option label="距离最近" value="distance" />
            <el-option label="评分最高" value="rating" />
            <el-option label="价格最低" value="price" />
          </el-select>
        </div>

        <div class="filter-item">
          <el-input v-model="searchKeyword" placeholder="搜索店铺名称" clearable>
            <template #prefix>
              <el-icon>
                <Search />
              </el-icon>
            </template>
          </el-input>
        </div>
      </div>

      <!-- 店铺列表 -->
      <div class="stores-list">
        <div v-for="store in filteredStores" :key="store.id" class="store-card">
          <!-- 店铺图片 -->
          <div class="store-images">
            <el-carousel height="200px" indicator-position="inside">
              <el-carousel-item v-for="(img, index) in store.images" :key="index">
                <img :src="img" alt="店铺图片">
              </el-carousel-item>
            </el-carousel>
            <div class="distance-badge">
              {{ store.distance }}m
            </div>
          </div>

          <!-- 店铺信息 -->
          <div class="store-info">
            <div class="store-header">
              <h3>{{ store.name }}</h3>
              <div class="rating">
                <el-rate v-model="store.rating" disabled show-score text-color="#ff9900" />
                <span class="reviews">({{ store.reviews }}条评价)</span>
              </div>
            </div>

            <div class="store-details">
              <div class="detail-item">
                <el-icon>
                  <Location />
                </el-icon>
                <span>{{ store.address }}</span>
              </div>
              <div class="detail-item">
                <el-icon>
                  <Phone />
                </el-icon>
                <span>{{ store.phone }}</span>
              </div>
              <div class="detail-item">
                <el-icon>
                  <Clock />
                </el-icon>
                <span>{{ store.businessHours }}</span>
              </div>
            </div>

            <!-- 服务列表 -->
            <div class="services-list">
              <div v-for="service in store.services.slice(0, 3)" :key="service.id" class="service-item">
                <div class="service-info">
                  <span class="service-name">{{ service.name }}</span>
                  <span class="service-desc">{{ service.description }}</span>
                </div>
                <div class="service-action">
                  <span class="service-price">¥{{ service.price }}</span>
                  <el-button size="small" type="primary" @click="handleBookService(store, service)">
                    预约
                  </el-button>
                </div>
              </div>
            </div>

            <el-button v-if="store.services.length > 3" text type="primary" @click="handleViewMore(store)">
              查看全部{{ store.services.length }}项服务
            </el-button>
          </div>
        </div>

        <!-- 空状态 -->
        <el-empty v-if="filteredStores.length === 0" description="暂无店铺" />
      </div>

      <!-- 预约弹窗 -->
      <el-dialog v-model="bookingDialogVisible" title="预约服务" width="500px">
        <div v-if="selectedStore && selectedService" class="booking-dialog">
          <div class="booking-info">
            <h4>{{ selectedStore.name }}</h4>
            <p class="service-title">
              {{ selectedService.name }}
            </p>
            <p class="service-detail">
              {{ selectedService.description }} | 约{{ selectedService.duration }}分钟
            </p>
          </div>

          <el-form :model="bookingForm" label-width="80px">
            <el-form-item label="宠物类型">
              <el-select v-model="bookingForm.petType" placeholder="请选择">
                <el-option label="狗狗" value="dog" />
                <el-option label="猫咪" value="cat" />
              </el-select>
            </el-form-item>

            <el-form-item label="宠物大小">
              <el-radio-group v-model="bookingForm.petSize">
                <el-radio label="small">
                  小型(5kg以下)
                </el-radio>
                <el-radio label="medium">
                  中型(5-15kg)
                </el-radio>
                <el-radio label="large">
                  大型(15kg以上)
                </el-radio>
              </el-radio-group>
            </el-form-item>

            <el-form-item label="预约日期">
              <el-date-picker v-model="bookingForm.date" type="date" placeholder="选择日期" :disabled-date="disabledDate"
                style="width: 100%" />
            </el-form-item>

            <el-form-item label="预约时间">
              <el-select v-model="bookingForm.time" placeholder="请选择时段">
                <el-option v-for="time in availableTimes" :key="time" :label="time" :value="time" />
              </el-select>
            </el-form-item>

            <el-form-item label="联系电话">
              <el-input v-model="bookingForm.phone" placeholder="请输入手机号" maxlength="11" />
            </el-form-item>

            <el-form-item label="备注">
              <el-input v-model="bookingForm.note" type="textarea" :rows="3" placeholder="特殊需求或注意事项" maxlength="200" />
            </el-form-item>
          </el-form>

          <div class="price-info">
            <span>服务费用</span>
            <span class="amount">¥{{ selectedService.price }}</span>
          </div>
        </div>

        <template #footer>
          <el-button @click="bookingDialogVisible = false">
            取消
          </el-button>
          <el-button type="primary" @click="handleConfirmBooking">
            确认预约
          </el-button>
        </template>
      </el-dialog>

      <!-- 查看更多服务弹窗 -->
      <el-dialog v-model="moreServicesVisible" :title="selectedStore?.name + ' - 全部服务'" width="600px">
        <div class="all-services">
          <div v-for="service in selectedStore?.services" :key="service.id" class="service-item-full">
            <div class="service-content">
              <h4>{{ service.name }}</h4>
              <p>{{ service.description }}</p>
              <span class="duration">约{{ service.duration }}分钟</span>
            </div>
            <div class="service-book">
              <div class="price">
                ¥{{ service.price }}
              </div>
              <el-button size="small" type="primary" @click="handleBookService(selectedStore!, service)">
                预约
              </el-button>
            </div>
          </div>
        </div>
      </el-dialog>
    </div>
  </LayoutMain>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import LayoutMain from '@/components/LayoutMain.vue'
import { ElMessage } from 'element-plus'
import { Search, Location, Phone, Clock } from '@element-plus/icons-vue'
import type { Store } from '@/types'

// 筛选条件
const selectedCity = ref('')
const sortBy = ref('distance')
const searchKeyword = ref('')

// 模拟数据
const stores = ref<Store[]>([
  {
    id: '1',
    name: '爱宠美美宠物美容',
    images: [
      'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&h=400&fit=crop',
      'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800&h=400&fit=crop',
      'https://images.unsplash.com/photo-1588943211346-0908a1fb0b01?w=800&h=400&fit=crop',
    ],
    address: '朝阳区建国路88号SOHO现代城',
    phone: '010-12345678',
    businessHours: '09:00-20:00',
    services: [
      {
        id: 's1',
        name: '基础洗护',
        price: 80,
        duration: 60,
        description: '洗澡+吹干+梳毛',
      },
      {
        id: 's2',
        name: '精致造型',
        price: 150,
        duration: 120,
        description: '洗澡+造型修剪+染色',
      },
      {
        id: 's3',
        name: 'SPA护理',
        price: 200,
        duration: 90,
        description: '深层清洁+精油按摩',
      },
      {
        id: 's4',
        name: '指甲修剪',
        price: 30,
        duration: 15,
        description: '专业指甲护理',
      },
    ],
    rating: 4.9,
    reviews: 1256,
    distance: 500,
  },
  {
    id: '2',
    name: '宠爱时光宠物会所',
    images: [
      'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&h=400&fit=crop',
      'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=800&h=400&fit=crop',
    ],
    address: '海淀区中关村大街1号',
    phone: '010-87654321',
    businessHours: '08:30-21:00',
    services: [
      {
        id: 's5',
        name: '标准洗澡',
        price: 60,
        duration: 45,
        description: '基础清洁',
      },
      {
        id: 's6',
        name: '造型设计',
        price: 180,
        duration: 150,
        description: '个性化造型',
      },
      {
        id: 's7',
        name: '牙齿清洁',
        price: 100,
        duration: 30,
        description: '口腔护理',
      },
    ],
    rating: 4.8,
    reviews: 876,
    distance: 1200,
  },
  {
    id: '3',
    name: '萌宠驿站',
    images: [
      'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=800&h=400&fit=crop',
    ],
    address: '东城区王府井大街138号',
    phone: '010-23456789',
    businessHours: '10:00-19:00',
    services: [
      {
        id: 's8',
        name: '快速洗护',
        price: 50,
        duration: 30,
        description: '适合小型犬',
      },
      {
        id: 's9',
        name: '美容套餐',
        price: 250,
        duration: 180,
        description: '全套美容服务',
      },
    ],
    rating: 4.7,
    reviews: 543,
    distance: 800,
  },
])

// 筛选后的店铺列表
const filteredStores = computed(() => {
  let result = stores.value

  // 按关键词搜索
  if (searchKeyword.value) {
    result = result.filter((s) =>
      s.name.toLowerCase().includes(searchKeyword.value.toLowerCase())
    )
  }

  // 排序
  switch (sortBy.value) {
    case 'distance':
      result = [...result].sort((a, b) => a.distance - b.distance)
      break
    case 'rating':
      result = [...result].sort((a, b) => b.rating - a.rating)
      break
    case 'price':
      result = [...result].sort(
        (a, b) =>
          Math.min(...a.services.map((s) => s.price)) -
          Math.min(...b.services.map((s) => s.price))
      )
      break
  }

  return result
})

// 预约相关
const bookingDialogVisible = ref(false)
const moreServicesVisible = ref(false)
const selectedStore = ref<Store | null>(null)
const selectedService = ref<Store['services'][0] | null>(null)
const bookingForm = ref({
  petType: '',
  petSize: '',
  date: '',
  time: '',
  phone: '',
  note: '',
})

// 可用时间段
const availableTimes = [
  '09:00-10:00',
  '10:00-11:00',
  '11:00-12:00',
  '14:00-15:00',
  '15:00-16:00',
  '16:00-17:00',
  '17:00-18:00',
  '18:00-19:00',
]

// 禁用过去的日期
const disabledDate = (time: Date) => {
  return time.getTime() < Date.now() - 8.64e7
}

const handleBookService = (store: Store, service: Store['services'][0]) => {
  selectedStore.value = store
  selectedService.value = service
  bookingDialogVisible.value = true
  moreServicesVisible.value = false
}

const handleViewMore = (store: Store) => {
  selectedStore.value = store
  moreServicesVisible.value = true
}

const handleConfirmBooking = () => {
  const form = bookingForm.value

  if (!form.petType) {
    ElMessage.warning('请选择宠物类型')
    return
  }
  if (!form.petSize) {
    ElMessage.warning('请选择宠物大小')
    return
  }
  if (!form.date) {
    ElMessage.warning('请选择预约日期')
    return
  }
  if (!form.time) {
    ElMessage.warning('请选择预约时间')
    return
  }
  if (!form.phone || !/^1[3-9]\d{9}$/.test(form.phone)) {
    ElMessage.warning('请输入正确的手机号')
    return
  }

  ElMessage.success('预约成功!请按时到店')
  bookingDialogVisible.value = false

  // 重置表单
  bookingForm.value = {
    petType: '',
    petSize: '',
    date: '',
    time: '',
    phone: '',
    note: '',
  }
}
</script>

<style scoped lang="scss">
.grooming-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

// 页面banner
.page-banner {
  text-align: center;
  padding: 40px 20px;
  background: linear-gradient(135deg, #ff6b35, #f7931e);
  color: white;
  border-radius: 12px;
  margin-bottom: 30px;

  h1 {
    font-size: 32px;
    margin: 0 0 10px 0;
  }

  p {
    font-size: 16px;
    margin: 0;
    opacity: 0.9;
  }
}

// 筛选区域
.filter-section {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

  .filter-item {
    display: flex;
    align-items: center;
    gap: 10px;

    &:last-child {
      flex: 1;
    }
  }

  .filter-label {
    color: #6b7280;
    white-space: nowrap;
  }
}

// 店铺列表
.stores-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.store-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s;

  &:hover {
    box-shadow: 0 4px 20px rgba(255, 107, 53, 0.15);
    transform: translateY(-2px);
  }
}

.store-images {
  position: relative;
  height: 200px;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .distance-badge {
    position: absolute;
    top: 15px;
    right: 15px;
    padding: 5px 12px;
    background: rgba(0, 0, 0, 0.7);
    color: white;
    border-radius: 15px;
    font-size: 12px;
  }
}

.store-info {
  padding: 20px;

  .store-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;

    h3 {
      font-size: 20px;
      margin: 0;
    }

    .rating {
      display: flex;
      align-items: center;
      gap: 10px;

      .reviews {
        color: #9ca3af;
        font-size: 14px;
      }
    }
  }

  .store-details {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-bottom: 20px;
  }

  .detail-item {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #6b7280;
    font-size: 14px;

    .el-icon {
      color: #ff6b35;
    }
  }

  .services-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 15px;
  }

  .service-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px;
    background: #f9fafb;
    border-radius: 8px;
  }

  .service-info {
    flex: 1;

    .service-name {
      display: block;
      font-weight: 600;
      margin-bottom: 5px;
    }

    .service-desc {
      display: block;
      color: #9ca3af;
      font-size: 13px;
    }
  }

  .service-action {
    display: flex;
    align-items: center;
    gap: 15px;

    .service-price {
      font-size: 18px;
      font-weight: 600;
      color: #ff6b35;
    }
  }
}

// 预约弹窗
.booking-dialog {
  .booking-info {
    padding: 15px;
    background: #f9fafb;
    border-radius: 8px;
    margin-bottom: 20px;

    h4 {
      margin: 0 0 10px 0;
      font-size: 18px;
    }

    .service-title {
      margin: 0 0 5px 0;
      font-weight: 600;
      color: #ff6b35;
    }

    .service-detail {
      margin: 0;
      color: #6b7280;
      font-size: 14px;
    }
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

// 全部服务弹窗
.all-services {
  max-height: 500px;
  overflow-y: auto;
}

.service-item-full {
  display: flex;
  justify-content: space-between;
  padding: 15px;
  border-bottom: 1px solid #f3f4f6;

  &:last-child {
    border-bottom: none;
  }

  .service-content {
    flex: 1;

    h4 {
      margin: 0 0 8px 0;
      font-size: 16px;
    }

    p {
      margin: 0 0 5px 0;
      color: #6b7280;
      font-size: 14px;
    }

    .duration {
      color: #9ca3af;
      font-size: 12px;
    }
  }

  .service-book {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 10px;

    .price {
      font-size: 20px;
      font-weight: 600;
      color: #ff6b35;
    }
  }
}

// 响应式
@media (max-width: 768px) {
  .grooming-page {
    padding: 15px;
  }

  .page-banner {
    padding: 30px 15px;

    h1 {
      font-size: 24px;
    }
  }

  .filter-section {
    flex-direction: column;

    .filter-item {
      width: 100%;
    }
  }

  .store-header {
    flex-direction: column;
    align-items: flex-start !important;
    gap: 10px;
  }

  .service-item {
    flex-direction: column;
    align-items: flex-start !important;

    .service-action {
      width: 100%;
      justify-content: space-between;
      margin-top: 10px;
    }
  }
}
</style>
