<template>
  <div class="orders-page">
    <h2 class="page-title">我的订单</h2>

    <!-- 订单状态筛选 -->
    <el-tabs v-model="activeTab" class="order-tabs">
      <el-tab-pane label="全部" name="all" />
      <el-tab-pane label="待付款" name="pending" />
      <el-tab-pane label="待发货" name="paid" />
      <el-tab-pane label="待收货" name="shipped" />
      <el-tab-pane label="已完成" name="completed" />
      <el-tab-pane label="已取消" name="cancelled" />
    </el-tabs>

    <!-- 订单列表 -->
    <div v-if="filteredOrders.length > 0" class="orders-list">
      <div
        v-for="order in filteredOrders"
        :key="order.id"
        class="order-card"
      >
        <div class="order-header">
          <div class="order-info">
            <span class="order-no">订单号: {{ order.orderNo }}</span>
            <span class="order-time">{{ order.createdAt }}</span>
          </div>
          <el-tag :type="statusTypeMap[order.status]">
            {{ statusTextMap[order.status] }}
          </el-tag>
        </div>

        <div class="order-items">
          <div
            v-for="item in order.items"
            :key="item.id"
            class="order-item"
          >
            <img :src="item.image" :alt="item.name" class="item-image" />
            <div class="item-info">
              <h4>{{ item.name }}</h4>
              <p class="item-specs">{{ item.specs }}</p>
              <p class="item-price">¥{{ item.price }} x {{ item.quantity }}</p>
            </div>
          </div>
        </div>

        <div class="order-footer">
          <div class="order-address">
            <el-icon><Location /></el-icon>
            <span>{{ order.address.name }} {{ order.address.phone }}</span>
            <span class="address-detail">
              {{ order.address.province }} {{ order.address.city }}
              {{ order.address.district }} {{ order.address.detail }}
            </span>
          </div>

          <div class="order-actions">
            <div class="order-total">
              合计: <span class="total-amount">¥{{ order.pricing.total }}</span>
            </div>
            <div class="action-buttons">
              <el-button
                v-if="order.status === 'pending'"
                type="primary"
                size="small"
                @click="handlePay(order)"
              >
                立即支付
              </el-button>
              <el-button
                v-if="order.status === 'shipped'"
                type="primary"
                size="small"
                @click="handleConfirmReceipt(order)"
              >
                确认收货
              </el-button>
              <el-button
                v-if="order.status === 'completed'"
                size="small"
                @click="handleReview(order)"
              >
                评价
              </el-button>
              <el-button
                size="small"
                @click="handleViewDetail(order)"
              >
                查看详情
              </el-button>
              <el-button
                v-if="order.status === 'pending'"
                size="small"
                @click="handleCancel(order)"
              >
                取消订单
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <el-empty
      v-else
      description="暂无订单"
    />

    <!-- 订单详情弹窗 -->
    <el-dialog
      v-model="detailVisible"
      title="订单详情"
      width="700px"
    >
      <div v-if="selectedOrder" class="order-detail">
        <div class="detail-section">
          <h3>订单信息</h3>
          <div class="info-row">
            <span class="label">订单号:</span>
            <span>{{ selectedOrder.orderNo }}</span>
          </div>
          <div class="info-row">
            <span class="label">创建时间:</span>
            <span>{{ selectedOrder.createdAt }}</span>
          </div>
          <div class="info-row">
            <span class="label">订单状态:</span>
            <el-tag :type="statusTypeMap[selectedOrder.status]">
              {{ statusTextMap[selectedOrder.status] }}
            </el-tag>
          </div>
        </div>

        <div class="detail-section">
          <h3>商品信息</h3>
          <div
            v-for="item in selectedOrder.items"
            :key="item.id"
            class="detail-item"
          >
            <img :src="item.image" :alt="item.name" />
            <div class="item-detail">
              <h4>{{ item.name }}</h4>
              <p>{{ item.specs }}</p>
              <p class="price">¥{{ item.price }} x {{ item.quantity }}</p>
            </div>
          </div>
        </div>

        <div class="detail-section">
          <h3>收货地址</h3>
          <p>{{ selectedOrder.address.name }} {{ selectedOrder.address.phone }}</p>
          <p>
            {{ selectedOrder.address.province }}
            {{ selectedOrder.address.city }}
            {{ selectedOrder.address.district }}
            {{ selectedOrder.address.detail }}
          </p>
        </div>

        <div class="detail-section">
          <h3>费用明细</h3>
          <div class="pricing-detail">
            <div class="pricing-row">
              <span>商品金额</span>
              <span>¥{{ selectedOrder.pricing.subtotal }}</span>
            </div>
            <div class="pricing-row">
              <span>优惠金额</span>
              <span class="discount">-¥{{ selectedOrder.pricing.discount }}</span>
            </div>
            <div class="pricing-row">
              <span>运费</span>
              <span>¥{{ selectedOrder.pricing.shipping }}</span>
            </div>
            <div class="pricing-row total">
              <span>实付金额</span>
              <span class="amount">¥{{ selectedOrder.pricing.total }}</span>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Location } from '@element-plus/icons-vue'
import type { Order } from '@/types'

const activeTab = ref('all')

// 模拟订单数据
const orders = ref<Order[]>([
  {
    id: '1',
    orderNo: '202412021234567890',
    status: 'pending',
    items: [
      {
        id: 'i1',
        productId: 'p1',
        name: '皇家狗粮成犬粮',
        image: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=200&h=200&fit=crop',
        specs: '10kg装',
        price: 299,
        quantity: 1,
        stock: 100,
        selected: true,
        available: true,
      },
    ],
    address: {
      id: 'a1',
      name: '张三',
      phone: '138****1234',
      province: '北京市',
      city: '北京市',
      district: '朝阳区',
      detail: '望京SOHO T3 1001室',
      isDefault: true,
    },
    pricing: {
      subtotal: 299,
      discount: 20,
      shipping: 0,
      total: 279,
    },
    createdAt: '2024-12-02 10:30:00',
  },
  {
    id: '2',
    orderNo: '202411281234567891',
    status: 'shipped',
    items: [
      {
        id: 'i2',
        productId: 'p2',
        name: '猫爬架多层豪华款',
        image: 'https://images.unsplash.com/photo-1545249390-6bdfa286032f?w=200&h=200&fit=crop',
        specs: '灰色/大号',
        price: 399,
        quantity: 1,
        stock: 50,
        selected: true,
        available: true,
      },
    ],
    address: {
      id: 'a1',
      name: '张三',
      phone: '138****1234',
      province: '北京市',
      city: '北京市',
      district: '朝阳区',
      detail: '望京SOHO T3 1001室',
      isDefault: true,
    },
    pricing: {
      subtotal: 399,
      discount: 0,
      shipping: 10,
      total: 409,
    },
    createdAt: '2024-11-28 14:20:00',
    paidAt: '2024-11-28 14:25:00',
    shippedAt: '2024-11-29 09:00:00',
  },
  {
    id: '3',
    orderNo: '202411201234567892',
    status: 'completed',
    items: [
      {
        id: 'i3',
        productId: 'p3',
        name: '宠物自动饮水机',
        image: 'https://images.unsplash.com/photo-1579164029149-cf0c20a1d9a2?w=200&h=200&fit=crop',
        specs: '2.5L容量',
        price: 129,
        quantity: 1,
        stock: 200,
        selected: true,
        available: true,
      },
    ],
    address: {
      id: 'a1',
      name: '张三',
      phone: '138****1234',
      province: '北京市',
      city: '北京市',
      district: '朝阳区',
      detail: '望京SOHO T3 1001室',
      isDefault: true,
    },
    pricing: {
      subtotal: 129,
      discount: 10,
      shipping: 0,
      total: 119,
    },
    createdAt: '2024-11-20 16:00:00',
    paidAt: '2024-11-20 16:05:00',
    shippedAt: '2024-11-21 10:00:00',
    completedAt: '2024-11-25 15:30:00',
  },
])

const statusTextMap: Record<Order['status'], string> = {
  pending: '待付款',
  paid: '待发货',
  shipped: '待收货',
  completed: '已完成',
  cancelled: '已取消',
}

const statusTypeMap: Record<Order['status'], any> = {
  pending: 'warning',
  paid: 'primary',
  shipped: 'info',
  completed: 'success',
  cancelled: 'info',
}

// 筛选订单
const filteredOrders = computed(() => {
  if (activeTab.value === 'all') {
    return orders.value
  }
  return orders.value.filter((order) => order.status === activeTab.value)
})

// 详情相关
const detailVisible = ref(false)
const selectedOrder = ref<Order | null>(null)

const handleViewDetail = (order: Order) => {
  selectedOrder.value = order
  detailVisible.value = true
}

// 支付
const handlePay = async (order: Order) => {
  try {
    await ElMessageBox.confirm('确认支付该订单?', '提示', {
      confirmButtonText: '确认支付',
      cancelButtonText: '取消',
    })

    // 模拟支付
    const index = orders.value.findIndex((o) => o.id === order.id)
    if (index > -1) {
      orders.value[index].status = 'paid'
      orders.value[index].paidAt = new Date().toLocaleString()
      ElMessage.success('支付成功')
    }
  } catch {
    // 取消支付
  }
}

// 确认收货
const handleConfirmReceipt = async (order: Order) => {
  try {
    await ElMessageBox.confirm('确认收到商品?', '提示', {
      confirmButtonText: '确认收货',
      cancelButtonText: '取消',
    })

    const index = orders.value.findIndex((o) => o.id === order.id)
    if (index > -1) {
      orders.value[index].status = 'completed'
      orders.value[index].completedAt = new Date().toLocaleString()
      ElMessage.success('收货成功')
    }
  } catch {
    // 取消
  }
}

// 评价
const handleReview = (order: Order) => {
  ElMessage.info('评价功能开发中')
}

// 取消订单
const handleCancel = async (order: Order) => {
  try {
    await ElMessageBox.confirm('确定要取消该订单吗?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    const index = orders.value.findIndex((o) => o.id === order.id)
    if (index > -1) {
      orders.value[index].status = 'cancelled'
      ElMessage.success('订单已取消')
    }
  } catch {
    // 取消操作
  }
}
</script>

<style scoped lang="scss">
.orders-page {
  .page-title {
    margin: 0 0 25px 0;
    font-size: 24px;
    color: #1f2937;
  }

  .order-tabs {
    margin-bottom: 25px;
  }
}

.orders-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.order-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;

  .order-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px 20px;
    background: #f9fafb;
    border-bottom: 1px solid #e5e7eb;

    .order-info {
      display: flex;
      gap: 20px;
      font-size: 14px;
      color: #6b7280;

      .order-no {
        font-weight: 500;
        color: #374151;
      }
    }
  }

  .order-items {
    padding: 20px;
    border-bottom: 1px solid #e5e7eb;
  }

  .order-item {
    display: flex;
    gap: 15px;

    &:not(:last-child) {
      margin-bottom: 15px;
      padding-bottom: 15px;
      border-bottom: 1px solid #f3f4f6;
    }

    .item-image {
      width: 80px;
      height: 80px;
      border-radius: 8px;
      object-fit: cover;
      flex-shrink: 0;
    }

    .item-info {
      flex: 1;

      h4 {
        margin: 0 0 5px 0;
        font-size: 15px;
        color: #1f2937;
      }

      p {
        margin: 0 0 3px 0;
        font-size: 13px;
        color: #9ca3af;
      }

      .item-specs {
        color: #6b7280;
      }

      .item-price {
        color: #1f2937;
        font-weight: 500;
      }
    }
  }

  .order-footer {
    padding: 20px;
    background: #fafbfc;

    .order-address {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 15px;
      padding: 12px;
      background: white;
      border-radius: 8px;
      font-size: 14px;
      color: #374151;

      .el-icon {
        color: #ff6b35;
        font-size: 16px;
      }

      .address-detail {
        color: #6b7280;
      }
    }

    .order-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .order-total {
        font-size: 14px;
        color: #6b7280;

        .total-amount {
          font-size: 20px;
          font-weight: 600;
          color: #ff6b35;
          margin-left: 5px;
        }
      }

      .action-buttons {
        display: flex;
        gap: 10px;
      }
    }
  }
}

// 订单详情
.order-detail {
  .detail-section {
    padding: 20px 0;
    border-bottom: 1px solid #f3f4f6;

    &:last-child {
      border-bottom: none;
    }

    h3 {
      margin: 0 0 15px 0;
      font-size: 16px;
      color: #1f2937;
    }

    .info-row {
      display: flex;
      gap: 15px;
      margin-bottom: 10px;
      font-size: 14px;

      .label {
        color: #9ca3af;
        min-width: 80px;
      }
    }

    .detail-item {
      display: flex;
      gap: 15px;
      padding: 12px 0;

      &:not(:last-child) {
        border-bottom: 1px solid #f9fafb;
      }

      img {
        width: 60px;
        height: 60px;
        border-radius: 6px;
        object-fit: cover;
      }

      .item-detail {
        flex: 1;

        h4 {
          margin: 0 0 5px 0;
          font-size: 14px;
          color: #1f2937;
        }

        p {
          margin: 0 0 3px 0;
          font-size: 13px;
          color: #6b7280;
        }

        .price {
          color: #1f2937;
          font-weight: 500;
        }
      }
    }

    p {
      margin: 0 0 8px 0;
      color: #374151;
      font-size: 14px;
      line-height: 1.6;
    }

    .pricing-detail {
      .pricing-row {
        display: flex;
        justify-content: space-between;
        padding: 10px 0;
        font-size: 14px;
        color: #6b7280;

        .discount {
          color: #ef4444;
        }

        &.total {
          border-top: 1px solid #e5e7eb;
          margin-top: 10px;
          padding-top: 15px;
          font-size: 15px;
          font-weight: 600;
          color: #1f2937;

          .amount {
            color: #ff6b35;
            font-size: 20px;
          }
        }
      }
    }
  }
}

// 响应式
@media (max-width: 768px) {
  .order-card {
    .order-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 10px;
    }

    .order-footer {
      .order-address {
        flex-direction: column;
        align-items: flex-start;
      }

      .order-actions {
        flex-direction: column;
        gap: 15px;

        .action-buttons {
          width: 100%;
          flex-wrap: wrap;

          .el-button {
            flex: 1;
          }
        }
      }
    }
  }
}
</style>
