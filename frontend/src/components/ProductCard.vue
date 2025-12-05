<template>
  <div class="product-card" @click="handleClick">
    <div class="product-image">
      <img :src="imageUrl" :alt="product.name" @error="handleImageError" @load="handleImageLoad">
      <div v-if="imageError" class="image-placeholder">
        <el-icon :size="48">
          <Picture />
        </el-icon>
        <p>图片加载失败</p>
      </div>
      <div v-if="product.tags && product.tags.length" class="product-tags">
        <span v-for="tag in product.tags" :key="tag" class="tag">{{ tag }}</span>
      </div>
    </div>
    <div class="product-info">
      <h4 class="product-name">
        {{ product.name }}
      </h4>
      <div class="product-price">
        <span class="price">¥{{ product.price }}</span>
        <span v-if="product.originalPrice" class="original-price">¥{{ product.originalPrice }}</span>
      </div>
      <div class="product-meta">
        <span class="sales">销量 {{ formatNumber(product.sales) }}</span>
        <span class="rating">
          <el-icon>
            <StarFilled />
          </el-icon>
          {{ product.rating }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { StarFilled, Picture } from '@element-plus/icons-vue'
import type { ProductCard } from '@/types'

interface Props {
  product: ProductCard
}

const props = defineProps<Props>()

const router = useRouter()
const imageError = ref(false)
const retryCount = ref(0)
const maxRetries = 2

// 默认占位图
const placeholderImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iI2Y1ZjVmNSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj7lm77niYfliqDovb3kuK08L3RleHQ+PC9zdmc+'

const imageUrl = computed(() => {
  if (imageError.value) {
    return placeholderImage
  }
  return props.product.image || placeholderImage
})

const handleImageError = () => {
  if (retryCount.value < maxRetries) {
    // 尝试重新加载
    retryCount.value++
    setTimeout(() => {
      const img = new Image()
      img.src = props.product.image
      img.onload = () => {
        imageError.value = false
      }
      img.onerror = () => {
        imageError.value = true
      }
    }, 1000 * retryCount.value)
  } else {
    imageError.value = true
  }
}

const handleImageLoad = () => {
  imageError.value = false
}

const handleClick = () => {
  // 直接跳转到商品详情页
  router.push(`/product/${props.product.id}`)
}

const formatNumber = (num: number): string => {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + '万'
  }
  return num.toString()
}
</script>

<style scoped lang="scss">
.product-card {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  }
}

.product-image {
  position: relative;
  width: 100%;
  padding-top: 100%; // 1:1比例
  overflow: hidden;
  background: #f5f5f5;

  img {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s;
  }

  &:hover img {
    transform: scale(1.1);
  }
}

.image-placeholder {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  color: #ccc;
  z-index: 1;

  p {
    margin-top: 8px;
    font-size: 12px;
    color: #999;
  }
}

.product-tags {
  position: absolute;
  top: 8px;
  left: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 4px;

  .tag {
    padding: 4px 8px;
    font-size: 12px;
    color: #fff;
    background: rgba(255, 107, 53, 0.9);
    border-radius: 4px;
    font-weight: 500;
  }
}

.product-info {
  padding: 16px;
}

.product-name {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin: 0 0 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-height: 1.5;
  min-height: 42px;
}

.product-price {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 8px;

  .price {
    font-size: 20px;
    font-weight: bold;
    color: #ff6b35;
  }

  .original-price {
    font-size: 14px;
    color: #999;
    text-decoration: line-through;
  }
}

.product-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #999;

  .sales {
    color: #666;
  }

  .rating {
    display: flex;
    align-items: center;
    gap: 2px;
    color: #ff6b35;
    font-weight: 500;

    .el-icon {
      font-size: 14px;
    }
  }
}

// 移动端适配
@media (max-width: 768px) {
  .product-info {
    padding: 12px;
  }

  .product-name {
    font-size: 13px;
    min-height: 39px;
  }

  .product-price .price {
    font-size: 18px;
  }
}
</style>
