<template>
  <div class="admin-orders">
    <h2 class="page-title">订单管理</h2>

    <!-- 搜索筛选 -->
    <el-card shadow="never" class="search-card">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="订单号">
          <el-input v-model="searchForm.orderNo" placeholder="请输入订单号" clearable />
        </el-form-item>
        <el-form-item label="订单状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
            <el-option label="全部" value="" />
            <el-option label="待支付" value="pending" />
            <el-option label="已支付" value="paid" />
            <el-option label="已发货" value="shipped" />
            <el-option label="已完成" value="completed" />
            <el-option label="已取消" value="cancelled" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
          <el-button type="success" @click="handleExport">导出数据</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 订单列表 -->
    <el-card shadow="never" class="table-card">
      <el-table v-loading="loading" :data="orderList" stripe>
        <el-table-column label="订单号" prop="orderNo" min-width="200" show-overflow-tooltip />
        <el-table-column label="用户" prop="username" width="120" />
        <el-table-column label="订单金额" width="120">
          <template #default="{ row }">
            <span style="color: #ff6b35; font-weight: bold">¥{{ row.totalAmount }}</span>
          </template>
        </el-table-column>
        <el-table-column label="订单状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="收货人" prop="receiverName" width="100" />
        <el-table-column label="收货电话" prop="receiverPhone" width="120" />
        <el-table-column label="创建时间" prop="createdAt" width="160" />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleDetail(row)">
              详情
            </el-button>
            <el-button
              v-if="row.status === 'paid'"
              link
              type="success"
              size="small"
              @click="handleShip(row)"
            >
              发货
            </el-button>
            <el-button
              v-if="row.status === 'shipped'"
              link
              type="warning"
              size="small"
              @click="handleComplete(row)"
            >
              完成
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="loadOrderList"
        @current-change="loadOrderList"
        style="margin-top: 20px; justify-content: flex-end"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { adminApi } from '@/api/admin'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'

const router = useRouter()
const loading = ref(false)

const searchForm = reactive({
  orderNo: '',
  status: '',
})

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0,
})

const orderList = ref<any[]>([])

// 订单状态映射
const statusMap: Record<string, { text: string; type: string }> = {
  pending: { text: '待支付', type: '' },
  paid: { text: '已支付', type: 'success' },
  shipped: { text: '已发货', type: 'warning' },
  completed: { text: '已完成', type: 'info' },
  cancelled: { text: '已取消', type: 'danger' },
}

const getStatusText = (status: string) => {
  return statusMap[status]?.text || status
}

const getStatusType = (status: string): any => {
  return statusMap[status]?.type || 'info'
}

// 加载订单列表
const loadOrderList = async () => {
  loading.value = true
  try {
    const res = await adminApi.getOrders({
      page: pagination.page,
      pageSize: pagination.pageSize,
      orderNo: searchForm.orderNo,
      status: searchForm.status,
    })

    orderList.value = res.data.list || []
    pagination.total = res.data.pagination?.total || 0
  } catch (error: any) {
    ElMessage.error(error.message || '加载订单列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.page = 1
  loadOrderList()
}

// 重置
const handleReset = () => {
  searchForm.orderNo = ''
  searchForm.status = ''
  pagination.page = 1
  loadOrderList()
}

// 查看详情
const handleDetail = (row: any) => {
  router.push(`/admin/orders/${row.id}`)
}

// 发货
const handleShip = async (row: any) => {
  try {
    await ElMessageBox.confirm('确定要将此订单标记为已发货吗？', '提示', {
      type: 'warning',
    })

    await adminApi.updateOrderStatus(row.id, { status: 'shipped' })
    ElMessage.success('发货成功')
    loadOrderList()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '操作失败')
    }
  }
}

// 完成订单
const handleComplete = async (row: any) => {
  try {
    await ElMessageBox.confirm('确定要将此订单标记为已完成吗？', '提示', {
      type: 'warning',
    })

    await adminApi.updateOrderStatus(row.id, { status: 'completed' })
    ElMessage.success('订单已完成')
    loadOrderList()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '操作失败')
    }
  }
}

// 导出数据
const handleExport = async () => {
  try {
    const res = await adminApi.exportOrders({
      status: searchForm.status,
    })

    // 创建下载链接
    const blob = new Blob([res.data], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `orders_${Date.now()}.csv`
    link.click()
    URL.revokeObjectURL(url)

    ElMessage.success('导出成功')
  } catch (error: any) {
    ElMessage.error(error.message || '导出失败')
  }
}

onMounted(() => {
  loadOrderList()
})
</script>

<style scoped>
.admin-orders {
  padding: 20px;
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 20px;
}

.search-card {
  margin-bottom: 20px;
}

.table-card {
  background: #fff;
}
</style>
