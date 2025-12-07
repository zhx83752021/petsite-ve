<template>
  <div class="user-profile">
    <h2>个人中心</h2>

    <el-tabs v-model="activeTab">
      <!-- 个人信息 -->
      <el-tab-pane label="个人信息" name="info">
        <el-card>
          <el-form :model="userInfo" label-width="100px">
            <el-form-item label="用户名">
              <el-input v-model="userInfo.username" disabled />
            </el-form-item>
            <el-form-item label="邮箱">
              <el-input v-model="userInfo.email" />
            </el-form-item>
            <el-form-item label="手机号">
              <el-input v-model="userInfo.phone" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleUpdateProfile">保存</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-tab-pane>

      <!-- 地址管理 -->
      <el-tab-pane label="地址管理" name="address">
        <el-button type="primary" @click="handleAddAddress" style="margin-bottom: 20px">
          添加地址
        </el-button>

        <el-table :data="addressList" v-loading="addressLoading">
          <el-table-column label="收货人" prop="name" width="100" />
          <el-table-column label="手机号" prop="phone" width="120" />
          <el-table-column label="地址" min-width="300">
            <template #default="{ row }">
              {{ row.province }} {{ row.city }} {{ row.district }} {{ row.detail }}
            </template>
          </el-table-column>
          <el-table-column label="默认" width="80">
            <template #default="{ row }">
              <el-tag v-if="row.isDefault" type="success">默认</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150">
            <template #default="{ row }">
              <el-button link type="primary" @click="handleEditAddress(row)">编辑</el-button>
              <el-button link type="danger" @click="handleDeleteAddress(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <!-- 我的订单 -->
      <el-tab-pane label="我的订单" name="orders">
        <el-select v-model="orderStatus" placeholder="订单状态" style="margin-bottom: 20px">
          <el-option label="全部" value="" />
          <el-option label="待支付" value="pending" />
          <el-option label="已支付" value="paid" />
          <el-option label="已发货" value="shipped" />
          <el-option label="已完成" value="completed" />
        </el-select>

        <el-table :data="orderList" v-loading="orderLoading">
          <el-table-column label="订单号" prop="orderNo" width="200" />
          <el-table-column label="金额" width="120">
            <template #default="{ row }">
              ¥{{ row.totalAmount }}
            </template>
          </el-table-column>
          <el-table-column label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="getStatusType(row.status)">
                {{ getStatusText(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="创建时间" prop="createdAt" width="160" />
          <el-table-column label="操作" width="150">
            <template #default="{ row }">
              <el-button link type="primary" size="small" @click="viewOrder(row.id)">
                查看
              </el-button>
              <el-button
                v-if="row.status === 'pending'"
                link
                type="danger"
                size="small"
                @click="cancelOrder(row.id)"
              >
                取消
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
    </el-tabs>

    <!-- 地址表单对话框 -->
    <el-dialog v-model="addressDialogVisible" :title="addressDialogTitle" width="500px">
      <el-form :model="addressForm" label-width="80px">
        <el-form-item label="收货人">
          <el-input v-model="addressForm.name" />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="addressForm.phone" />
        </el-form-item>
        <el-form-item label="省市区">
          <el-input v-model="addressForm.province" placeholder="省" style="width: 30%" />
          <el-input v-model="addressForm.city" placeholder="市" style="width: 30%; margin-left: 5%" />
          <el-input v-model="addressForm.district" placeholder="区" style="width: 30%; margin-left: 5%" />
        </el-form-item>
        <el-form-item label="详细地址">
          <el-input v-model="addressForm.detail" type="textarea" :rows="3" />
        </el-form-item>
        <el-form-item label="默认地址">
          <el-switch v-model="addressForm.isDefault" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addressDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmitAddress">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import { userApi } from '@/api/user'
import { orderApi } from '@/api/order'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'

const router = useRouter()
const activeTab = ref('info')
const addressLoading = ref(false)
const orderLoading = ref(false)
const orderStatus = ref('')

const userInfo = reactive({
  username: '',
  email: '',
  phone: '',
})

const addressList = ref<any[]>([])
const orderList = ref<any[]>([])

const addressDialogVisible = ref(false)
const addressDialogTitle = ref('添加地址')
const addressForm = reactive({
  id: 0,
  name: '',
  phone: '',
  province: '',
  city: '',
  district: '',
  detail: '',
  isDefault: false,
})

// 加载用户信息
const loadUserInfo = async () => {
  try {
    const res = await userApi.getProfile()
    Object.assign(userInfo, res.data)
  } catch (error: any) {
    ElMessage.error(error.message || '加载用户信息失败')
  }
}

// 更新个人信息
const handleUpdateProfile = async () => {
  try {
    await userApi.updateProfile({
      email: userInfo.email,
      phone: userInfo.phone,
    })
    ElMessage.success('更新成功')
  } catch (error: any) {
    ElMessage.error(error.message || '更新失败')
  }
}

// 加载地址列表
const loadAddressList = async () => {
  addressLoading.value = true
  try {
    const res = await userApi.getAddresses()
    addressList.value = res.data || []
  } catch (error: any) {
    ElMessage.error(error.message || '加载地址失败')
  } finally {
    addressLoading.value = false
  }
}

// 添加地址
const handleAddAddress = () => {
  addressDialogTitle.value = '添加地址'
  addressForm.id = 0
  addressForm.name = ''
  addressForm.phone = ''
  addressForm.province = ''
  addressForm.city = ''
  addressForm.district = ''
  addressForm.detail = ''
  addressForm.isDefault = false
  addressDialogVisible.value = true
}

// 编辑地址
const handleEditAddress = (row: any) => {
  addressDialogTitle.value = '编辑地址'
  Object.assign(addressForm, row)
  addressDialogVisible.value = true
}

// 提交地址
const handleSubmitAddress = async () => {
  try {
    if (addressForm.id) {
      await userApi.updateAddress(addressForm)
    } else {
      await userApi.addAddress(addressForm)
    }
    ElMessage.success('保存成功')
    addressDialogVisible.value = false
    loadAddressList()
  } catch (error: any) {
    ElMessage.error(error.message || '保存失败')
  }
}

// 删除地址
const handleDeleteAddress = async (row: any) => {
  try {
    await ElMessageBox.confirm('确定要删除这个地址吗？', '提示', {
      type: 'warning',
    })
    await userApi.deleteAddress(row.id)
    ElMessage.success('删除成功')
    loadAddressList()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败')
    }
  }
}

// 加载订单列表
const loadOrderList = async () => {
  orderLoading.value = true
  try {
    const res = await orderApi.getMyOrders({
      page: 1,
      pageSize: 20,
      status: orderStatus.value,
    })
    orderList.value = res.data.list || []
  } catch (error: any) {
    ElMessage.error(error.message || '加载订单失败')
  } finally {
    orderLoading.value = false
  }
}

// 查看订单
const viewOrder = (id: number) => {
  router.push(`/user/orders/${id}`)
}

// 取消订单
const cancelOrder = async (id: number) => {
  try {
    await ElMessageBox.confirm('确定要取消这个订单吗？', '提示', {
      type: 'warning',
    })
    await orderApi.cancel(id)
    ElMessage.success('取消成功')
    loadOrderList()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '取消失败')
    }
  }
}

const statusMap: Record<string, { text: string; type: string }> = {
  pending: { text: '待支付', type: '' },
  paid: { text: '已支付', type: 'success' },
  shipped: { text: '已发货', type: 'warning' },
  completed: { text: '已完成', type: 'info' },
  cancelled: { text: '已取消', type: 'danger' },
}

const getStatusText = (status: string) => statusMap[status]?.text || status
const getStatusType = (status: string): any => statusMap[status]?.type || 'info'

watch(activeTab, (val) => {
  if (val === 'address' && addressList.value.length === 0) {
    loadAddressList()
  }
  if (val === 'orders' && orderList.value.length === 0) {
    loadOrderList()
  }
})

watch(orderStatus, () => {
  loadOrderList()
})

onMounted(() => {
  loadUserInfo()
})
</script>

<style scoped>
.user-profile {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.user-profile h2 {
  margin-bottom: 20px;
}
</style>
