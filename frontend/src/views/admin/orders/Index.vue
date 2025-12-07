<template>
  <div class="admin-orders">
    <h2 class="page-title">订单管理</h2>

    <!-- 搜索筛选 -->
    <el-card shadow="never" class="search-card">
      <el-form :inline="true">
        <el-form-item label="订单状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable style="width: 150px">
            <el-option label="全部" value="" />
            <el-option label="待支付" value="pending" />
            <el-option label="已支付" value="paid" />
            <el-option label="已发货" value="shipped" />
            <el-option label="已完成" value="completed" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadOrders">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 订单列表 -->
    <el-card shadow="never" class="table-card">
      <el-table v-loading="loading" :data="orderList" style="width: 100%" stripe>
        <el-table-column prop="id" label="订单ID" width="80" />
        <el-table-column prop="order_no" label="订单号" width="180" />
        <el-table-column prop="user_name" label="用户" width="120" />
        <el-table-column prop="total_amount" label="订单金额" width="120">
          <template #default="{ row }">
            <span>¥{{ row.total_amount }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="payment_status" label="支付状态" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.payment_status === 'paid'" type="success">已支付</el-tag>
            <el-tag v-else type="warning">待支付</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="order_status" label="订单状态" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.order_status === 'completed'" type="success">已完成</el-tag>
            <el-tag v-else-if="row.order_status === 'shipped'" type="primary">已发货</el-tag>
            <el-tag v-else type="info">{{ getStatusText(row.order_status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="下单时间" width="180" />
        <el-table-column label="操作" fixed="right" width="200">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleView(row)">查看</el-button>
            <el-button link type="primary" size="small" @click="handleUpdateStatus(row)">更新状态</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="loadOrders"
        @current-change="loadOrders"
      />
    </el-card>

    <!-- 订单详情对话框 -->
    <el-dialog v-model="detailVisible" title="订单详情" width="800px">
      <div v-if="currentOrder">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="订单号">{{ currentOrder.order_no }}</el-descriptions-item>
          <el-descriptions-item label="订单金额">¥{{ currentOrder.total_amount }}</el-descriptions-item>
          <el-descriptions-item label="用户">{{ currentOrder.user_name }}</el-descriptions-item>
          <el-descriptions-item label="支付状态">{{ currentOrder.payment_status }}</el-descriptions-item>
          <el-descriptions-item label="订单状态">{{ currentOrder.order_status }}</el-descriptions-item>
          <el-descriptions-item label="下单时间">{{ currentOrder.created_at }}</el-descriptions-item>
        </el-descriptions>

        <h4 style="margin-top: 20px">订单商品</h4>
        <el-table :data="currentOrder.items" style="width: 100%">
          <el-table-column prop="product_name" label="商品名称" />
          <el-table-column prop="sku_name" label="规格" />
          <el-table-column prop="price" label="单价">
            <template #default="{ row }">¥{{ row.price }}</template>
          </el-table-column>
          <el-table-column prop="quantity" label="数量" />
          <el-table-column label="小计">
            <template #default="{ row }">¥{{ (row.price * row.quantity).toFixed(2) }}</template>
          </el-table-column>
        </el-table>
      </div>
    </el-dialog>

    <!-- 更新状态对话框 -->
    <el-dialog v-model="statusVisible" title="更新订单状态" width="400px">
      <el-form :model="statusForm" label-width="100px">
        <el-form-item label="订单状态">
          <el-select v-model="statusForm.orderStatus">
            <el-option label="待支付" value="pending" />
            <el-option label="处理中" value="processing" />
            <el-option label="已发货" value="shipped" />
            <el-option label="已完成" value="completed" />
            <el-option label="已取消" value="cancelled" />
          </el-select>
        </el-form-item>
        <el-form-item label="支付状态">
          <el-select v-model="statusForm.paymentStatus">
            <el-option label="待支付" value="unpaid" />
            <el-option label="已支付" value="paid" />
            <el-option label="已退款" value="refunded" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="statusVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmUpdateStatus">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { adminApi } from '@/api/admin'

const loading = ref(false)
const orderList = ref<any[]>([])
const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0
})

const searchForm = reactive({
  status: ''
})

const detailVisible = ref(false)
const statusVisible = ref(false)
const currentOrder = ref<any>(null)
const statusForm = reactive({
  orderStatus: '',
  paymentStatus: ''
})

// 加载订单列表
const loadOrders = async () => {
  loading.value = true
  try {
    const res = await adminApi.getOrders({
      page: pagination.page,
      pageSize: pagination.pageSize,
      status: searchForm.status || undefined
    })
    orderList.value = res.data.items || []
    pagination.total = res.data.total || 0
  } catch (error: any) {
    ElMessage.error(error.message || '加载订单列表失败')
  } finally {
    loading.value = false
  }
}

const handleReset = () => {
  searchForm.status = ''
  pagination.page = 1
  loadOrders()
}

const handleView = (row: any) => {
  currentOrder.value = row
  detailVisible.value = true
}

const handleUpdateStatus = (row: any) => {
  currentOrder.value = row
  statusForm.orderStatus = row.order_status
  statusForm.paymentStatus = row.payment_status
  statusVisible.value = true
}

const confirmUpdateStatus = async () => {
  if (!currentOrder.value) return

  try {
    await adminApi.updateOrderStatus(currentOrder.value.id, statusForm)
    ElMessage.success('状态更新成功')
    statusVisible.value = false
    loadOrders()
  } catch (error: any) {
    ElMessage.error(error.message || '更新失败')
  }
}

const getStatusText = (status: string) => {
  const map: Record<string, string> = {
    pending: '待支付',
    processing: '处理中',
    shipped: '已发货',
    completed: '已完成',
    cancelled: '已取消'
  }
  return map[status] || status
}

onMounted(() => {
  loadOrders()
})
</script>

<style scoped>
.admin-orders {
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
  margin-bottom: 16px;
}
</style>
