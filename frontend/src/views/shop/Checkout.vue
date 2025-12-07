<template>
  <div class="checkout-page">
    <div class="checkout-container">
      <h2 class="page-title">确认订单</h2>

      <!-- 收货地址 -->
      <el-card class="address-card" shadow="never">
        <template #header>
          <div class="card-header">
            <span>收货地址</span>
            <el-button link type="primary" @click="showAddressDialog = true">
              管理地址
            </el-button>
          </div>
        </template>

        <div v-if="selectedAddress" class="address-item selected">
          <div class="address-info">
            <div class="address-name">
              <span class="name">{{ selectedAddress.name }}</span>
              <span class="phone">{{ selectedAddress.phone }}</span>
              <el-tag v-if="selectedAddress.isDefault" type="success" size="small">默认</el-tag>
            </div>
            <div class="address-detail">
              {{ selectedAddress.province }} {{ selectedAddress.city }} {{ selectedAddress.district }}
              {{ selectedAddress.detail }}
            </div>
          </div>
          <el-button link type="primary" @click="showAddressDialog = true">切换地址</el-button>
        </div>

        <el-empty v-else description="请添加收货地址" />
      </el-card>

      <!-- 商品列表 -->
      <el-card class="goods-card" shadow="never">
        <template #header>
          <span>商品清单</span>
        </template>

        <el-table :data="orderItems" style="width: 100%">
          <el-table-column label="商品" min-width="300">
            <template #default="{ row }">
              <div class="goods-info">
                <el-image :src="row.image" class="goods-image" fit="cover" />
                <div class="goods-detail">
                  <div class="goods-name">{{ row.name }}</div>
                  <div v-if="row.spec" class="goods-spec">规格: {{ row.spec }}</div>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="单价" width="120">
            <template #default="{ row }">
              <span class="price">¥{{ row.price }}</span>
            </template>
          </el-table-column>
          <el-table-column label="数量" prop="quantity" width="100" align="center" />
          <el-table-column label="小计" width="120">
            <template #default="{ row }">
              <span class="price">¥{{ (row.price * row.quantity).toFixed(2) }}</span>
            </template>
          </el-table-column>
        </el-table>
      </el-card>

      <!-- 订单备注 -->
      <el-card class="remark-card" shadow="never">
        <el-input
          v-model="remark"
          type="textarea"
          :rows="3"
          placeholder="订单备注（选填）"
          maxlength="200"
          show-word-limit
        />
      </el-card>

      <!-- 结算信息 -->
      <el-card class="summary-card" shadow="never">
        <div class="summary-item">
          <span>商品总额</span>
          <span class="value">¥{{ totalAmount.toFixed(2) }}</span>
        </div>
        <div class="summary-item">
          <span>运费</span>
          <span class="value">¥0.00</span>
        </div>
        <div class="summary-item total">
          <span>应付金额</span>
          <span class="value">¥{{ totalAmount.toFixed(2) }}</span>
        </div>

        <el-button
          type="primary"
          size="large"
          class="submit-btn"
          :loading="submitting"
          :disabled="!selectedAddress"
          @click="handleSubmit"
        >
          提交订单
        </el-button>
      </el-card>
    </div>

    <!-- 地址选择对话框 -->
    <el-dialog v-model="showAddressDialog" title="选择收货地址" width="600px">
      <div class="address-list">
        <div
          v-for="addr in addressList"
          :key="addr.id"
          class="address-item"
          :class="{ selected: selectedAddress?.id === addr.id }"
          @click="selectAddress(addr)"
        >
          <div class="address-info">
            <div class="address-name">
              <span class="name">{{ addr.name }}</span>
              <span class="phone">{{ addr.phone }}</span>
              <el-tag v-if="addr.isDefault" type="success" size="small">默认</el-tag>
            </div>
            <div class="address-detail">
              {{ addr.province }} {{ addr.city }} {{ addr.district }} {{ addr.detail }}
            </div>
          </div>
          <el-icon v-if="selectedAddress?.id === addr.id" class="check-icon" color="#67c23a">
            <Check />
          </el-icon>
        </div>
      </div>

      <template #footer>
        <el-button @click="showAddressDialog = false">取消</el-button>
        <el-button type="primary" @click="confirmAddress">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { userApi } from '@/api/user'
import { orderApi } from '@/api/order'
import { ElMessage } from 'element-plus'
import { Check } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()

const showAddressDialog = ref(false)
const addressList = ref<any[]>([])
const selectedAddress = ref<any>(null)
const orderItems = ref<any[]>([])
const remark = ref('')
const submitting = ref(false)

// 计算总金额
const totalAmount = computed(() => {
  return orderItems.value.reduce((sum, item) => sum + item.price * item.quantity, 0)
})

// 加载地址列表
const loadAddresses = async () => {
  try {
    const res = await userApi.getAddresses()
    addressList.value = res.data || []

    // 自动选择默认地址
    const defaultAddr = addressList.value.find(addr => addr.isDefault)
    if (defaultAddr) {
      selectedAddress.value = defaultAddr
    } else if (addressList.value.length > 0) {
      selectedAddress.value = addressList.value[0]
    }
  } catch (error: any) {
    ElMessage.error(error.message || '加载地址失败')
  }
}

// 选择地址
const selectAddress = (addr: any) => {
  selectedAddress.value = addr
}

// 确认地址
const confirmAddress = () => {
  showAddressDialog.value = false
}

// 提交订单
const handleSubmit = async () => {
  if (!selectedAddress.value) {
    ElMessage.warning('请选择收货地址')
    return
  }

  if (orderItems.value.length === 0) {
    ElMessage.warning('购物车为空')
    return
  }

  submitting.value = true
  try {
    const res = await orderApi.create({
      items: orderItems.value.map(item => ({
        skuId: item.skuId,
        quantity: item.quantity,
      })),
      address: {
        name: selectedAddress.value.name,
        phone: selectedAddress.value.phone,
        province: selectedAddress.value.province,
        city: selectedAddress.value.city,
        district: selectedAddress.value.district,
        detail: selectedAddress.value.detail,
      },
    })

    ElMessage.success('订单提交成功')

    // 跳转到支付页面
    router.push(`/payment?orderId=${res.data.orderId}`)
  } catch (error: any) {
    ElMessage.error(error.message || '订单提交失败')
  } finally {
    submitting.value = false
  }
}

// 初始化订单商品（从购物车获取或从路由参数获取）
const initOrderItems = () => {
  // 从路由参数获取商品信息
  const items = route.query.items
  if (items) {
    try {
      orderItems.value = JSON.parse(items as string)
    } catch (e) {
      ElMessage.error('商品信息错误')
      router.back()
    }
  } else {
    ElMessage.warning('没有选择商品')
    router.push('/cart')
  }
}

onMounted(() => {
  initOrderItems()
  loadAddresses()
})
</script>

<style scoped>
.checkout-page {
  background: #f5f5f5;
  min-height: 100vh;
  padding: 20px 0;
}

.checkout-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 20px;
  color: #333;
}

.el-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.address-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  cursor: pointer;
  margin-bottom: 12px;
  transition: all 0.3s;
}

.address-item:hover {
  border-color: #409eff;
  background: #f0f9ff;
}

.address-item.selected {
  border-color: #409eff;
  background: #f0f9ff;
}

.address-info {
  flex: 1;
}

.address-name {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.address-name .name {
  font-weight: 600;
  font-size: 16px;
  color: #333;
}

.address-name .phone {
  color: #666;
}

.address-detail {
  color: #666;
  line-height: 1.6;
}

.check-icon {
  font-size: 24px;
}

.goods-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.goods-image {
  width: 60px;
  height: 60px;
  border-radius: 4px;
}

.goods-name {
  font-size: 14px;
  color: #333;
  margin-bottom: 4px;
}

.goods-spec {
  font-size: 12px;
  color: #999;
}

.price {
  color: #ff6b35;
  font-weight: 600;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  font-size: 14px;
}

.summary-item.total {
  font-size: 18px;
  font-weight: 600;
  border-top: 1px dashed #e4e7ed;
  padding-top: 16px;
  margin-top: 8px;
}

.summary-item.total .value {
  color: #ff6b35;
  font-size: 24px;
}

.submit-btn {
  width: 100%;
  margin-top: 16px;
  height: 48px;
  font-size: 16px;
}

.address-list {
  max-height: 400px;
  overflow-y: auto;
}

@media (max-width: 768px) {
  .checkout-container {
    padding: 0 12px;
  }

  .page-title {
    font-size: 20px;
  }

  .goods-image {
    width: 50px;
    height: 50px;
  }

  .summary-item.total {
    font-size: 16px;
  }

  .summary-item.total .value {
    font-size: 20px;
  }
}
</style>
