<template>
  <LayoutMain>
    <div class="cart-page">
      <div class="cart-container">
        <h2 class="page-title">
          购物车
        </h2>

        <!-- 购物车列表 -->
        <div v-if="cartItems.length > 0" class="cart-content">
          <div class="cart-list">
            <div class="cart-header">
              <el-checkbox v-model="allSelected" @change="handleSelectAll" />
              <span>全选</span>
              <span>商品信息</span>
              <span>单价</span>
              <span>数量</span>
              <span>小计</span>
              <span>操作</span>
            </div>

            <div v-for="item in cartItems" :key="item.id" class="cart-item">
              <el-checkbox v-model="item.selected" @change="handleItemCheck" />
              <img :src="item.image" :alt="item.name" class="item-image">
              <div class="item-info">
                <h3>{{ item.name }}</h3>
                <p v-if="item.sku">
                  规格: {{ item.sku }}
                </p>
              </div>
              <div class="item-price">
                ¥{{ item.price }}
              </div>
              <div class="item-quantity">
                <el-input-number v-model="item.quantity" :min="1" :max="item.stock"
                  @change="handleQuantityChange(item)" />
              </div>
              <div class="item-subtotal">
                ¥{{ (item.price * item.quantity).toFixed(2) }}
              </div>
              <div class="item-actions">
                <el-button link type="danger" @click="handleRemove(item.id)">
                  删除
                </el-button>
              </div>
            </div>
          </div>

          <!-- 结算区域 -->
          <div class="cart-summary">
            <div class="summary-item">
              <span>已选商品:</span>
              <span>{{ selectedCount }}件</span>
            </div>
            <div class="summary-item">
              <span>商品总价:</span>
              <span>¥{{ totalPrice.toFixed(2) }}</span>
            </div>
            <div class="summary-item">
              <span>运费:</span>
              <span>¥{{ shippingFee.toFixed(2) }}</span>
            </div>
            <div class="summary-total">
              <span>应付总额:</span>
              <span class="total-price">¥{{ finalPrice.toFixed(2) }}</span>
            </div>
            <el-button type="primary" size="large" :disabled="selectedCount === 0" @click="handleCheckout">
              去结算
            </el-button>
          </div>
        </div>

        <!-- 空状态 -->
        <el-empty v-else description="购物车还是空的" class="empty-cart">
          <el-button type="primary" @click="$router.push('/shop')">
            去逛逛
          </el-button>
        </el-empty>
      </div>
    </div>
  </LayoutMain>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import LayoutMain from '@/components/LayoutMain.vue'
import { cartApi } from '@/api/cart'

interface CartItem {
  id: string
  product_id: string
  name: string
  image: string
  price: number
  quantity: number
  stock: number
  sku?: string
  selected: boolean
}

const allSelected = ref(false)
const loading = ref(false)

// 购物车数据
const cartItems = ref<CartItem[]>([])

// 加载购物车数据
const loadCartItems = async () => {
  // 检查是否登录
  const token = localStorage.getItem('token')
  if (!token) {
    loading.value = false
    return
  }

  try {
    loading.value = true
    console.log('开始加载购物车...', 'Token:', !!token)
    const res = await cartApi.getList()
    console.log('购物车API响应:', res)
    if (res && res.code === 200) {
      cartItems.value = (res.data || []).map((item: any) => ({
        ...item,
        selected: true,
      }))
      console.log('购物车商品数量:', cartItems.value.length)
    } else {
      console.warn('购物车响应格式异常:', res)
    }
  } catch (error: any) {
    console.error('购物车加载完整错误:', error)
    console.error('错误响应:', error.response)
    console.error('错误状态:', error.response?.status)
    console.error('错误数据:', error.response?.data)

    if (error.response?.status === 401) {
      ElMessage.warning('请先登录')
      cartItems.value = []
    } else {
      const errorMsg = error.response?.data?.message || error.message || '加载购物车失败'
      console.error('显示的错误:', errorMsg)
      ElMessage.error(`加载购物车失败: ${errorMsg}`)
    }
  } finally {
    loading.value = false
  }
}

// 组件挂载时加载数据
onMounted(() => {
  loadCartItems()
})

// 已选商品数量
const selectedCount = computed(() => {
  return cartItems.value.filter((item) => item.selected).length
})

// 商品总价
const totalPrice = computed(() => {
  return cartItems.value
    .filter((item) => item.selected)
    .reduce((sum, item) => sum + item.price * item.quantity, 0)
})

// 运费
const shippingFee = computed(() => {
  return totalPrice.value >= 99 ? 0 : 10
})

// 应付总额
const finalPrice = computed(() => {
  return totalPrice.value + shippingFee.value
})

// 全选/取消全选
const handleSelectAll = (value: boolean) => {
  cartItems.value.forEach((item) => {
    item.selected = value
  })
}

// 单项选中状态变化
const handleItemCheck = () => {
  allSelected.value = cartItems.value.every((item) => item.selected)
}

// 数量变化
const handleQuantityChange = async (item: CartItem) => {
  try {
    await cartApi.update(item.id, { quantity: item.quantity })
    ElMessage.success('已更新商品数量')
  } catch (error) {
    ElMessage.error('更新失败')
    loadCartItems()
  }
}

// 删除商品
const handleRemove = (id: string) => {
  ElMessageBox.confirm('确定要删除该商品吗?', '提示', {
    type: 'warning',
  })
    .then(async () => {
      try {
        await cartApi.delete(id)
        ElMessage.success('删除成功')
        loadCartItems()
      } catch (error) {
        ElMessage.error('删除失败')
      }
    })
    .catch(() => { })
}

// 去结算
const handleCheckout = () => {
  if (selectedCount.value === 0) {
    ElMessage.warning('请选择要结算的商品')
    return
  }
  ElMessage.info('结算功能开发中')
  // router.push('/order/confirm')
}
</script>

<style scoped>
.cart-page {
  background: #f5f7fa;
  min-height: calc(100vh - 60px);
  padding: 24px 0;
}

.cart-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

.page-title {
  font-size: 24px;
  margin-bottom: 24px;
  color: #333;
}

.cart-content {
  display: flex;
  gap: 24px;
  align-items: flex-start;
}

.cart-list {
  flex: 1;
  background: white;
  border-radius: 8px;
  padding: 24px;
}

.cart-header {
  display: grid;
  grid-template-columns: 40px auto 120px 150px 120px 80px;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid #eee;
  font-weight: 500;
  color: #666;
}

.cart-header>span:first-of-type {
  grid-column: 1 / 3;
}

.cart-item {
  display: grid;
  grid-template-columns: 40px 80px auto 120px 150px 120px 80px;
  align-items: center;
  gap: 16px;
  padding: 16px 0;
  border-bottom: 1px solid #eee;
}

.item-image {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 4px;
}

.item-info h3 {
  font-size: 14px;
  color: #333;
  margin-bottom: 4px;
}

.item-info p {
  font-size: 12px;
  color: #999;
}

.item-price,
.item-subtotal {
  font-size: 16px;
  color: #ff6b35;
  font-weight: 500;
}

.cart-summary {
  width: 300px;
  background: white;
  border-radius: 8px;
  padding: 24px;
  position: sticky;
  top: 80px;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  font-size: 14px;
  color: #666;
}

.summary-total {
  display: flex;
  justify-content: space-between;
  padding: 16px 0;
  margin-top: 16px;
  border-top: 2px solid #eee;
  font-size: 16px;
  font-weight: 500;
}

.total-price {
  font-size: 24px;
  color: #ff6b35;
  font-weight: bold;
}

.cart-summary .el-button {
  width: 100%;
  margin-top: 24px;
}

.empty-cart {
  background: white;
  border-radius: 8px;
  padding: 48px;
}

@media (max-width: 768px) {
  .cart-content {
    flex-direction: column;
  }

  .cart-summary {
    width: 100%;
    position: static;
  }

  .cart-header,
  .cart-item {
    grid-template-columns: 30px 60px 1fr;
    gap: 8px;
  }

  .cart-header>span:nth-child(n + 4),
  .item-price,
  .item-quantity,
  .item-subtotal,
  .item-actions {
    display: none;
  }

  .item-info {
    grid-column: 3 / 4;
  }
}
</style>
