<template>
  <div class="admin-products">
    <div class="page-header">
      <h2 class="page-title">
        商品管理
      </h2>
      <el-button type="primary" @click="handleAdd">
        <el-icon>
          <Plus />
        </el-icon>
        添加商品
      </el-button>
    </div>

    <!-- 搜索筛选 -->
    <el-card shadow="never" class="search-card">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="商品名称">
          <el-input v-model="searchForm.name" placeholder="请输入商品名称" clearable @clear="handleSearch" />
        </el-form-item>
        <el-form-item label="分类">
          <el-select v-model="searchForm.category" placeholder="请选择分类" clearable>
            <el-option label="全部" value="" />
            <el-option label="狗粮" value="dog_food" />
            <el-option label="猫粮" value="cat_food" />
            <el-option label="零食" value="snack" />
            <el-option label="用品" value="supplies" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
            <el-option label="全部" value="" />
            <el-option label="上架" :value="1" />
            <el-option label="下架" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            搜索
          </el-button>
          <el-button @click="handleReset">
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 商品列表 -->
    <el-card shadow="never" class="table-card">
      <el-table v-loading="loading" :data="productList" style="width: 100%" stripe>
        <el-table-column type="selection" width="55" />
        <el-table-column label="商品ID" prop="id" width="80" />
        <el-table-column label="商品图片" width="100">
          <template #default="{ row }">
            <el-image :src="row.image" :preview-src-list="[row.image]" fit="cover"
              style="width: 60px; height: 60px; border-radius: 4px" />
          </template>
        </el-table-column>
        <el-table-column label="商品名称" prop="name" min-width="200" show-overflow-tooltip />
        <el-table-column label="分类" prop="categoryName" width="100" />
        <el-table-column label="价格" width="100">
          <template #default="{ row }">
            <span style="color: #ff6b35; font-weight: bold">¥{{ row.price }}</span>
          </template>
        </el-table-column>
        <el-table-column label="库存" prop="stock" width="80" />
        <el-table-column label="销量" prop="sales" width="80" />
        <el-table-column label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'">
              {{ row.status === 1 ? '上架' : '下架' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" prop="createTime" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleEdit(row)">
              编辑
            </el-button>
            <el-button link :type="row.status === 1 ? 'warning' : 'success'" @click="handleToggleStatus(row)">
              {{ row.status === 1 ? '下架' : '上架' }}
            </el-button>
            <el-button link type="danger" @click="handleDelete(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination v-model:current-page="pagination.page" v-model:page-size="pagination.size"
          :total="pagination.total" :page-sizes="[10, 20, 50, 100]" layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSearch" @current-change="handleSearch" />
      </div>
    </el-card>

    <!-- 添加/编辑对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="800px" @close="handleDialogClose">
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px">
        <el-form-item label="商品名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入商品名称" />
        </el-form-item>
        <el-form-item label="商品分类" prop="categoryId">
          <el-select v-model="formData.categoryId" placeholder="请选择分类" style="width: 100%">
            <el-option label="狗粮" value="dog_food" />
            <el-option label="猫粮" value="cat_food" />
            <el-option label="零食" value="snack" />
            <el-option label="用品" value="supplies" />
          </el-select>
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="商品价格" prop="price">
              <el-input-number v-model="formData.price" :min="0" :precision="2" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="库存" prop="stock">
              <el-input-number v-model="formData.stock" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="商品图片" prop="image">
          <el-input v-model="formData.image" placeholder="请输入图片URL" />
        </el-form-item>
        <el-form-item label="商品描述" prop="description">
          <el-input v-model="formData.description" type="textarea" :rows="4" placeholder="请输入商品描述" />
        </el-form-item>
        <el-form-item label="商品状态" prop="status">
          <el-radio-group v-model="formData.status">
            <el-radio :label="1">
              上架
            </el-radio>
            <el-radio :label="0">
              下架
            </el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">
          取消
        </el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox, FormInstance, FormRules } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'

interface Product {
  id: number
  name: string
  categoryName: string
  categoryId: string
  price: number
  stock: number
  sales: number
  image: string
  description: string
  status: number
  createTime: string
}

const loading = ref(false)
const submitLoading = ref(false)
const dialogVisible = ref(false)
const dialogTitle = ref('添加商品')
const formRef = ref<FormInstance>()

const searchForm = reactive({
  name: '',
  category: '',
  status: '',
})

const pagination = reactive({
  page: 1,
  size: 10,
  total: 0,
})

const productList = ref<Product[]>([])

const formData = reactive({
  id: 0,
  name: '',
  categoryId: '',
  price: 0,
  stock: 0,
  image: '',
  description: '',
  status: 1,
})

const formRules: FormRules = {
  name: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
  categoryId: [{ required: true, message: '请选择商品分类', trigger: 'change' }],
  price: [{ required: true, message: '请输入商品价格', trigger: 'blur' }],
  stock: [{ required: true, message: '请输入库存数量', trigger: 'blur' }],
  image: [{ required: true, message: '请输入商品图片URL', trigger: 'blur' }],
}

// 加载商品列表
const loadProducts = async () => {
  loading.value = true
  try {
    // 模拟API请求
    await new Promise((resolve) => setTimeout(resolve, 500))

    // 模拟数据
    const mockData: Product[] = [
      {
        id: 1,
        name: '皇家狗粮小型犬成犬粮3kg',
        categoryName: '狗粮',
        categoryId: 'dog_food',
        price: 299,
        stock: 150,
        sales: 1250,
        image: 'https://picsum.photos/seed/product1/200',
        description: '专为小型犬设计的营养配方',
        status: 1,
        createTime: '2024-12-01 10:20:00',
      },
      {
        id: 2,
        name: '美国进口猫粮全价成猫粮5kg',
        categoryName: '猫粮',
        categoryId: 'cat_food',
        price: 389,
        stock: 80,
        sales: 890,
        image: 'https://picsum.photos/seed/product2/200',
        description: '高蛋白低碳水，适合成年猫',
        status: 1,
        createTime: '2024-12-01 11:15:00',
      },
      {
        id: 3,
        name: '宠物零食鸡肉粒500g',
        categoryName: '零食',
        categoryId: 'snack',
        price: 59,
        stock: 200,
        sales: 2100,
        image: 'https://picsum.photos/seed/product3/200',
        description: '真材实料，无添加',
        status: 1,
        createTime: '2024-12-02 09:30:00',
      },
      {
        id: 4,
        name: '猫砂膨润土除臭10kg',
        categoryName: '用品',
        categoryId: 'supplies',
        price: 89,
        stock: 50,
        sales: 560,
        image: 'https://picsum.photos/seed/product4/200',
        description: '强效除臭，快速结团',
        status: 0,
        createTime: '2024-12-02 14:20:00',
      },
    ]

    productList.value = mockData
    pagination.total = mockData.length
  } catch (error) {
    ElMessage.error('加载商品列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.page = 1
  loadProducts()
}

// 重置
const handleReset = () => {
  searchForm.name = ''
  searchForm.category = ''
  searchForm.status = ''
  handleSearch()
}

// 添加商品
const handleAdd = () => {
  dialogTitle.value = '添加商品'
  formData.id = 0
  formData.name = ''
  formData.categoryId = ''
  formData.price = 0
  formData.stock = 0
  formData.image = ''
  formData.description = ''
  formData.status = 1
  dialogVisible.value = true
}

// 编辑商品
const handleEdit = (row: Product) => {
  dialogTitle.value = '编辑商品'
  formData.id = row.id
  formData.name = row.name
  formData.categoryId = row.categoryId
  formData.price = row.price
  formData.stock = row.stock
  formData.image = row.image
  formData.description = row.description
  formData.status = row.status
  dialogVisible.value = true
}

// 上下架
const handleToggleStatus = (row: Product) => {
  const action = row.status === 1 ? '下架' : '上架'
  ElMessageBox.confirm(`确定要${action}该商品吗?`, '提示', {
    type: 'warning',
  })
    .then(async () => {
      try {
        // 模拟API请求
        await new Promise((resolve) => setTimeout(resolve, 300))
        row.status = row.status === 1 ? 0 : 1
        ElMessage.success(`${action}成功`)
      } catch (error) {
        ElMessage.error(`${action}失败`)
      }
    })
    .catch(() => { })
}

// 删除商品
const handleDelete = (row: Product) => {
  ElMessageBox.confirm('确定要删除该商品吗? 此操作不可恢复。', '警告', {
    type: 'warning',
    confirmButtonText: '确定删除',
    cancelButtonText: '取消',
  })
    .then(async () => {
      try {
        // 模拟API请求
        await new Promise((resolve) => setTimeout(resolve, 300))
        const index = productList.value.findIndex((item) => item.id === row.id)
        if (index > -1) {
          productList.value.splice(index, 1)
          pagination.total--
        }
        ElMessage.success('删除成功')
      } catch (error) {
        ElMessage.error('删除失败')
      }
    })
    .catch(() => { })
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (!valid) return

    submitLoading.value = true
    try {
      // 模拟API请求
      await new Promise((resolve) => setTimeout(resolve, 500))

      if (formData.id === 0) {
        // 新增
        ElMessage.success('添加商品成功')
      } else {
        // 编辑
        ElMessage.success('更新商品成功')
      }

      dialogVisible.value = false
      loadProducts()
    } catch (error) {
      ElMessage.error('操作失败，请重试')
    } finally {
      submitLoading.value = false
    }
  })
}

// 对话框关闭
const handleDialogClose = () => {
  formRef.value?.resetFields()
}

onMounted(() => {
  loadProducts()
})
</script>

<style scoped>
.admin-products {
  max-width: 1400px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-title {
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin: 0;
}

.search-card {
  margin-bottom: 16px;
}

.table-card {
  margin-bottom: 24px;
}

.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 24px;
}

:deep(.el-table) {
  font-size: 14px;
}

:deep(.el-table th) {
  background-color: #f5f7fa;
  font-weight: 500;
}
</style>
