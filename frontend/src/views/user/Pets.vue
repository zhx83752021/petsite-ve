<template>
  <div class="pets-page">
    <div class="page-header">
      <h2>宠物档案</h2>
      <el-button type="primary" @click="addDialogVisible = true">
        <el-icon><Plus /></el-icon>
        添加宠物
      </el-button>
    </div>

    <!-- 宠物列表 -->
    <div v-if="pets.length > 0" class="pets-list">
      <div
        v-for="pet in pets"
        :key="pet.id"
        class="pet-card"
        @click="handleViewDetail(pet)"
      >
        <img :src="pet.avatar" :alt="pet.name" class="pet-avatar" />
        <div class="pet-basic">
          <h3>{{ pet.name }}</h3>
          <div class="pet-tags">
            <el-tag size="small">{{ speciesMap[pet.species] }}</el-tag>
            <el-tag size="small" type="info">{{ pet.breed }}</el-tag>
            <el-tag size="small" type="success">{{ pet.gender === 'male' ? '♂' : '♀' }}</el-tag>
          </div>
          <p class="pet-age">{{ calculateAge(pet.birthday) }}</p>
        </div>
        <div class="pet-actions">
          <el-button size="small" @click.stop="handleEdit(pet)">编辑</el-button>
          <el-button size="small" type="danger" @click.stop="handleDelete(pet.id)">
            删除
          </el-button>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <el-empty
      v-else
      description="还没有添加宠物档案"
    >
      <el-button type="primary" @click="addDialogVisible = true">
        添加第一个宠物
      </el-button>
    </el-empty>

    <!-- 添加/编辑宠物弹窗 -->
    <el-dialog
      v-model="addDialogVisible"
      :title="editingPet ? '编辑宠物' : '添加宠物'"
      width="600px"
    >
      <el-form
        ref="formRef"
        :model="petForm"
        :rules="formRules"
        label-width="100px"
      >
        <el-form-item label="宠物头像">
          <el-upload
            class="avatar-uploader"
            action="#"
            :show-file-list="false"
            :auto-upload="false"
            accept="image/*"
            @change="handleAvatarChange"
          >
            <img v-if="petForm.avatar" :src="petForm.avatar" class="avatar" />
            <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
          </el-upload>
        </el-form-item>

        <el-form-item label="宠物名称" prop="name">
          <el-input v-model="petForm.name" placeholder="请输入宠物名称" />
        </el-form-item>

        <el-form-item label="物种" prop="species">
          <el-radio-group v-model="petForm.species">
            <el-radio label="dog">狗狗</el-radio>
            <el-radio label="cat">猫咪</el-radio>
            <el-radio label="other">其他</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="品种" prop="breed">
          <el-input v-model="petForm.breed" placeholder="如:金毛、橘猫等" />
        </el-form-item>

        <el-form-item label="性别" prop="gender">
          <el-radio-group v-model="petForm.gender">
            <el-radio label="male">公</el-radio>
            <el-radio label="female">母</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="生日" prop="birthday">
          <el-date-picker
            v-model="petForm.birthday"
            type="date"
            placeholder="选择生日"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="体重(kg)">
          <el-input-number
            v-model="petForm.weight"
            :min="0.1"
            :max="200"
            :precision="1"
            :step="0.1"
          />
        </el-form-item>

        <el-form-item label="是否绝育">
          <el-switch v-model="petForm.isNeutered" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="addDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">
          确定
        </el-button>
      </template>
    </el-dialog>

    <!-- 详情弹窗 -->
    <el-dialog
      v-model="detailVisible"
      :title="selectedPet?.name"
      width="800px"
    >
      <div v-if="selectedPet" class="pet-detail">
        <el-tabs>
          <el-tab-pane label="基本信息">
            <div class="detail-section">
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
                  <span class="label">性别:</span>
                  <span>{{ selectedPet.gender === 'male' ? '公' : '母' }}</span>
                </div>
                <div class="info-item">
                  <span class="label">生日:</span>
                  <span>{{ selectedPet.birthday }}</span>
                </div>
                <div class="info-item">
                  <span class="label">年龄:</span>
                  <span>{{ calculateAge(selectedPet.birthday) }}</span>
                </div>
                <div class="info-item">
                  <span class="label">体重:</span>
                  <span>{{ selectedPet.weight }}kg</span>
                </div>
                <div class="info-item">
                  <span class="label">绝育:</span>
                  <span>{{ selectedPet.isNeutered ? '已绝育' : '未绝育' }}</span>
                </div>
              </div>
            </div>
          </el-tab-pane>

          <el-tab-pane label="健康记录">
            <div class="health-records">
              <el-button type="primary" size="small" style="margin-bottom: 15px">
                添加记录
              </el-button>
              <el-timeline>
                <el-timeline-item
                  v-for="record in selectedPet.healthRecords"
                  :key="record.date"
                  :timestamp="record.date"
                >
                  <p><strong>{{ record.item }}</strong></p>
                  <p>医院: {{ record.hospital }}</p>
                  <p v-if="record.nextDate">下次: {{ record.nextDate }}</p>
                </el-timeline-item>
              </el-timeline>
            </div>
          </el-tab-pane>

          <el-tab-pane label="照片相册">
            <div class="photo-gallery">
              <el-button type="primary" size="small" style="margin-bottom: 15px">
                上传照片
              </el-button>
              <div class="gallery-grid">
                <img
                  v-for="(photo, index) in selectedPet.photos"
                  :key="index"
                  :src="photo"
                  class="gallery-img"
                />
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox, FormInstance, FormRules } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import type { Pet } from '@/types'

// 模拟数据
const pets = ref<Pet[]>([
  {
    id: '1',
    avatar: 'https://images.unsplash.com/photo-1633722715463-d30f4f325e24?w=200&h=200&fit=crop',
    name: '旺财',
    species: 'dog',
    breed: '金毛',
    gender: 'male',
    birthday: '2021-05-15',
    weight: 28,
    isNeutered: true,
    healthRecords: [
      {
        type: 'vaccine',
        date: '2024-01-15',
        item: '狂犬疫苗',
        hospital: '宠爱动物医院',
        nextDate: '2025-01-15',
      },
      {
        type: 'checkup',
        date: '2024-06-20',
        item: '常规体检',
        hospital: '宠爱动物医院',
      },
    ],
    photos: [
      'https://images.unsplash.com/photo-1633722715463-d30f4f325e24?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1615751072497-5f5169febe17?w=400&h=400&fit=crop',
      'https://images.unsplash.com/photo-1558788353-f76d92427f16?w=400&h=400&fit=crop',
    ],
    diaries: [],
  },
  {
    id: '2',
    avatar: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=200&h=200&fit=crop',
    name: '小橘',
    species: 'cat',
    breed: '橘猫',
    gender: 'female',
    birthday: '2022-08-10',
    weight: 4.5,
    isNeutered: false,
    healthRecords: [
      {
        type: 'vaccine',
        date: '2024-03-10',
        item: '猫三联',
        hospital: '爱宠宠物医院',
        nextDate: '2025-03-10',
      },
    ],
    photos: [
      'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400&h=400&fit=crop',
    ],
    diaries: [],
  },
])

const speciesMap = {
  dog: '狗狗',
  cat: '猫咪',
  other: '其他',
}

// 表单相关
const addDialogVisible = ref(false)
const editingPet = ref<Pet | null>(null)
const formRef = ref<FormInstance>()

const petForm = reactive({
  avatar: '',
  name: '',
  species: 'dog' as 'dog' | 'cat' | 'other',
  breed: '',
  gender: 'male' as 'male' | 'female',
  birthday: '',
  weight: 5,
  isNeutered: false,
})

const formRules: FormRules = {
  name: [{ required: true, message: '请输入宠物名称', trigger: 'blur' }],
  species: [{ required: true, message: '请选择物种', trigger: 'change' }],
  breed: [{ required: true, message: '请输入品种', trigger: 'blur' }],
  birthday: [{ required: true, message: '请选择生日', trigger: 'change' }],
}

// 详情相关
const detailVisible = ref(false)
const selectedPet = ref<Pet | null>(null)

// 计算年龄
const calculateAge = (birthday: string) => {
  const birth = new Date(birthday)
  const now = new Date()
  const years = now.getFullYear() - birth.getFullYear()
  const months = now.getMonth() - birth.getMonth()

  if (years === 0) {
    return `${months}个月`
  } else if (months < 0) {
    return `${years - 1}岁${12 + months}个月`
  } else {
    return `${years}岁${months}个月`
  }
}

// 头像上传
const handleAvatarChange = (file: any) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    petForm.avatar = e.target?.result as string
  }
  reader.readAsDataURL(file.raw)
}

// 查看详情
const handleViewDetail = (pet: Pet) => {
  selectedPet.value = pet
  detailVisible.value = true
}

// 编辑
const handleEdit = (pet: Pet) => {
  editingPet.value = pet
  Object.assign(petForm, {
    avatar: pet.avatar,
    name: pet.name,
    species: pet.species,
    breed: pet.breed,
    gender: pet.gender,
    birthday: pet.birthday,
    weight: pet.weight,
    isNeutered: pet.isNeutered,
  })
  addDialogVisible.value = true
}

// 删除
const handleDelete = async (id: string) => {
  try {
    await ElMessageBox.confirm('确定要删除这只宠物的档案吗?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    const index = pets.value.findIndex((p) => p.id === id)
    if (index > -1) {
      pets.value.splice(index, 1)
      ElMessage.success('删除成功')
    }
  } catch {
    // 取消删除
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()

    if (editingPet.value) {
      // 编辑
      const index = pets.value.findIndex((p) => p.id === editingPet.value!.id)
      if (index > -1) {
        Object.assign(pets.value[index], {
          ...petForm,
        })
        ElMessage.success('编辑成功')
      }
    } else {
      // 新增
      const newPet: Pet = {
        id: Date.now().toString(),
        ...petForm,
        healthRecords: [],
        photos: petForm.avatar ? [petForm.avatar] : [],
        diaries: [],
      }
      pets.value.push(newPet)
      ElMessage.success('添加成功')
    }

    addDialogVisible.value = false
    resetForm()
  } catch (error) {
    ElMessage.warning('请完善表单信息')
  }
}

// 重置表单
const resetForm = () => {
  editingPet.value = null
  formRef.value?.resetFields()
  Object.assign(petForm, {
    avatar: '',
    name: '',
    species: 'dog',
    breed: '',
    gender: 'male',
    birthday: '',
    weight: 5,
    isNeutered: false,
  })
}
</script>

<style scoped lang="scss">
.pets-page {
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

  .pets-list {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .pet-card {
    display: flex;
    align-items: center;
    gap: 20px;
    padding: 20px;
    background: #f9fafb;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.3s;

    &:hover {
      background: #f3f4f6;
      transform: translateX(5px);
    }

    .pet-avatar {
      width: 80px;
      height: 80px;
      border-radius: 12px;
      object-fit: cover;
      flex-shrink: 0;
    }

    .pet-basic {
      flex: 1;

      h3 {
        margin: 0 0 10px 0;
        font-size: 18px;
        color: #1f2937;
      }

      .pet-tags {
        display: flex;
        gap: 8px;
        margin-bottom: 8px;
      }

      .pet-age {
        margin: 0;
        color: #6b7280;
        font-size: 14px;
      }
    }

    .pet-actions {
      display: flex;
      gap: 10px;
    }
  }
}

// 头像上传
.avatar-uploader {
  .avatar {
    width: 100px;
    height: 100px;
    border-radius: 8px;
    object-fit: cover;
    display: block;
  }

  :deep(.el-upload) {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition: all 0.3s;

    &:hover {
      border-color: #ff6b35;
    }
  }

  .avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 100px;
    height: 100px;
    text-align: center;
    line-height: 100px;
  }
}

// 详情
.pet-detail {
  .detail-section {
    padding: 20px 0;
  }

  .info-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;

    .info-item {
      display: flex;
      gap: 10px;

      .label {
        color: #9ca3af;
        min-width: 60px;
      }
    }
  }

  .health-records {
    padding: 20px 0;
  }

  .photo-gallery {
    padding: 20px 0;

    .gallery-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: 15px;

      .gallery-img {
        width: 100%;
        height: 150px;
        object-fit: cover;
        border-radius: 8px;
        cursor: pointer;
        transition: transform 0.3s;

        &:hover {
          transform: scale(1.05);
        }
      }
    }
  }
}

// 响应式
@media (max-width: 768px) {
  .pet-card {
    flex-direction: column;
    text-align: center;

    .pet-basic {
      .pet-tags {
        justify-content: center;
      }
    }

    .pet-actions {
      width: 100%;
      justify-content: center;
    }
  }

  .info-grid {
    grid-template-columns: 1fr !important;
  }
}
</style>
