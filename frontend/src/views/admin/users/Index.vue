<template>
  <div class="admin-users">
    <h2 class="page-title">
      用户管理
    </h2>

    <!-- 搜索筛选 -->
    <el-card shadow="never" class="search-card">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="用户名">
          <el-input v-model="searchForm.username" placeholder="请输入用户名" clearable @clear="handleSearch" />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="searchForm.phone" placeholder="请输入手机号" clearable @clear="handleSearch" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
            <el-option label="全部" value="" />
            <el-option label="正常" :value="1" />
            <el-option label="禁用" :value="2" />
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

    <!-- 用户列表 -->
    <el-card shadow="never" class="table-card">
      <el-table v-loading="loading" :data="userList" style="width: 100%" stripe>
        <el-table-column type="selection" width="55" />
        <el-table-column label="用户ID" prop="id" width="80" />
        <el-table-column label="头像" width="80">
          <template #default="{ row }">
            <el-avatar :src="row.avatar" :size="50" />
          </template>
        </el-table-column>
        <el-table-column label="用户名" prop="username" width="150" />
        <el-table-column label="昵称" prop="nickname" width="150" />
        <el-table-column label="手机号" prop="phone" width="130" />
        <el-table-column label="邮箱" prop="email" min-width="180" show-overflow-tooltip />
        <el-table-column label="性别" width="80">
          <template #default="{ row }">
            <span v-if="row.gender === 1">男</span>
            <span v-else-if="row.gender === 2">女</span>
            <span v-else>未设置</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'">
              {{ row.status === 1 ? '正常' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="注册时间" prop="createTime" width="180" />
        <el-table-column label="最后登录" prop="lastLoginAt" width="180" />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleView(row)">
              查看
            </el-button>
            <el-button link :type="row.status === 1 ? 'danger' : 'success'" @click="handleToggleStatus(row)">
              {{ row.status === 1 ? '禁用' : '启用' }}
            </el-button>
            <el-button link type="warning" @click="handleResetPassword(row)">
              重置密码
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

    <!-- 用户详情对话框 -->
    <el-dialog v-model="dialogVisible" title="用户详情" width="600px">
      <el-descriptions v-if="currentUser" :column="2" border>
        <el-descriptions-item label="用户ID">
          {{ currentUser.id }}
        </el-descriptions-item>
        <el-descriptions-item label="用户名">
          {{ currentUser.username }}
        </el-descriptions-item>
        <el-descriptions-item label="昵称">
          {{ currentUser.nickname }}
        </el-descriptions-item>
        <el-descriptions-item label="手机号">
          {{ currentUser.phone }}
        </el-descriptions-item>
        <el-descriptions-item label="邮箱" :span="2">
          {{ currentUser.email || '未设置' }}
        </el-descriptions-item>
        <el-descriptions-item label="性别">
          <span v-if="currentUser.gender === 1">男</span>
          <span v-else-if="currentUser.gender === 2">女</span>
          <span v-else>未设置</span>
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="currentUser.status === 1 ? 'success' : 'danger'">
            {{ currentUser.status === 1 ? '正常' : '禁用' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="注册时间" :span="2">
          {{ currentUser.createTime }}
        </el-descriptions-item>
        <el-descriptions-item label="最后登录" :span="2">
          {{ currentUser.lastLoginAt || '未登录' }}
        </el-descriptions-item>
        <el-descriptions-item label="个性签名" :span="2">
          {{ currentUser.signature || '未设置' }}
        </el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="dialogVisible = false">
          关闭
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

interface User {
  id: number
  username: string
  nickname: string
  avatar: string
  phone: string
  email?: string
  gender?: number
  signature?: string
  status: number
  createTime: string
  lastLoginAt?: string
}

const loading = ref(false)
const dialogVisible = ref(false)
const currentUser = ref<User | null>(null)

const searchForm = reactive({
  username: '',
  phone: '',
  status: '',
})

const pagination = reactive({
  page: 1,
  size: 10,
  total: 0,
})

const userList = ref<User[]>([])

// 加载用户列表
const loadUsers = async () => {
  loading.value = true
  try {
    // 模拟API请求
    await new Promise((resolve) => setTimeout(resolve, 500))

    // 模拟数据
    const mockData: User[] = [
      {
        id: 1,
        username: 'zhangsan',
        nickname: '张三',
        avatar: 'https://picsum.photos/seed/user1/100',
        phone: '13800138001',
        email: 'zhangsan@example.com',
        gender: 1,
        signature: '热爱生活，喜欢宠物',
        status: 1,
        createTime: '2024-11-01 10:20:00',
        lastLoginAt: '2024-12-03 08:30:00',
      },
      {
        id: 2,
        username: 'lisi',
        nickname: '李四',
        avatar: 'https://picsum.photos/seed/user2/100',
        phone: '13800138002',
        email: 'lisi@example.com',
        gender: 2,
        status: 1,
        createTime: '2024-11-05 14:15:00',
        lastLoginAt: '2024-12-02 20:15:00',
      },
      {
        id: 3,
        username: 'wangwu',
        nickname: '王五',
        avatar: 'https://picsum.photos/seed/user3/100',
        phone: '13800138003',
        gender: 1,
        status: 2,
        createTime: '2024-11-10 09:30:00',
      },
      {
        id: 4,
        username: 'zhaoliu',
        nickname: '赵六',
        avatar: 'https://picsum.photos/seed/user4/100',
        phone: '13800138004',
        email: 'zhaoliu@example.com',
        status: 1,
        createTime: '2024-11-15 16:45:00',
        lastLoginAt: '2024-12-01 12:20:00',
      },
    ]

    userList.value = mockData
    pagination.total = mockData.length
  } catch (error) {
    ElMessage.error('加载用户列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.page = 1
  loadUsers()
}

// 重置
const handleReset = () => {
  searchForm.username = ''
  searchForm.phone = ''
  searchForm.status = ''
  handleSearch()
}

// 查看详情
const handleView = (row: User) => {
  currentUser.value = row
  dialogVisible.value = true
}

// 启用/禁用
const handleToggleStatus = (row: User) => {
  const action = row.status === 1 ? '禁用' : '启用'
  ElMessageBox.confirm(`确定要${action}该用户吗?`, '提示', {
    type: 'warning',
  })
    .then(async () => {
      try {
        // 模拟API请求
        await new Promise((resolve) => setTimeout(resolve, 300))
        row.status = row.status === 1 ? 2 : 1
        ElMessage.success(`${action}成功`)
      } catch (error) {
        ElMessage.error(`${action}失败`)
      }
    })
    .catch(() => { })
}

// 重置密码
const handleResetPassword = (row: User) => {
  ElMessageBox.confirm(
    '确定要重置该用户的密码吗? 新密码将为: 123456',
    '提示',
    {
      type: 'warning',
      confirmButtonText: '确定重置',
      cancelButtonText: '取消',
    }
  )
    .then(async () => {
      try {
        // 模拟API请求
        await new Promise((resolve) => setTimeout(resolve, 300))
        ElMessage.success('密码重置成功，新密码为: 123456')
      } catch (error) {
        ElMessage.error('密码重置失败')
      }
    })
    .catch(() => { })
}

onMounted(() => {
  loadUsers()
})
</script>

<style scoped>
.admin-users {
  max-width: 1400px;
}

.page-title {
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin-bottom: 24px;
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
