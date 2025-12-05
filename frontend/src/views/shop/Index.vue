<template>
  <LayoutMain>
    <div class="shop-page">
      <div class="shop-container">
        <!-- 面包屑 -->
        <div class="breadcrumb">
          <el-breadcrumb separator=">">
            <el-breadcrumb-item :to="{ path: '/' }">
              首页
            </el-breadcrumb-item>
            <el-breadcrumb-item>商城</el-breadcrumb-item>
            <el-breadcrumb-item v-if="currentCategory">
              {{ currentCategory.name }}
            </el-breadcrumb-item>
          </el-breadcrumb>
        </div>

        <div class="shop-content">
          <!-- 筛选侧边栏 -->
          <aside class="filter-sidebar">
            <div class="filter-section">
              <h4>分类</h4>
              <el-tree :data="categories" :props="{ label: 'name', children: 'children' }" node-key="id"
                default-expand-all @node-click="handleCategoryClick" />
            </div>

            <div class="filter-section">
              <h4>价格区间</h4>
              <div class="price-filter">
                <el-radio-group v-model="filters.priceRange" @change="handleFilterChange">
                  <el-radio label="all">
                    全部
                  </el-radio>
                  <el-radio label="0-100">
                    0-100元
                  </el-radio>
                  <el-radio label="100-200">
                    100-200元
                  </el-radio>
                  <el-radio label="200-500">
                    200-500元
                  </el-radio>
                  <el-radio label="500+">
                    500元以上
                  </el-radio>
                </el-radio-group>
              </div>
            </div>

            <div class="filter-section">
              <h4>品牌</h4>
              <el-checkbox-group v-model="filters.brands" @change="handleFilterChange">
                <el-checkbox v-for="brand in brands" :key="brand" :label="brand">
                  {{ brand }}
                </el-checkbox>
              </el-checkbox-group>
            </div>

            <div class="filter-section">
              <h4>标签</h4>
              <div class="tag-filter">
                <el-check-tag v-for="tag in tags" :key="tag" :checked="filters.tags.includes(tag)"
                  @change="handleTagToggle(tag)">
                  {{ tag }}
                </el-check-tag>
              </div>
            </div>

            <el-button type="default" class="reset-btn" @click="resetFilters">
              重置筛选
            </el-button>
          </aside>

          <!-- 商品列表 -->
          <main class="product-list">
            <!-- 排序栏 -->
            <div class="sort-bar">
              <div class="sort-item" :class="{ active: sortBy === 'default' }" @click="changeSort('default')">
                综合排序
              </div>
              <div class="sort-item" :class="{ active: sortBy === 'sales' }" @click="changeSort('sales')">
                销量
              </div>
              <div class="sort-item" :class="{ active: sortBy === 'price' }" @click="changePriceSort">
                价格
                <el-icon v-if="sortBy === 'price'">
                  <ArrowUp v-if="priceOrder === 'asc'" />
                  <ArrowDown v-else />
                </el-icon>
              </div>
              <div class="sort-item" :class="{ active: sortBy === 'rating' }" @click="changeSort('rating')">
                评价
              </div>
              <div class="result-count">
                共 {{ totalCount }} 件商品
              </div>
            </div>

            <!-- 商品网格 -->
            <div v-loading="loading" class="products-grid">
              <ProductCard v-for="product in products" :key="product.id" :product="product" />
            </div>

            <!-- 分页 -->
            <el-pagination v-model:current-page="pagination.page" v-model:page-size="pagination.pageSize"
              :total="totalCount" :page-sizes="[12, 24, 48]" layout="total, sizes, prev, pager, next, jumper"
              @size-change="handlePageSizeChange" @current-change="handlePageChange" />
          </main>
        </div>
      </div>
    </div>
  </LayoutMain>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { ArrowUp, ArrowDown } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import LayoutMain from '@/components/LayoutMain.vue'
import ProductCard from '@/components/ProductCard.vue'
import { productApi } from '@/api/product'
import type { ProductCard as ProductType, Category } from '@/types'

const route = useRoute()

const loading = ref(false)
const products = ref<ProductType[]>([])
const totalCount = ref(0)
const currentCategory = ref<Category | null>(null)

// 分类数据
const categories = ref<Category[]>([
  {
    id: '1',
    name: '宠物食品',
    icon: '🍖',
    children: [
      { id: '1-1', name: '犬粮', icon: '' },
      { id: '1-2', name: '猫粮', icon: '' },
      { id: '1-3', name: '零食', icon: '' }
    ]
  },
  {
    id: '2',
    name: '宠物用品',
    icon: '🎾',
    children: [
      { id: '2-1', name: '笼笼窝窝', icon: '' },
      { id: '2-2', name: '碗盆猫砂', icon: '' },
      { id: '2-3', name: '牵引绳', icon: '' }
    ]
  },
  {
    id: '3',
    name: '宠物玩具',
    icon: '🧸',
    children: [
      { id: '3-1', name: '互动玩具', icon: '' },
      { id: '3-2', name: '磨牙玩具', icon: '' },
      { id: '3-3', name: '智能玩具', icon: '' }
    ]
  },
  { id: '4', name: '医疗保健', icon: '💊' }
])

// 品牌数据
const brands = ['皇家', '冠能', '渴望', '爱肯拿', '麦富迪', '比瑞吉', '珍宝']

// 标签数据
const tags = ['新品', '热销', '折扣', '包邮', '进口', '国产']

// 筛选条件
const filters = reactive({
  category: '',
  priceRange: 'all',
  brands: [] as string[],
  tags: [] as string[]
})

// 排序
const sortBy = ref('default')
const priceOrder = ref<'asc' | 'desc'>('asc')

// 分页
const pagination = reactive({
  page: 1,
  pageSize: 12
})

// 加载商品数据
const loadProducts = async () => {
  loading.value = true
  try {
    const res = await productApi.getList({
      page: pagination.page,
      pageSize: pagination.pageSize,
    })

    const data = res.data

    // 转换后端数据为前端格式
    products.value = data.items.map((item: any) => ({
      id: String(item.id),
      image: item.image || item.images?.[0] || 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=400',
      name: item.name,
      price: item.price,
      originalPrice: item.originalPrice,
      sales: item.sales || 0,
      rating: 4.8,
      tags: []
    }))

    totalCount.value = data.pagination?.total || data.items.length
  } catch (error: any) {
    console.error('加载商品列表失败:', error)
    ElMessage.error('加载商品列表失败')
    products.value = []
    totalCount.value = 0
  } finally {
    loading.value = false
  }
}

// 分类选择
const handleCategoryClick = (data: Category) => {
  currentCategory.value = data
  filters.category = data.id
  loadProducts()
}

// 筛选变化
const handleFilterChange = () => {
  pagination.page = 1
  loadProducts()
}

// 标签切换
const handleTagToggle = (tag: string) => {
  const index = filters.tags.indexOf(tag)
  if (index > -1) {
    filters.tags.splice(index, 1)
  } else {
    filters.tags.push(tag)
  }
  handleFilterChange()
}

// 重置筛选
const resetFilters = () => {
  filters.category = ''
  filters.priceRange = 'all'
  filters.brands = []
  filters.tags = []
  currentCategory.value = null
  loadProducts()
}

// 排序切换
const changeSort = (sort: string) => {
  sortBy.value = sort
  loadProducts()
}

const changePriceSort = () => {
  if (sortBy.value === 'price') {
    priceOrder.value = priceOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortBy.value = 'price'
    priceOrder.value = 'asc'
  }
  loadProducts()
}

// 分页
const handlePageChange = (page: number) => {
  pagination.page = page
  loadProducts()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const handlePageSizeChange = (pageSize: number) => {
  pagination.pageSize = pageSize
  pagination.page = 1
  loadProducts()
}

// 监听路由变化
watch(
  () => route.query,
  () => {
    if (route.query.category) {
      filters.category = route.query.category as string
    }
    loadProducts()
  },
  { immediate: true }
)

onMounted(() => {
  loadProducts()
})
</script>

<style scoped lang="scss">
.shop-page {
  background: #f5f7fa;
  min-height: calc(100vh - 64px);
}

.shop-container {
  max-width: 1440px;
  margin: 0 auto;
  padding: 24px;
}

.breadcrumb {
  background: #fff;
  border-radius: 8px;
  padding: 16px 24px;
  margin-bottom: 16px;
}

.shop-content {
  display: grid;
  grid-template-columns: 240px 1fr;
  gap: 16px;
  align-items: start;
}

// 筛选侧边栏
.filter-sidebar {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  position: sticky;
  top: 80px;
}

.filter-section {
  margin-bottom: 24px;
  padding-bottom: 24px;
  border-bottom: 1px solid #e4e7ed;

  &:last-child {
    border-bottom: none;
    margin-bottom: 0;
    padding-bottom: 0;
  }

  h4 {
    font-size: 16px;
    font-weight: 600;
    color: #333;
    margin: 0 0 16px;
  }
}

.price-filter {
  :deep(.el-radio) {
    display: block;
    margin: 12px 0;
  }
}

.tag-filter {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.reset-btn {
  width: 100%;
  margin-top: 16px;
}

// 商品列表
.product-list {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
}

.sort-bar {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 16px 0;
  margin-bottom: 24px;
  border-bottom: 1px solid #e4e7ed;

  .sort-item {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 8px 16px;
    border-radius: 4px;
    font-size: 14px;
    color: #666;
    cursor: pointer;
    transition: all 0.3s;

    &:hover {
      color: #ff6b35;
      background: #fff5f2;
    }

    &.active {
      color: #ff6b35;
      background: #fff5f2;
      font-weight: 500;
    }
  }

  .result-count {
    margin-left: auto;
    font-size: 14px;
    color: #999;
  }
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px;
  min-height: 400px;
}

.el-pagination {
  margin-top: 32px;
  display: flex;
  justify-content: center;
}

// 响应式
@media (max-width: 1024px) {
  .shop-content {
    grid-template-columns: 1fr;
  }

  .filter-sidebar {
    position: static;
  }
}

@media (max-width: 768px) {
  .shop-container {
    padding: 12px;
  }

  .breadcrumb {
    padding: 12px 16px;
  }

  .filter-sidebar {
    display: none; // 移动端隐藏筛选
  }

  .products-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }

  .sort-bar {
    gap: 8px;
    flex-wrap: wrap;

    .sort-item {
      padding: 6px 12px;
      font-size: 13px;
    }

    .result-count {
      width: 100%;
      text-align: center;
      margin-left: 0;
    }
  }
}
</style>
