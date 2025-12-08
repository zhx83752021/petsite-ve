<template>
  <div class="admin-brands">
    <h2 class="page-title">品牌管理</h2>

    <el-card shadow="never" class="table-card">
      <el-table v-loading="loading" :data="brandList" style="width: 100%" stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="品牌名称" width="200" />
        <el-table-column prop="logo" label="Logo" width="150">
          <template #default="{ row }">
            <el-image
              v-if="row.logo"
              :src="row.logo"
              style="width: 60px; height: 60px"
              fit="contain"
            >
              <template #error>
                <div class="image-slot">
                  <el-icon><Picture /></el-icon>
                </div>
              </template>
            </el-image>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" min-width="300">
          <template #default="{ row }">
            <span>{{ row.description || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" width="180" />
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Picture } from '@element-plus/icons-vue'
import axios from 'axios'

const loading = ref(false)
const brandList = ref<any[]>([])

// 加载品牌列表
const loadBrands = async () => {
  loading.value = true
  try {
    const res = await axios.get('/api/admin/brands')

    if (res.data.code === 200) {
      brandList.value = res.data.data.items || []
    }
  } catch (error: any) {
    ElMessage.error(error.message || '加载品牌列表失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadBrands()
})
</script>

<style scoped>
.admin-brands {
  max-width: 1400px;
}

.page-title {
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin-bottom: 24px;
}

.table-card {
  margin-bottom: 16px;
}

.image-slot {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 60px;
  height: 60px;
  background: #f5f7fa;
  color: #909399;
  font-size: 24px;
}
</style>
