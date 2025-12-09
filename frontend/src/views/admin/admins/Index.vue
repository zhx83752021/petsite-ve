<template>
  <div class="admin-admins">
    <h2 class="page-title">管理员管理</h2>

    <el-card shadow="never">
      <!-- 搜索栏 -->
      <div class="search-bar">
        <el-input
          v-model="searchForm.keyword"
          placeholder="搜索账号或姓名"
          clearable
          style="width: 300px"
          @clear="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>

        <el-select
          v-model="searchForm.status"
          placeholder="状态"
          clearable
          style="width: 150px"
          @change="handleSearch"
        >
          <el-option label="正常" :value="1" />
          <el-option label="禁用" :value="2" />
        </el-select>

        <el-button type="primary" @click="handleSearch">
          <el-icon><Search /></el-icon>
          搜索
        </el-button>

        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>
          添加管理员
        </el-button>
      </div>

      <!-- 表格 -->
      <el-table
        v-loading="loading"
        :data="tableData"
        stripe
        style="width: 100%; margin-top: 16px"
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="账号" width="150" />
        <el-table-column prop="realName" label="姓名" width="120" />
        <el-table-column prop="email" label="邮箱" min-width="180" />
        <el-table-column prop="phone" label="手机号" width="140" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'">
              {{ row.status === 1 ? '正常' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="lastLoginAt" label="最后登录" width="180" />
        <el-table-column prop="createdAt" label="创建时间" width="180" />
        <el-table-column label="操作" width="240" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleEdit(row)">
              编辑
            </el-button>
            <el-button link type="warning" size="small" @click="handleResetPassword(row)">
              重置密码
            </el-button>
            <el-button link type="danger" size="small" @click="handleDelete(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @current-change="fetchData"
        @size-change="fetchData"
        style="margin-top: 16px; justify-content: flex-end"
      />
    </el-card>

    <!-- 添加/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑管理员' : '添加管理员'"
      width="600px"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="账号" prop="username">
          <el-input
            v-model="form.username"
            :disabled="isEdit"
            placeholder="请输入账号"
          />
        </el-form-item>

        <el-form-item v-if="!isEdit" label="密码" prop="password">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="请输入密码"
            show-password
          />
        </el-form-item>

        <el-form-item v-if="isEdit" label="修改密码">
          <el-input
            v-model="form.newPassword"
            type="password"
            placeholder="留空则不修改密码"
            show-password
            clearable
          />
        </el-form-item>

        <el-form-item label="姓名" prop="realName">
          <el-input v-model="form.realName" placeholder="请输入姓名" />
        </el-form-item>

        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" placeholder="请输入邮箱" />
        </el-form-item>

        <el-form-item label="手机号" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入手机号" />
        </el-form-item>

        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio :label="1">正常</el-radio>
            <el-radio :label="2">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Plus } from '@element-plus/icons-vue'
import { adminApi, type AdminInfo } from '@/api/admin'

const loading = ref(false)
const submitLoading = ref(false)
const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref()

const searchForm = reactive({
  keyword: '',
  status: undefined as number | undefined,
})

const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0,
})

const tableData = ref<AdminInfo[]>([])

const form = reactive({
  id: 0,
  username: '',
  password: '',
  newPassword: '',
  realName: '',
  email: '',
  phone: '',
  status: 1,
})

const rules = {
  username: [
    { required: true, message: '请输入账号', trigger: 'blur' },
    { min: 3, max: 20, message: '账号长度3-20字符', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码至少6位', trigger: 'blur' },
  ],
  realName: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  email: [
    { type: 'email', message: '请输入正确的邮箱', trigger: 'blur' },
  ],
}

const fetchData = async () => {
  try {
    loading.value = true
    const res = await adminApi.getList({
      page: pagination.page,
      pageSize: pagination.pageSize,
      keyword: searchForm.keyword,
      status: searchForm.status,
    })
    tableData.value = res.data.list
    pagination.total = res.data.total
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || '获取数据失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.page = 1
  fetchData()
}

const handleAdd = () => {
  isEdit.value = false
  dialogVisible.value = true
  Object.assign(form, {
    id: 0,
    username: '',
    password: '',
    newPassword: '',
    realName: '',
    email: '',
    phone: '',
    status: 1,
  })
  formRef.value?.clearValidate()
}

const handleEdit = (row: AdminInfo) => {
  isEdit.value = true
  dialogVisible.value = true
  Object.assign(form, {
    id: row.id,
    username: row.username,
    newPassword: '',
    realName: row.realName,
    email: row.email,
    phone: row.phone,
    status: row.status,
  })
  formRef.value?.clearValidate()
}

const handleSubmit = async () => {
  try {
    await formRef.value.validate()
    submitLoading.value = true

    if (isEdit.value) {
      const updateData: any = {
        realName: form.realName,
        email: form.email,
        phone: form.phone,
        status: form.status,
      }
      // 如果输入了新密码，则包含在更新数据中
      if (form.newPassword) {
        updateData.password = form.newPassword
      }
      await adminApi.update(form.id, updateData)
      ElMessage.success('更新成功')
    } else {
      await adminApi.create({
        username: form.username,
        password: form.password,
        realName: form.realName,
        email: form.email,
        phone: form.phone,
        status: form.status,
      })
      ElMessage.success('添加成功')
    }

    dialogVisible.value = false
    fetchData()
  } catch (error: any) {
    if (error !== false) {
      ElMessage.error(error.response?.data?.message || '操作失败')
    }
  } finally {
    submitLoading.value = false
  }
}

const handleResetPassword = async (row: AdminInfo) => {
  try {
    const { value } = await ElMessageBox.prompt('请输入新密码', '重置密码', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputPattern: /.{6,}/,
      inputErrorMessage: '密码至少6位',
    })

    await adminApi.resetPassword(row.id, value)
    ElMessage.success('密码重置成功')
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.response?.data?.message || '重置失败')
    }
  }
}

const handleDelete = async (row: AdminInfo) => {
  try {
    await ElMessageBox.confirm(`确定要删除管理员"${row.realName}"吗?`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    await adminApi.delete(row.id)
    ElMessage.success('删除成功')
    fetchData()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.response?.data?.message || '删除失败')
    }
  }
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.admin-admins {
  max-width: 1400px;
}

.page-title {
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin-bottom: 24px;
}

.search-bar {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}
</style>
