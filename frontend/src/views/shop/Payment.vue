<template>
  <div class="payment-page">
    <div class="payment-container">
      <h2 class="page-title">支付订单</h2>

      <el-card v-loading="loading" shadow="never">
        <!-- 订单信息 -->
        <div class="order-info">
          <div class="info-item">
            <span class="label">订单号:</span>
            <span class="value">{{ orderInfo.orderNo }}</span>
          </div>
          <div class="info-item">
            <span class="label">订单金额:</span>
            <span class="value amount">¥{{ orderInfo.totalAmount }}</span>
          </div>
        </div>

        <!-- 支付方式选择 -->
        <div class="payment-methods">
          <h3>选择支付方式</h3>
          <el-radio-group v-model="paymentMethod" class="method-group">
            <el-radio value="alipay" class="method-item">
              <div class="method-content">
                <span class="method-icon">💰</span>
                <span class="method-name">支付宝</span>
              </div>
            </el-radio>
            <el-radio value="wechat" class="method-item">
              <div class="method-content">
                <span class="method-icon">💚</span>
                <span class="method-name">微信支付</span>
              </div>
            </el-radio>
          </el-radio-group>
        </div>

        <!-- 支付二维码 -->
        <div v-if="paymentData" class="qrcode-section">
          <div class="qrcode-container">
            <el-image :src="paymentData.qrCode" class="qrcode" />
            <p class="qrcode-tip">请使用{{ paymentMethod === 'alipay' ? '支付宝' : '微信' }}扫码支付</p>
          </div>

          <div class="payment-info">
            <div class="info-row">
              <span class="label">支付金额:</span>
              <span class="value amount">¥{{ paymentData.amount }}</span>
            </div>
            <div class="info-row">
              <span class="label">过期时间:</span>
              <span class="value">{{ formatTime(paymentData.expireTime) }}</span>
            </div>
          </div>

          <!-- 模拟支付按钮（开发测试用） -->
          <el-alert
            type="warning"
            title="开发测试模式"
            description="这是模拟支付，点击下方按钮模拟支付成功"
            :closable="false"
            style="margin-bottom: 20px"
          />
          <el-button
            type="success"
            size="large"
            class="mock-pay-btn"
            @click="mockPayment"
          >
            模拟支付成功
          </el-button>
        </div>

        <!-- 支付按钮 -->
        <el-button
          v-else
          type="primary"
          size="large"
          class="pay-btn"
          :loading="paying"
          @click="createPayment"
        >
          立即支付
        </el-button>

        <!-- 返回订单 -->
        <el-button
          text
          class="back-btn"
          @click="router.push('/user/orders')"
        >
          返回我的订单
        </el-button>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { paymentApi } from '@/api/payment'
import { ElMessage } from 'element-plus'

const router = useRouter()
const route = useRoute()

const loading = ref(false)
const paying = ref(false)
const paymentMethod = ref('alipay')
const orderInfo = ref({
  orderNo: '',
  totalAmount: 0,
})
const paymentData = ref<any>(null)

// 格式化时间
const formatTime = (time: string) => {
  return new Date(time).toLocaleString('zh-CN')
}

// 创建支付订单
const createPayment = async () => {
  const orderId = route.query.orderId
  if (!orderId) {
    ElMessage.error('订单ID不能为空')
    return
  }

  paying.value = true
  try {
    const res = await paymentApi.create({
      orderId: Number(orderId),
      paymentMethod: paymentMethod.value as 'alipay' | 'wechat',
    })

    paymentData.value = res.data
    ElMessage.success('支付订单创建成功，请扫码支付')
  } catch (error: any) {
    ElMessage.error(error.message || '创建支付订单失败')
  } finally {
    paying.value = false
  }
}

// 模拟支付（开发测试）
const mockPayment = async () => {
  try {
    await paymentApi.callback({
      paymentNo: paymentData.value.paymentNo,
      orderId: route.query.orderId,
      status: 'success',
      sign: 'mock_sign',
    })

    ElMessage.success('支付成功！')

    // 3秒后跳转到订单列表
    setTimeout(() => {
      router.push('/user/orders')
    }, 3000)
  } catch (error: any) {
    ElMessage.error(error.message || '支付失败')
  }
}

// 加载订单信息
const loadOrderInfo = async () => {
  const orderId = route.query.orderId
  if (!orderId) {
    ElMessage.error('订单ID不能为空')
    router.push('/cart')
    return
  }

  // 这里应该调用订单详情API，暂时使用模拟数据
  orderInfo.value = {
    orderNo: `ORDER${Date.now()}`,
    totalAmount: 256,
  }
}

onMounted(() => {
  loadOrderInfo()
})
</script>

<style scoped>
.payment-page {
  background: #f5f5f5;
  min-height: 100vh;
  padding: 40px 0;
}

.payment-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 20px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 24px;
  text-align: center;
  color: #333;
}

.order-info {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 24px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.info-item:last-child {
  margin-bottom: 0;
}

.info-item .label {
  color: #666;
  font-size: 14px;
}

.info-item .value {
  color: #333;
  font-size: 14px;
}

.info-item .value.amount {
  color: #ff6b35;
  font-size: 24px;
  font-weight: 600;
}

.payment-methods {
  margin-bottom: 24px;
}

.payment-methods h3 {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
}

.method-group {
  display: flex;
  gap: 16px;
}

.method-item {
  flex: 1;
  border: 2px solid #e4e7ed;
  border-radius: 8px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s;
}

.method-item:hover {
  border-color: #409eff;
}

.method-item.is-checked {
  border-color: #409eff;
  background: #f0f9ff;
}

.method-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.method-icon {
  font-size: 32px;
}

.method-name {
  font-size: 16px;
  font-weight: 600;
}

.qrcode-section {
  text-align: center;
  padding: 24px 0;
}

.qrcode-container {
  margin-bottom: 24px;
}

.qrcode {
  width: 200px;
  height: 200px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
}

.qrcode-tip {
  margin-top: 12px;
  color: #666;
  font-size: 14px;
}

.payment-info {
  max-width: 400px;
  margin: 0 auto 24px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px dashed #e4e7ed;
}

.info-row:last-child {
  border-bottom: none;
}

.mock-pay-btn {
  width: 100%;
  max-width: 400px;
  margin-top: 20px;
}

.pay-btn {
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
  display: block;
  height: 48px;
  font-size: 16px;
}

.back-btn {
  display: block;
  margin: 16px auto 0;
  color: #666;
}

@media (max-width: 768px) {
  .payment-container {
    padding: 0 12px;
  }

  .page-title {
    font-size: 20px;
  }

  .method-group {
    flex-direction: column;
  }

  .qrcode {
    width: 160px;
    height: 160px;
  }
}
</style>
