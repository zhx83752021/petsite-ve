<template>
  <LayoutMain>
    <div v-loading="loading" class="product-detail-page">
      <div class="detail-container">
        <!-- 面包屑 -->
        <el-breadcrumb separator=">" class="breadcrumb">
          <el-breadcrumb-item :to="{ path: '/' }">
            首页
          </el-breadcrumb-item>
          <el-breadcrumb-item :to="{ path: '/shop' }">
            商城
          </el-breadcrumb-item>
          <el-breadcrumb-item>{{ product?.name }}</el-breadcrumb-item>
        </el-breadcrumb>

        <!-- 商品主要信息 -->
        <div class="product-main">
          <!-- 左侧:图片展示 -->
          <div class="product-gallery">
            <div class="main-image">
              <img :src="currentImage" alt="商品图片">
            </div>
            <div class="image-thumbs">
              <div v-for="(img, index) in product?.images" :key="index" class="thumb-item"
                :class="{ active: currentImage === img }" @click="currentImage = img">
                <img :src="img" alt="">
              </div>
            </div>
          </div>

          <!-- 右侧:商品信息 -->
          <div class="product-info">
            <h1 class="product-title">
              {{ product?.name }}
            </h1>

            <div class="product-stats">
              <span>好评率 {{ product?.rating }}%</span>
              <span class="divider">|</span>
              <span>月销 {{ product?.sales }}+</span>
            </div>

            <div class="product-price">
              <div class="current-price">
                <span class="symbol">¥</span>
                <span class="value">{{ selectedSpec?.price || product?.price }}</span>
              </div>
              <div v-if="product?.originalPrice" class="original-price">
                ¥{{ product.originalPrice }}
              </div>
              <div class="vip-price">
                会员价 ¥{{ ((selectedSpec?.price || product?.price || 0) * 0.95).toFixed(0) }}
              </div>
            </div>

            <div class="product-specs">
              <div class="spec-item">
                <label>规格:</label>
                <div class="spec-options">
                  <div v-for="spec in product?.specs" :key="spec.id" class="spec-option"
                    :class="{ active: selectedSpec?.id === spec.id, disabled: spec.stock === 0 }"
                    @click="selectSpec(spec)">
                    {{ spec.value }}
                  </div>
                </div>
              </div>

              <div class="spec-item">
                <label>数量:</label>
                <el-input-number v-model="quantity" :min="1" :max="selectedSpec?.stock || product?.stock || 999" />
                <span class="stock-info">库存: {{ selectedSpec?.stock || product?.stock || 0 }}</span>
              </div>
            </div>

            <div class="product-promotions">
              <div class="promotion-item">
                <span class="label">促销:</span>
                <span class="value">满200减30,满500减80</span>
              </div>
              <div class="promotion-item">
                <span class="label">服务:</span>
                <span class="value">
                  <el-tag size="small" type="success">正品保障</el-tag>
                  <el-tag size="small" type="success">7天无理由</el-tag>
                  <el-tag size="small" type="success">急速发货</el-tag>
                </span>
              </div>
            </div>

            <div class="product-actions">
              <el-button type="warning" size="large" @click="addToCart">
                <el-icon>
                  <ShoppingCart />
                </el-icon>
                加入购物车
              </el-button>
              <el-button type="danger" size="large" @click="buyNow">
                立即购买
              </el-button>
            </div>
          </div>
        </div>

        <!-- 商品详情标签 -->
        <div class="product-details">
          <el-tabs v-model="activeTab">
            <el-tab-pane label="商品详情" name="details">
              <div class="detail-content" v-html="product?.details" />
            </el-tab-pane>

            <el-tab-pane :label="`用户评价(${product?.reviews?.length || 0})`" name="reviews">
              <div class="reviews-section">
                <div class="reviews-summary">
                  <div class="rating-score">
                    <div class="score">
                      {{ product?.rating }}
                    </div>
                    <el-rate v-model="ratingValue" disabled show-score text-color="#ff9900" />
                    <div class="total">
                      好评度 {{ product?.rating }}%
                    </div>
                  </div>
                  <div class="rating-filters">
                    <el-radio-group v-model="reviewFilter">
                      <el-radio-button label="all">
                        全部
                      </el-radio-button>
                      <el-radio-button label="good">
                        好评
                      </el-radio-button>
                      <el-radio-button label="medium">
                        中评
                      </el-radio-button>
                      <el-radio-button label="bad">
                        差评
                      </el-radio-button>
                      <el-radio-button label="images">
                        有图
                      </el-radio-button>
                    </el-radio-group>
                  </div>
                </div>

                <div class="reviews-list">
                  <div v-for="review in filteredReviews" :key="review.id" class="review-item">
                    <div class="review-header">
                      <el-avatar :src="review.avatar">
                        {{ review.userName.charAt(0) }}
                      </el-avatar>
                      <div class="review-user">
                        <div class="user-name">
                          {{ review.userName }}
                        </div>
                        <el-rate v-model="review.rating" disabled size="small" />
                      </div>
                      <div class="review-date">
                        {{ review.createdAt }}
                      </div>
                    </div>
                    <div class="review-content">
                      {{ review.content }}
                    </div>
                    <div v-if="review.images" class="review-images">
                      <img v-for="(img, idx) in review.images" :key="idx" :src="img" alt="">
                    </div>
                    <div class="review-specs">
                      规格: {{ review.specs }}
                    </div>
                    <div class="review-actions">
                      <span class="helpful">
                        <el-icon>
                          <Goods />
                        </el-icon>
                        有帮助 ({{ review.helpful }})
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>
      </div>
    </div>
  </LayoutMain>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ShoppingCart, Goods } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import LayoutMain from '@/components/LayoutMain.vue'
import { cartApi } from '@/api/cart'
import { productApi } from '@/api/product'
import type { Product, ProductSpec, Review } from '@/types'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const product = ref<Product | null>(null)
const currentImage = ref('')
const selectedSpec = ref<ProductSpec | null>(null)
const quantity = ref(1)
const activeTab = ref('details')
const reviewFilter = ref('all')
const ratingValue = ref(4.9)

// 加载商品数据
const loadProduct = async () => {
  loading.value = true
  try {
    const res = await productApi.getDetail(route.params.id as string)
    const data = res.data

    // 转换后端数据为前端格式
    product.value = {
      id: data.id,
      image: data.images?.[0] || 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=800',
      name: data.name,
      price: data.price,
      originalPrice: data.originalPrice,
      sales: data.sales || 0,
      rating: data.rating || 4.9,
      tags: [],
      description: data.description,
      stock: data.stock,
      images: data.images && data.images.length > 0
        ? data.images
        : ['https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=800'],
      specs: data.skus?.map((sku: any) => ({
        id: sku.id,
        name: '规格',
        value: sku.value || sku.name,
        price: sku.price,
        stock: sku.stock,
      })) || [],
      details: data.details || '<p>暂无详细介绍</p>',
      reviews: [
        {
          id: '1',
          userId: '1',
          userName: '爱宠之家',
          avatar: 'https://i.pravatar.cc/150?img=1',
          rating: 5,
          content: '质量很好,狗狗很爱吃,包装完整,物流很快!',
          images: [
            'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=200',
            'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=200',
          ],
          specs: data.skus?.[0]?.value || '默认规格',
          createdAt: '2024-01-15',
          helpful: 126,
        },
        {
          id: '2',
          userId: '2',
          userName: '小狗妈妈',
          avatar: 'https://i.pravatar.cc/150?img=2',
          rating: 5,
          content: '一直买这款,狗狗吃了毛色很亮,便便也正常。',
          specs: data.skus?.[0]?.value || '默认规格',
          createdAt: '2024-01-14',
          helpful: 89,
        },
      ],
    }

    currentImage.value = product.value.images[0]
    // 默认选择第一个规格
    if (product.value.specs && product.value.specs.length > 0) {
      selectedSpec.value = product.value.specs[0]
    }
  } catch (error: any) {
    console.error('加载商品失败:', error)
    ElMessage.error('加载商品失败')
  } finally {
    loading.value = false
  }
}

// 选择规格
const selectSpec = (spec: ProductSpec) => {
  if (spec.stock > 0) {
    selectedSpec.value = spec
  }
}

// 筛选评价
const filteredReviews = computed(() => {
  if (!product.value?.reviews) return []

  let reviews = product.value.reviews

  switch (reviewFilter.value) {
    case 'good':
      return reviews.filter((r) => r.rating >= 4)
    case 'medium':
      return reviews.filter((r) => r.rating === 3)
    case 'bad':
      return reviews.filter((r) => r.rating < 3)
    case 'images':
      return reviews.filter((r) => r.images && r.images.length > 0)
    default:
      return reviews
  }
})

// 加入购物车
const addToCart = async () => {
  if (!selectedSpec.value) {
    ElMessage.warning('请选择商品规格')
    return
  }

  try {
    loading.value = true
    await cartApi.add({
      productId: product.value?.id || '',
      quantity: quantity.value,
      skuId: selectedSpec.value.id,
    })
    ElMessage.success('已加入购物车')
  } catch (error: any) {
    console.error('加入购物车失败:', error)
    if (error.response?.status === 401) {
      ElMessage.warning('请先登录')
    } else {
      ElMessage.error('加入购物车失败')
    }
  } finally {
    loading.value = false
  }
}

// 立即购买
const buyNow = () => {
  if (!selectedSpec.value) {
    ElMessage.warning('请选择商品规格')
    return
  }
  // TODO: 跳转到订单确认页
  router.push('/checkout')
}

onMounted(() => {
  loadProduct()
})
</script>

<style scoped lang="scss">
.product-detail-page {
  background: #f5f7fa;
  min-height: calc(100vh - 64px);
  padding-bottom: 48px;
}

.detail-container {
  max-width: 1440px;
  margin: 0 auto;
  padding: 24px;
}

.breadcrumb {
  background: #fff;
  padding: 16px 24px;
  border-radius: 8px;
  margin-bottom: 16px;
}

// 商品主要信息
.product-main {
  display: grid;
  grid-template-columns: 480px 1fr;
  gap: 24px;
  background: #fff;
  padding: 32px;
  border-radius: 8px;
  margin-bottom: 16px;
}

// 图片展示
.product-gallery {
  .main-image {
    width: 100%;
    height: 480px;
    border-radius: 8px;
    overflow: hidden;
    margin-bottom: 16px;
    background: #f5f5f5;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  .image-thumbs {
    display: flex;
    gap: 8px;

    .thumb-item {
      width: 80px;
      height: 80px;
      border-radius: 4px;
      overflow: hidden;
      cursor: pointer;
      border: 2px solid transparent;
      transition: all 0.3s;

      &.active,
      &:hover {
        border-color: #ff6b35;
      }

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }
  }
}

// 商品信息
.product-info {
  .product-title {
    font-size: 24px;
    font-weight: 600;
    color: #333;
    margin: 0 0 16px;
  }

  .product-stats {
    font-size: 14px;
    color: #666;
    margin-bottom: 24px;

    .divider {
      margin: 0 12px;
    }
  }

  .product-price {
    background: #fff5f2;
    padding: 16px;
    border-radius: 8px;
    margin-bottom: 24px;
    display: flex;
    align-items: baseline;
    gap: 16px;

    .current-price {
      display: flex;
      align-items: baseline;
      color: #ff6b35;

      .symbol {
        font-size: 20px;
        font-weight: 500;
      }

      .value {
        font-size: 36px;
        font-weight: bold;
      }
    }

    .original-price {
      font-size: 16px;
      color: #999;
      text-decoration: line-through;
    }

    .vip-price {
      font-size: 14px;
      color: #ff6b35;
      background: #fff;
      padding: 4px 12px;
      border-radius: 4px;
    }
  }
}

.product-specs {
  .spec-item {
    display: flex;
    align-items: center;
    margin-bottom: 24px;

    label {
      width: 80px;
      font-size: 14px;
      color: #666;
    }

    .spec-options {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;

      .spec-option {
        padding: 8px 20px;
        border: 1px solid #dcdfe6;
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.3s;

        &:hover {
          border-color: #ff6b35;
          color: #ff6b35;
        }

        &.active {
          border-color: #ff6b35;
          background: #fff5f2;
          color: #ff6b35;
        }

        &.disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
      }
    }

    .stock-info {
      margin-left: 16px;
      font-size: 14px;
      color: #999;
    }
  }
}

.product-promotions {
  margin-bottom: 32px;

  .promotion-item {
    display: flex;
    align-items: center;
    margin-bottom: 12px;
    font-size: 14px;

    .label {
      width: 80px;
      color: #666;
    }

    .value {
      color: #ff6b35;
      display: flex;
      gap: 8px;
    }
  }
}

.product-actions {
  display: flex;
  gap: 16px;

  .el-button {
    flex: 1;
  }
}

// 商品详情标签
.product-details {
  background: #fff;
  padding: 32px;
  border-radius: 8px;
}

.detail-content {
  padding: 24px 0;
  line-height: 1.8;

  :deep(h3) {
    font-size: 18px;
    margin: 24px 0 12px;
  }

  :deep(p) {
    margin: 12px 0;
  }

  :deep(ul) {
    padding-left: 24px;

    li {
      margin: 8px 0;
    }
  }
}

// 评价部分
.reviews-section {
  .reviews-summary {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 24px;
    background: #f8f9fa;
    border-radius: 8px;
    margin-bottom: 24px;

    .rating-score {
      text-align: center;

      .score {
        font-size: 48px;
        font-weight: bold;
        color: #ff6b35;
      }

      .total {
        margin-top: 8px;
        color: #666;
      }
    }
  }
}

.reviews-list {
  .review-item {
    padding: 24px;
    border-bottom: 1px solid #e4e7ed;

    &:last-child {
      border-bottom: none;
    }
  }

  .review-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 12px;

    .review-user {
      flex: 1;

      .user-name {
        font-weight: 500;
        margin-bottom: 4px;
      }
    }

    .review-date {
      color: #999;
      font-size: 13px;
    }
  }

  .review-content {
    margin-bottom: 12px;
    line-height: 1.6;
  }

  .review-images {
    display: flex;
    gap: 8px;
    margin-bottom: 12px;

    img {
      width: 100px;
      height: 100px;
      object-fit: cover;
      border-radius: 4px;
      cursor: pointer;
    }
  }

  .review-specs {
    font-size: 13px;
    color: #999;
    margin-bottom: 8px;
  }

  .review-actions {
    .helpful {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      color: #666;
      font-size: 13px;
      cursor: pointer;

      &:hover {
        color: #ff6b35;
      }
    }
  }
}

// 响应式
@media (max-width: 1024px) {
  .product-main {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .detail-container {
    padding: 12px;
  }

  .product-main {
    padding: 16px;
  }

  .product-gallery .main-image {
    height: 300px;
  }

  .product-info .product-title {
    font-size: 18px;
  }

  .product-price .current-price .value {
    font-size: 28px;
  }

  .product-actions {
    flex-direction: column;
  }

  .reviews-summary {
    flex-direction: column;
    gap: 16px;
  }
}
</style>
