<template>
  <LayoutMain>
    <div class="boarding-page">
      <!-- 顶部介绍 -->
      <div class="page-header">
        <h1>宠物寄养服务</h1>
        <p>专业照护,让您的爱宠享受舒适假期</p>
      </div>

      <!-- 服务特色 -->
      <div class="features-section">
        <div class="feature-card">
          <div class="feature-icon">
            🏠
          </div>
          <h3>独立空间</h3>
          <p>每只宠物都有独立的活动空间</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">
            👨‍⚕️
          </div>
          <h3>专业照护</h3>
          <p>经验丰富的护理团队24小时照看</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">
            📹
          </div>
          <h3>实时监控</h3>
          <p>手机APP随时查看宠物状态</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">
            🍖
          </div>
          <h3>营养膳食</h3>
          <p>根据宠物习惯定制饮食方案</p>
        </div>
      </div>

      <!-- 套餐选择 -->
      <div class="packages-section">
        <h2 class="section-title">
          寄养套餐
        </h2>
        <div class="packages-grid">
          <div v-for="pkg in packages" :key="pkg.id" :class="['package-card', { recommended: pkg.recommended }]">
            <div v-if="pkg.recommended" class="recommend-badge">
              推荐
            </div>
            <h3>{{ pkg.name }}</h3>
            <div class="package-price">
              <span class="price">¥{{ pkg.price }}</span>
              <span class="unit">/天</span>
            </div>
            <ul class="package-features">
              <li v-for="(feature, index) in pkg.features" :key="index">
                <el-icon color="#10b981">
                  <CircleCheck />
                </el-icon>
                <span>{{ feature }}</span>
              </li>
            </ul>
            <el-button :type="pkg.recommended ? 'primary' : 'default'" size="large" @click="handleSelectPackage(pkg)">
              选择套餐
            </el-button>
          </div>
        </div>
      </div>

      <!-- 预约表单弹窗 -->
      <el-dialog v-model="bookingVisible" title="预约寄养" width="600px">
        <div v-if="selectedPackage" class="booking-content">
          <div class="selected-package">
            <h4>{{ selectedPackage.name }}</h4>
            <p>¥{{ selectedPackage.price }}/天</p>
          </div>

          <el-form ref="formRef" :model="bookingForm" :rules="formRules" label-width="100px">
            <el-form-item label="宠物名称" prop="petName">
              <el-input v-model="bookingForm.petName" placeholder="请输入宠物名称" />
            </el-form-item>

            <el-form-item label="宠物类型" prop="petType">
              <el-select v-model="bookingForm.petType" placeholder="请选择">
                <el-option label="狗狗" value="dog" />
                <el-option label="猫咪" value="cat" />
                <el-option label="其他" value="other" />
              </el-select>
            </el-form-item>

            <el-form-item label="品种" prop="breed">
              <el-input v-model="bookingForm.breed" placeholder="如:金毛、橘猫等" />
            </el-form-item>

            <el-form-item label="年龄/体重" prop="ageWeight">
              <el-row :gutter="10">
                <el-col :span="12">
                  <el-input v-model="bookingForm.age" placeholder="年龄">
                    <template #append>
                      岁
                    </template>
                  </el-input>
                </el-col>
                <el-col :span="12">
                  <el-input v-model="bookingForm.weight" placeholder="体重">
                    <template #append>
                      kg
                    </template>
                  </el-input>
                </el-col>
              </el-row>
            </el-form-item>

            <el-form-item label="寄养时间" prop="dateRange">
              <el-date-picker v-model="bookingForm.dateRange" type="daterange" range-separator="至"
                start-placeholder="开始日期" end-placeholder="结束日期" :disabled-date="disabledDate" style="width: 100%" />
            </el-form-item>

            <el-form-item label="联系方式" prop="phone">
              <el-input v-model="bookingForm.phone" placeholder="请输入手机号" />
            </el-form-item>

            <el-form-item label="紧急联系人" prop="emergencyContact">
              <el-row :gutter="10">
                <el-col :span="12">
                  <el-input v-model="bookingForm.emergencyName" placeholder="姓名" />
                </el-col>
                <el-col :span="12">
                  <el-input v-model="bookingForm.emergencyPhone" placeholder="电话" />
                </el-col>
              </el-row>
            </el-form-item>

            <el-form-item label="健康状况">
              <el-checkbox-group v-model="bookingForm.healthStatus">
                <el-checkbox label="已接种疫苗" />
                <el-checkbox label="已绝育" />
                <el-checkbox label="有过敏史" />
                <el-checkbox label="正在服药" />
              </el-checkbox-group>
            </el-form-item>

            <el-form-item label="饮食习惯">
              <el-input v-model="bookingForm.dietNotes" type="textarea" :rows="3" placeholder="请说明宠物的饮食偏好、喂食时间等" />
            </el-form-item>

            <el-form-item label="特殊说明">
              <el-input v-model="bookingForm.specialNotes" type="textarea" :rows="3" placeholder="其他需要注意的事项" />
            </el-form-item>
          </el-form>

          <div class="price-summary">
            <div class="summary-item">
              <span>寄养天数</span>
              <span>{{ boardingDays }}天</span>
            </div>
            <div class="summary-item">
              <span>每日费用</span>
              <span>¥{{ selectedPackage.price }}</span>
            </div>
            <div class="summary-item total">
              <span>合计</span>
              <span class="total-price">¥{{ totalPrice }}</span>
            </div>
          </div>
        </div>

        <template #footer>
          <el-button @click="bookingVisible = false">
            取消
          </el-button>
          <el-button type="primary" @click="handleSubmitBooking">
            确认预约
          </el-button>
        </template>
      </el-dialog>
    </div>
  </LayoutMain>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import LayoutMain from '@/components/LayoutMain.vue'
import { ElMessage, FormInstance, FormRules } from 'element-plus'
import { CircleCheck } from '@element-plus/icons-vue'

interface Package {
  id: string
  name: string
  price: number
  features: string[]
  recommended?: boolean
}

// 套餐数据
const packages = ref<Package[]>([
  {
    id: '1',
    name: '基础套餐',
    price: 80,
    features: [
      '独立笼舍',
      '每日2次喂食',
      '每日清洁',
      '基础玩耍时间',
      '每日健康检查',
    ],
  },
  {
    id: '2',
    name: '舒适套餐',
    price: 120,
    features: [
      '独立房间',
      '每日3次喂食',
      '每日清洁',
      '每日户外活动1小时',
      '每日健康检查',
      '视频监控',
      '每日照片/视频更新',
    ],
    recommended: true,
  },
  {
    id: '3',
    name: 'VIP套餐',
    price: 200,
    features: [
      '豪华套房',
      '定制饮食方案',
      '每日清洁消毒',
      '每日户外活动2小时',
      '每日健康检查',
      '24小时视频监控',
      '每日照片/视频更新',
      '专属护理员',
      '免费洗澡1次',
    ],
  },
])

// 预约相关
const bookingVisible = ref(false)
const selectedPackage = ref<Package | null>(null)
const formRef = ref<FormInstance>()

const bookingForm = ref({
  petName: '',
  petType: '',
  breed: '',
  age: '',
  weight: '',
  dateRange: [] as Date[],
  phone: '',
  emergencyName: '',
  emergencyPhone: '',
  healthStatus: [] as string[],
  dietNotes: '',
  specialNotes: '',
})

const formRules: FormRules = {
  petName: [{ required: true, message: '请输入宠物名称', trigger: 'blur' }],
  petType: [{ required: true, message: '请选择宠物类型', trigger: 'change' }],
  breed: [{ required: true, message: '请输入品种', trigger: 'blur' }],
  dateRange: [{ required: true, message: '请选择寄养时间', trigger: 'change' }],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' },
  ],
}

// 计算寄养天数
const boardingDays = computed(() => {
  if (bookingForm.value.dateRange && bookingForm.value.dateRange.length === 2) {
    const start = new Date(bookingForm.value.dateRange[0])
    const end = new Date(bookingForm.value.dateRange[1])
    const diff = end.getTime() - start.getTime()
    return Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1
  }
  return 0
})

// 计算总价
const totalPrice = computed(() => {
  if (selectedPackage.value && boardingDays.value > 0) {
    return selectedPackage.value.price * boardingDays.value
  }
  return 0
})

// 禁用过去的日期
const disabledDate = (time: Date) => {
  return time.getTime() < Date.now() - 8.64e7
}

const handleSelectPackage = (pkg: Package) => {
  selectedPackage.value = pkg
  bookingVisible.value = true
}

const handleSubmitBooking = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()

    if (boardingDays.value === 0) {
      ElMessage.warning('请选择寄养时间')
      return
    }

    // 这里应该调用API提交预约
    ElMessage.success('预约成功!我们会尽快与您联系确认')
    bookingVisible.value = false

    // 重置表单
    formRef.value.resetFields()
  } catch (error) {
    ElMessage.warning('请完善表单信息')
  }
}
</script>

<style scoped lang="scss">
.boarding-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

// 页面头部
.page-header {
  text-align: center;
  padding: 50px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 16px;
  margin-bottom: 40px;

  h1 {
    font-size: 36px;
    margin: 0 0 15px 0;
    font-weight: 700;
  }

  p {
    font-size: 18px;
    margin: 0;
    opacity: 0.95;
  }
}

// 特色功能
.features-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 50px;
}

.feature-card {
  text-align: center;
  padding: 30px 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  transition: all 0.3s;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 24px rgba(102, 126, 234, 0.15);
  }

  .feature-icon {
    font-size: 48px;
    margin-bottom: 15px;
  }

  h3 {
    font-size: 18px;
    margin: 0 0 10px 0;
    color: #1f2937;
  }

  p {
    margin: 0;
    color: #6b7280;
    font-size: 14px;
    line-height: 1.6;
  }
}

// 套餐区域
.packages-section {
  margin-bottom: 50px;

  .section-title {
    text-align: center;
    font-size: 28px;
    margin: 0 0 30px 0;
    color: #1f2937;
  }
}

.packages-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
}

.package-card {
  position: relative;
  padding: 30px;
  background: white;
  border-radius: 16px;
  border: 2px solid #e5e7eb;
  transition: all 0.3s;

  &:hover {
    border-color: #667eea;
    box-shadow: 0 10px 30px rgba(102, 126, 234, 0.2);
    transform: translateY(-5px);
  }

  &.recommended {
    border-color: #667eea;
    background: linear-gradient(135deg, #f5f7ff 0%, #ffffff 100%);

    .recommend-badge {
      position: absolute;
      top: -10px;
      right: 30px;
      padding: 5px 15px;
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
    }
  }

  h3 {
    text-align: center;
    font-size: 24px;
    margin: 0 0 20px 0;
    color: #1f2937;
  }

  .package-price {
    text-align: center;
    margin-bottom: 25px;

    .price {
      font-size: 40px;
      font-weight: 700;
      color: #667eea;
    }

    .unit {
      font-size: 16px;
      color: #9ca3af;
      margin-left: 5px;
    }
  }

  .package-features {
    list-style: none;
    padding: 0;
    margin: 0 0 25px 0;

    li {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 0;
      color: #4b5563;
      font-size: 15px;
      border-bottom: 1px solid #f3f4f6;

      &:last-child {
        border-bottom: none;
      }

      .el-icon {
        font-size: 18px;
        flex-shrink: 0;
      }
    }
  }

  .el-button {
    width: 100%;
  }
}

// 预约弹窗
.booking-content {
  .selected-package {
    padding: 20px;
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white;
    border-radius: 12px;
    margin-bottom: 25px;
    text-align: center;

    h4 {
      margin: 0 0 5px 0;
      font-size: 20px;
    }

    p {
      margin: 0;
      font-size: 16px;
      opacity: 0.95;
    }
  }

  .price-summary {
    padding: 20px;
    background: #f9fafb;
    border-radius: 12px;
    margin-top: 20px;

    .summary-item {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      color: #6b7280;
      font-size: 15px;

      &.total {
        border-top: 2px solid #e5e7eb;
        padding-top: 15px;
        margin-top: 10px;
        color: #1f2937;
        font-weight: 600;
        font-size: 18px;

        .total-price {
          color: #667eea;
          font-size: 24px;
        }
      }
    }
  }
}

// 响应式
@media (max-width: 768px) {
  .boarding-page {
    padding: 15px;
  }

  .page-header {
    padding: 30px 15px;

    h1 {
      font-size: 24px;
    }

    p {
      font-size: 14px;
    }
  }

  .features-section {
    grid-template-columns: repeat(2, 1fr);
    gap: 15px;
  }

  .feature-card {
    padding: 20px 15px;

    .feature-icon {
      font-size: 36px;
    }

    h3 {
      font-size: 16px;
    }

    p {
      font-size: 13px;
    }
  }

  .packages-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .section-title {
    font-size: 22px !important;
  }
}
</style>
