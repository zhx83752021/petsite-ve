<template>
  <LayoutMain>
    <div class="adoption-page">
      <!-- 顶部banner -->
      <div class="hero-banner">
        <div class="hero-content">
          <h1>给它们一个温暖的家</h1>
          <p>每一个小生命都值得被爱,领养代替购买</p>
          <el-button type="primary" size="large" @click="scrollToList">
            浏览可领养宠物
          </el-button>
        </div>
      </div>

      <!-- 统计信息 -->
      <div class="stats-section">
        <div class="stat-item">
          <div class="stat-value">
            1,256
          </div>
          <div class="stat-label">
            待领养宠物
          </div>
        </div>
        <div class="stat-item">
          <div class="stat-value">
            3,845
          </div>
          <div class="stat-label">
            成功案例
          </div>
        </div>
        <div class="stat-item">
          <div class="stat-value">
            98%
          </div>
          <div class="stat-label">
            领养满意度
          </div>
        </div>
        <div class="stat-item">
          <div class="stat-value">
            24h
          </div>
          <div class="stat-label">
            平均响应时间
          </div>
        </div>
      </div>

      <!-- 筛选区域 -->
      <div ref="listSection" class="filter-section">
        <div class="filter-item">
          <span class="filter-label">物种:</span>
          <el-radio-group v-model="filters.species">
            <el-radio-button label="all">
              全部
            </el-radio-button>
            <el-radio-button label="dog">
              狗狗
            </el-radio-button>
            <el-radio-button label="cat">
              猫咪
            </el-radio-button>
            <el-radio-button label="other">
              其他
            </el-radio-button>
          </el-radio-group>
        </div>

        <div class="filter-item">
          <span class="filter-label">年龄:</span>
          <el-radio-group v-model="filters.age">
            <el-radio-button label="all">
              全部
            </el-radio-button>
            <el-radio-button label="young">
              幼年
            </el-radio-button>
            <el-radio-button label="adult">
              成年
            </el-radio-button>
            <el-radio-button label="senior">
              老年
            </el-radio-button>
          </el-radio-group>
        </div>

        <div class="filter-item">
          <span class="filter-label">性别:</span>
          <el-radio-group v-model="filters.gender">
            <el-radio-button label="all">
              全部
            </el-radio-button>
            <el-radio-button label="male">
              公
            </el-radio-button>
            <el-radio-button label="female">
              母
            </el-radio-button>
          </el-radio-group>
        </div>

        <div class="filter-item search">
          <el-input v-model="searchKeyword" placeholder="搜索品种或描述" clearable>
            <template #prefix>
              <el-icon>
                <Search />
              </el-icon>
            </template>
          </el-input>
        </div>
      </div>

      <!-- 宠物列表 -->
      <div class="pets-grid">
        <div v-for="pet in filteredPets" :key="pet.id" class="pet-card" @click="handleViewDetail(pet)">
          <div class="pet-image">
            <img :src="pet.image" :alt="pet.name">
            <div class="pet-badges">
              <span v-if="pet.urgent" class="badge urgent">紧急</span>
              <span v-if="pet.vaccinated" class="badge vaccinated">已免疫</span>
              <span v-if="pet.neutered" class="badge neutered">已绝育</span>
            </div>
          </div>

          <div class="pet-info">
            <h3>{{ pet.name }}</h3>
            <div class="pet-meta">
              <span>{{ pet.breed }}</span>
              <span>{{ pet.ageText }}</span>
              <span>{{ pet.gender === 'male' ? '♂' : '♀' }}</span>
            </div>
            <p class="pet-desc">
              {{ pet.description }}
            </p>
            <div class="pet-footer">
              <span class="location">
                <el-icon>
                  <Location />
                </el-icon>
                {{ pet.location }}
              </span>
              <el-button type="primary" size="small">
                了解详情
              </el-button>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <el-empty v-if="filteredPets.length === 0" description="暂无符合条件的宠物" class="empty-state" />
      </div>

      <!-- 详情弹窗 -->
      <el-dialog v-model="detailVisible" :title="selectedPet?.name" width="800px">
        <div v-if="selectedPet" class="pet-detail">
          <div class="detail-images">
            <el-carousel height="400px">
              <el-carousel-item v-for="(img, idx) in selectedPet.images" :key="idx">
                <img :src="img" :alt="selectedPet.name">
              </el-carousel-item>
            </el-carousel>
          </div>

          <div class="detail-content">
            <div class="detail-header">
              <div>
                <h2>{{ selectedPet.name }}</h2>
                <div class="detail-tags">
                  <el-tag>{{ selectedPet.breed }}</el-tag>
                  <el-tag>{{ selectedPet.ageText }}</el-tag>
                  <el-tag>{{ selectedPet.gender === 'male' ? '公' : '母' }}</el-tag>
                  <el-tag v-if="selectedPet.vaccinated" type="success">
                    已免疫
                  </el-tag>
                  <el-tag v-if="selectedPet.neutered" type="info">
                    已绝育
                  </el-tag>
                </div>
              </div>
            </div>

            <div class="detail-section">
              <h3>基本信息</h3>
              <div class="info-grid">
                <div class="info-item">
                  <span class="label">物种:</span>
                  <span>{{ speciesMap[selectedPet.species] }}</span>
                </div>
                <div class="info-item">
                  <span class="label">品种:</span>
                  <span>{{ selectedPet.breed }}</span>
                </div>
                <div class="info-item">
                  <span class="label">年龄:</span>
                  <span>{{ selectedPet.ageText }}</span>
                </div>
                <div class="info-item">
                  <span class="label">体重:</span>
                  <span>{{ selectedPet.weight }}kg</span>
                </div>
                <div class="info-item">
                  <span class="label">颜色:</span>
                  <span>{{ selectedPet.color }}</span>
                </div>
                <div class="info-item">
                  <span class="label">所在地:</span>
                  <span>{{ selectedPet.location }}</span>
                </div>
              </div>
            </div>

            <div class="detail-section">
              <h3>健康状况</h3>
              <p>{{ selectedPet.healthInfo }}</p>
            </div>

            <div class="detail-section">
              <h3>性格特点</h3>
              <p>{{ selectedPet.personality }}</p>
            </div>

            <div class="detail-section">
              <h3>救助故事</h3>
              <p>{{ selectedPet.story }}</p>
            </div>

            <div class="detail-section">
              <h3>领养要求</h3>
              <ul class="requirements">
                <li v-for="req in selectedPet.requirements" :key="req">
                  {{ req }}
                </li>
              </ul>
            </div>

            <div class="contact-info">
              <div class="contact-item">
                <el-icon>
                  <User />
                </el-icon>
                <span>联系人: {{ selectedPet.contact.name }}</span>
              </div>
              <div class="contact-item">
                <el-icon>
                  <Phone />
                </el-icon>
                <span>电话: {{ selectedPet.contact.phone }}</span>
              </div>
            </div>
          </div>
        </div>

        <template #footer>
          <el-button @click="detailVisible = false">
            关闭
          </el-button>
          <el-button type="primary" @click="handleApplyAdoption">
            申请领养
          </el-button>
        </template>
      </el-dialog>

      <!-- 申请表单弹窗 -->
      <el-dialog v-model="applyVisible" title="领养申请" width="600px">
        <el-form ref="applyFormRef" :model="applyForm" :rules="applyRules" label-width="120px">
          <el-form-item label="您的姓名" prop="name">
            <el-input v-model="applyForm.name" placeholder="请输入真实姓名" />
          </el-form-item>

          <el-form-item label="联系电话" prop="phone">
            <el-input v-model="applyForm.phone" placeholder="请输入手机号" />
          </el-form-item>

          <el-form-item label="年龄" prop="age">
            <el-input-number v-model="applyForm.age" :min="18" :max="100" />
          </el-form-item>

          <el-form-item label="职业" prop="occupation">
            <el-input v-model="applyForm.occupation" />
          </el-form-item>

          <el-form-item label="居住地址" prop="address">
            <el-input v-model="applyForm.address" placeholder="详细地址" />
          </el-form-item>

          <el-form-item label="住房类型" prop="housingType">
            <el-radio-group v-model="applyForm.housingType">
              <el-radio label="owned">
                自有房产
              </el-radio>
              <el-radio label="rented">
                租房
              </el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="是否有院子" prop="hasYard">
            <el-radio-group v-model="applyForm.hasYard">
              <el-radio :label="true">
                是
              </el-radio>
              <el-radio :label="false">
                否
              </el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="养宠经验" prop="experience">
            <el-radio-group v-model="applyForm.experience">
              <el-radio label="none">
                没有经验
              </el-radio>
              <el-radio label="some">
                有一些经验
              </el-radio>
              <el-radio label="rich">
                经验丰富
              </el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="家庭成员" prop="familyMembers">
            <el-input v-model="applyForm.familyMembers" type="textarea" :rows="2" placeholder="请说明家庭成员构成,是否都同意养宠" />
          </el-form-item>

          <el-form-item label="领养理由" prop="reason">
            <el-input v-model="applyForm.reason" type="textarea" :rows="3" placeholder="请说明您想领养这只宠物的原因" />
          </el-form-item>
        </el-form>

        <template #footer>
          <el-button @click="applyVisible = false">
            取消
          </el-button>
          <el-button type="primary" @click="handleSubmitApplication">
            提交申请
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
import { Search, Location, User, Phone } from '@element-plus/icons-vue'

interface AdoptionPet {
  id: string
  name: string
  species: 'dog' | 'cat' | 'other'
  breed: string
  gender: 'male' | 'female'
  age: number
  ageText: string
  weight: number
  color: string
  image: string
  images: string[]
  description: string
  personality: string
  healthInfo: string
  story: string
  location: string
  vaccinated: boolean
  neutered: boolean
  urgent: boolean
  requirements: string[]
  contact: {
    name: string
    phone: string
  }
}

// 筛选条件
const filters = ref({
  species: 'all',
  age: 'all',
  gender: 'all',
})

const searchKeyword = ref('')
const listSection = ref<HTMLElement>()

// 模拟数据
const pets = ref<AdoptionPet[]>([
  {
    id: '1',
    name: '旺财',
    species: 'dog',
    breed: '金毛',
    gender: 'male',
    age: 2,
    ageText: '2岁',
    weight: 28,
    color: '金色',
    image: 'https://images.unsplash.com/photo-1633722715463-d30f4f325e24?w=400&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1633722715463-d30f4f325e24?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1615751072497-5f5169febe17?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1558788353-f76d92427f16?w=800&h=600&fit=crop',
    ],
    description: '温顺友好的金毛犬,喜欢和人互动',
    personality: '性格温和,对人友善,喜欢玩耍,训练有素,适合家庭饲养',
    healthInfo: '健康状况良好,已完成所有疫苗接种和体内外驱虫',
    story: '旺财是一只被遗弃的金毛,在街头流浪时被好心人发现并送到救助站。它非常亲人,期待找到一个温暖的家。',
    location: '北京朝阳区',
    vaccinated: true,
    neutered: true,
    urgent: false,
    requirements: [
      '有稳定的住所和收入',
      '家人都同意养宠',
      '能够提供足够的活动空间',
      '承诺不离不弃',
    ],
    contact: {
      name: '张女士',
      phone: '138****1234',
    },
  },
  {
    id: '2',
    name: '小橘',
    species: 'cat',
    breed: '橘猫',
    gender: 'female',
    age: 1,
    ageText: '1岁',
    weight: 4,
    color: '橘色',
    image: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1573865526739-10c1d3a1f0cc?w=800&h=600&fit=crop',
    ],
    description: '活泼可爱的小橘猫,会用猫砂',
    personality: '活泼好动,偶尔会撒娇,喜欢追逐玩具,适应能力强',
    healthInfo: '健康状况良好,已接种疫苗',
    story: '小橘在小区里流浪,经常挨饿受冻,被爱心人士救助后变得非常亲人。',
    location: '上海浦东新区',
    vaccinated: true,
    neutered: false,
    urgent: true,
    requirements: [
      '有养猫经验者优先',
      '封闭阳台和窗户',
      '定期体检和免疫',
    ],
    contact: {
      name: '李先生',
      phone: '139****5678',
    },
  },
  {
    id: '3',
    name: '黑妞',
    species: 'dog',
    breed: '拉布拉多',
    gender: 'female',
    age: 3,
    ageText: '3岁',
    weight: 25,
    color: '黑色',
    image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&h=600&fit=crop',
    ],
    description: '聪明温顺的拉布拉多',
    personality: '非常聪明,容易训练,性格稳重,对小孩友好',
    healthInfo: '健康,已绝育',
    story: '因主人工作变动无法继续饲养,希望为它找到一个新家。',
    location: '广州天河区',
    vaccinated: true,
    neutered: true,
    urgent: false,
    requirements: [
      '有独立住房',
      '每天能够保证遛狗时间',
      '不频繁出差',
    ],
    contact: {
      name: '王女士',
      phone: '136****9012',
    },
  },
  {
    id: '4',
    name: '咪咪',
    species: 'cat',
    breed: '美短',
    gender: 'female',
    age: 5,
    ageText: '5岁',
    weight: 4.5,
    color: '银色虎斑',
    image: 'https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8?w=400&h=400&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8?w=800&h=600&fit=crop',
    ],
    description: '安静乖巧的美短猫',
    personality: '性格安静,独立性强,不粘人但也不排斥互动',
    healthInfo: '健康良好',
    story: '原主人搬家到不允许养宠的小区,只能忍痛送养。',
    location: '深圳南山区',
    vaccinated: true,
    neutered: true,
    urgent: true,
    requirements: [
      '有稳定住所',
      '定期体检',
      '科学喂养',
    ],
    contact: {
      name: '陈先生',
      phone: '137****3456',
    },
  },
])

const speciesMap = {
  dog: '狗狗',
  cat: '猫咪',
  other: '其他',
}

// 筛选后的宠物列表
const filteredPets = computed(() => {
  let result = pets.value

  // 按物种筛选
  if (filters.value.species !== 'all') {
    result = result.filter((p) => p.species === filters.value.species)
  }

  // 按年龄筛选
  if (filters.value.age !== 'all') {
    result = result.filter((p) => {
      if (filters.value.age === 'young') return p.age < 2
      if (filters.value.age === 'adult') return p.age >= 2 && p.age < 7
      if (filters.value.age === 'senior') return p.age >= 7
      return true
    })
  }

  // 按性别筛选
  if (filters.value.gender !== 'all') {
    result = result.filter((p) => p.gender === filters.value.gender)
  }

  // 按关键词搜索
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(
      (p) =>
        p.breed.toLowerCase().includes(keyword) ||
        p.description.toLowerCase().includes(keyword) ||
        p.name.toLowerCase().includes(keyword)
    )
  }

  return result
})

// 详情相关
const detailVisible = ref(false)
const selectedPet = ref<AdoptionPet | null>(null)

const handleViewDetail = (pet: AdoptionPet) => {
  selectedPet.value = pet
  detailVisible.value = true
}

const scrollToList = () => {
  listSection.value?.scrollIntoView({ behavior: 'smooth' })
}

// 申请相关
const applyVisible = ref(false)
const applyFormRef = ref<FormInstance>()
const applyForm = ref({
  name: '',
  phone: '',
  age: 25,
  occupation: '',
  address: '',
  housingType: 'owned',
  hasYard: false,
  experience: 'some',
  familyMembers: '',
  reason: '',
})

const applyRules: FormRules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' },
  ],
  address: [{ required: true, message: '请输入地址', trigger: 'blur' }],
  familyMembers: [{ required: true, message: '请说明家庭成员情况', trigger: 'blur' }],
  reason: [{ required: true, message: '请说明领养理由', trigger: 'blur' }],
}

const handleApplyAdoption = () => {
  detailVisible.value = false
  applyVisible.value = true
}

const handleSubmitApplication = async () => {
  if (!applyFormRef.value) return

  try {
    await applyFormRef.value.validate()

    ElMessage.success('申请已提交!我们会尽快与您联系')
    applyVisible.value = false

    // 重置表单
    applyFormRef.value.resetFields()
  } catch (error) {
    ElMessage.warning('请完善申请信息')
  }
}
</script>

<style scoped lang="scss">
.adoption-page {
  min-height: 100vh;
  background: #f9fafb;
}

// Hero Banner
.hero-banner {
  height: 500px;
  background: linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)),
    url('https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=1600&h=600&fit=crop') center/cover;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  text-align: center;
  margin-bottom: 50px;

  .hero-content {
    h1 {
      font-size: 48px;
      margin: 0 0 20px 0;
      font-weight: 700;
    }

    p {
      font-size: 20px;
      margin: 0 0 30px 0;
      opacity: 0.95;
    }
  }
}

// 统计信息
.stats-section {
  max-width: 1200px;
  margin: -80px auto 50px;
  padding: 0 20px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;

  .stat-item {
    background: white;
    padding: 30px;
    border-radius: 12px;
    text-align: center;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);

    .stat-value {
      font-size: 36px;
      font-weight: 700;
      color: #ff6b35;
      margin-bottom: 10px;
    }

    .stat-label {
      color: #6b7280;
      font-size: 14px;
    }
  }
}

// 筛选区域
.filter-section {
  max-width: 1200px;
  margin: 0 auto 30px;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

  .filter-item {
    display: flex;
    align-items: center;
    gap: 15px;
    margin-bottom: 15px;

    &:last-child {
      margin-bottom: 0;
    }

    &.search {
      margin-top: 10px;
    }

    .filter-label {
      color: #374151;
      font-weight: 500;
      min-width: 50px;
    }
  }
}

// 宠物列表
.pets-grid {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px 50px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 25px;

  .empty-state {
    grid-column: 1 / -1;
  }
}

.pet-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 24px rgba(255, 107, 53, 0.2);
  }

  .pet-image {
    position: relative;
    height: 250px;
    overflow: hidden;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s;
    }

    &:hover img {
      transform: scale(1.05);
    }

    .pet-badges {
      position: absolute;
      top: 10px;
      right: 10px;
      display: flex;
      flex-direction: column;
      gap: 5px;

      .badge {
        padding: 4px 10px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: 500;

        &.urgent {
          background: #ef4444;
          color: white;
        }

        &.vaccinated {
          background: #10b981;
          color: white;
        }

        &.neutered {
          background: #3b82f6;
          color: white;
        }
      }
    }
  }

  .pet-info {
    padding: 20px;

    h3 {
      margin: 0 0 10px 0;
      font-size: 20px;
      color: #1f2937;
    }

    .pet-meta {
      display: flex;
      gap: 12px;
      margin-bottom: 12px;
      color: #6b7280;
      font-size: 14px;

      span {
        &:not(:last-child)::after {
          content: '•';
          margin-left: 12px;
        }
      }
    }

    .pet-desc {
      color: #6b7280;
      font-size: 14px;
      line-height: 1.6;
      margin: 0 0 15px 0;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .pet-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .location {
        display: flex;
        align-items: center;
        gap: 5px;
        color: #9ca3af;
        font-size: 13px;
      }
    }
  }
}

// 详情弹窗
.pet-detail {
  .detail-images {
    margin-bottom: 30px;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  .detail-content {
    .detail-header {
      margin-bottom: 25px;

      h2 {
        margin: 0 0 15px 0;
        font-size: 28px;
        color: #1f2937;
      }

      .detail-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
      }
    }

    .detail-section {
      margin-bottom: 25px;

      h3 {
        font-size: 18px;
        margin: 0 0 12px 0;
        color: #374151;
      }

      p {
        color: #6b7280;
        line-height: 1.8;
        margin: 0;
      }

      .info-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 15px;

        .info-item {
          display: flex;
          gap: 10px;

          .label {
            color: #9ca3af;
            min-width: 60px;
          }
        }
      }

      .requirements {
        list-style: none;
        padding: 0;
        margin: 0;

        li {
          padding: 8px 0;
          color: #6b7280;
          border-bottom: 1px solid #f3f4f6;

          &::before {
            content: '✓';
            color: #10b981;
            font-weight: bold;
            margin-right: 10px;
          }

          &:last-child {
            border-bottom: none;
          }
        }
      }
    }

    .contact-info {
      padding: 20px;
      background: #f9fafb;
      border-radius: 8px;
      display: flex;
      gap: 30px;

      .contact-item {
        display: flex;
        align-items: center;
        gap: 8px;
        color: #374151;

        .el-icon {
          color: #ff6b35;
        }
      }
    }
  }
}

// 响应式
@media (max-width: 768px) {
  .hero-banner {
    height: 300px;

    .hero-content {
      padding: 0 20px;

      h1 {
        font-size: 28px;
      }

      p {
        font-size: 16px;
      }
    }
  }

  .stats-section {
    grid-template-columns: repeat(2, 1fr);
    margin-top: -50px;
  }

  .filter-section {
    .filter-item {
      flex-direction: column;
      align-items: flex-start;

      .filter-label {
        margin-bottom: 5px;
      }

      :deep(.el-radio-group) {
        width: 100%;
        display: flex;
        flex-wrap: wrap;
      }
    }
  }

  .pets-grid {
    grid-template-columns: 1fr;
  }

  .detail-section .info-grid {
    grid-template-columns: 1fr !important;
  }

  .contact-info {
    flex-direction: column !important;
    gap: 15px !important;
  }
}
</style>
