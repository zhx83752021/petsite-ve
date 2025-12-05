<template>
  <LayoutMain>
    <div class="home-page">
      <!-- 轮播Banner -->
      <section class="banner-section">
        <el-carousel height="500px" :interval="5000" arrow="always">
          <el-carousel-item v-for="banner in banners" :key="banner.id">
            <div class="banner-item" @click="handleBannerClick(banner)">
              <img :src="banner.image" :alt="banner.title">
              <div class="banner-content">
                <h2>{{ banner.title }}</h2>
                <p>{{ banner.subtitle }}</p>
              </div>
            </div>
          </el-carousel-item>
        </el-carousel>
      </section>
      <div class="container">
        <!-- 分类导航 -->
        <section class="category-section">
          <div class="category-grid">
            <div v-for="category in categories" :key="category.id" class="category-item"
              @click="goToCategory(category.id)">
              <div class="category-icon">
                {{ category.icon }}
              </div>
              <div class="category-name">
                {{ category.name }}
              </div>
            </div>
          </div>
        </section>
        <!-- 热门推荐 -->
        <section class="products-section">
          <div class="section-header">
            <h3>热门推荐</h3>
            <router-link to="/shop" class="more-link">
              更多
              <el-icon>
                <ArrowRight />
              </el-icon>
            </router-link>
          </div>
          <div class="product-grid">
            <ProductCard v-for="product in hotProducts" :key="product.id" :product="product"
              @click="goToProduct(product.id)" />
          </div>
        </section>
        <!-- 社区精选 -->
        <section class="community-section">
          <div class="section-header">
            <h3>社区精选</h3>
            <router-link to="/community" class="more-link">
              更多
              <el-icon>
                <ArrowRight />
              </el-icon>
            </router-link>
          </div>
          <div class="post-grid">
            <PostCard v-for="post in featuredPosts" :key="post.id" :post="post" />
          </div>
        </section>
        <!-- 宠物服务 -->
        <section class="services-section">
          <div class="section-header">
            <h3>宠物服务</h3>
            <router-link to="/services" class="more-link">
              更多
              <el-icon>
                <ArrowRight />
              </el-icon>
            </router-link>
          </div>
          <div class="service-grid">
            <div v-for="service in services" :key="service.id" class="service-card" @click="goToService(service.path)">
              <div class="service-icon">
                {{ service.icon }}
              </div>
              <h4>{{ service.title }}</h4>
              <p>{{ service.description }}</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  </LayoutMain>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowRight } from '@element-plus/icons-vue'
import LayoutMain from '@/components/LayoutMain.vue'
import ProductCard from '@/components/ProductCard.vue'
import PostCard from '@/components/PostCard.vue'
import type { Banner, Category, ProductCard as ProductType, Post } from '@/types'
const router = useRouter()
// 轮播数据
const banners = ref<Banner[]>([
  {
    id: '1',
    image: 'https://picsum.photos/seed/banner1/1200/500',
    title: '新年钜惠',
    subtitle: '全场宠物用品限时优惠',
    link: '/shop'
  },
  {
    id: '2',
    image: 'https://picsum.photos/seed/banner2/1200/500',
    title: '宠物美容',
    subtitle: '专业团队为您的爱宠服务',
    link: '/services/grooming'
  },
  {
    id: '3',
    image: 'https://picsum.photos/seed/banner3/1200/500',
    title: '健康咨询',
    subtitle: '24小时在线问诊服务',
    link: '/services/consultation'
  }
])
// 分类数据
const categories = ref<Category[]>([
  { id: '1', name: '宠物食品', icon: '🍖' },
  { id: '2', name: '宠物用品', icon: '🎾' },
  { id: '3', name: '宠物玩具', icon: '🧸' },
  { id: '4', name: '医疗保健', icon: '💊' },
  { id: '5', name: '美容护理', icon: '✂️' },
  { id: '6', name: '服装配饰', icon: '👔' },
  { id: '7', name: '出行用品', icon: '🎒' },
  { id: '8', name: '智能设备', icon: '📱' }
])
// 热门商品
const hotProducts = ref<ProductType[]>([
  {
    id: '1',
    image: 'https://picsum.photos/seed/dog-food-1/400',
    name: '皇家小型成犬粮 8kg',
    price: 299,
    originalPrice: 399,
    sales: 1280,
    rating: 4.9,
    tags: ['热销', '包邮']
  },
  {
    id: '2',
    image: 'https://picsum.photos/seed/cat-feeder-2/400',
    name: '猫咪自动喂食器',
    price: 199,
    sales: 856,
    rating: 4.8,
    tags: ['智能']
  },
  {
    id: '3',
    image: 'https://picsum.photos/seed/pet-toy-3/400',
    name: '宠物互动玩具球',
    price: 89,
    originalPrice: 129,
    sales: 2341,
    rating: 4.7,
    tags: ['新品', '折扣']
  },
  {
    id: '4',
    image: 'https://picsum.photos/seed/dog-chew-4/400',
    name: '狗狗磨牙棒套装',
    price: 49,
    sales: 3120,
    rating: 4.9,
    tags: ['热销']
  }
])
// 社区精选
const featuredPosts = ref<Post[]>([
  {
    id: '1',
    user: {
      id: '1',
      avatar: 'https://i.pravatar.cc/150?img=1',
      nickname: '爱宠之家'
    },
    content: '今天带狗狗去公园玩啦,开心极了!分享一些可爱的照片给大家~',
    images: [
      'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600',
      'https://images.unsplash.com/photo-1477884213360-7e9d7dcc1e48?w=600'
    ],
    topics: ['萌宠日常', '金毛'],
    createdAt: '2024-01-15 10:30',
    stats: {
      likes: 128,
      comments: 32,
      shares: 12,
      views: 856
    },
    isLiked: false
  },
  {
    id: '2',
    user: {
      id: '2',
      avatar: 'https://i.pravatar.cc/150?img=2',
      nickname: '猫咪小管家'
    },
    content: '分享一下我家猫咪的日常,每天都这么可爱!',
    images: ['https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600'],
    topics: ['猫咪', '日常'],
    createdAt: '2024-01-15 09:15',
    stats: {
      likes: 256,
      comments: 48,
      shares: 20,
      views: 1234
    },
    isLiked: false
  }
])
// 服务列表
const services = ref([
  {
    id: '1',
    icon: '🏥',
    title: '在线问诊',
    description: '专业兽医在线咨询',
    path: '/services/consultation'
  },
  {
    id: '2',
    icon: '✂️',
    title: '美容预约',
    description: '专业宠物美容服务',
    path: '/services/grooming'
  },
  {
    id: '3',
    icon: '🏠',
    title: '宠物寄养',
    description: '安心寄养,专业照顾',
    path: '/services/boarding'
  },
  {
    id: '4',
    icon: '❤️',
    title: '领养中心',
    description: '给流浪宠物一个家',
    path: '/services/adoption'
  }
])
// 跳转方法
const handleBannerClick = (banner: Banner) => {
  router.push(banner.link)
}
const goToCategory = (categoryId: string) => {
  router.push(`/shop?category=${categoryId}`)
}
const goToProduct = (productId: string) => {
  router.push(`/product/${productId}`)
}
const goToService = (path: string) => {
  router.push(path)
}
onMounted(() => {
  // 可以在这里加载数据
})
</script>
<style scoped lang="scss">
.home-page {
  width: 100%;
}
.container {
  max-width: 1440px;
  margin: 0 auto;
  padding: 0 24px;
}
// Banner
.banner-section {
  width: 100%;
  background: #f5f5f5;
  .banner-item {
    position: relative;
    width: 100%;
    height: 500px;
    cursor: pointer;
    overflow: hidden;
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .banner-content {
      position: absolute;
      bottom: 80px;
      left: 50%;
      transform: translateX(-50%);
      text-align: center;
      color: #fff;
      text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
      h2 {
        font-size: 48px;
        font-weight: bold;
        margin: 0 0 16px;
      }
      p {
        font-size: 20px;
        margin: 0;
        opacity: 0.9;
      }
    }
  }
}
// 分类导航
.category-section {
  padding: 40px 0 32px;
  background: linear-gradient(to bottom, #fff 0%, #f8f9fa 100%);
}
.category-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 16px;
}
.category-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 20px 12px;
  border-radius: 16px;
  background: #fff;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, #ff6b35 0%, #ff8c61 100%);
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  &:hover {
    transform: translateY(-6px);
    box-shadow: 0 8px 24px rgba(255, 107, 53, 0.25);
    &::before {
      opacity: 1;
    }
    .category-icon {
      transform: scale(1.15);
      filter: brightness(0) invert(1);
    }
    .category-name {
      color: #fff;
    }
  }
  .category-icon {
    font-size: 36px;
    transition: all 0.3s ease;
    position: relative;
    z-index: 1;
  }
  .category-name {
    font-size: 14px;
    font-weight: 600;
    color: #333;
    white-space: nowrap;
    transition: color 0.3s ease;
    position: relative;
    z-index: 1;
  }
}
// 公共section样式
.products-section,
.community-section,
.services-section {
  padding: 48px 0;
}
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  h3 {
    font-size: 28px;
    font-weight: bold;
    color: #333;
    margin: 0;
  }
  .more-link {
    display: flex;
    align-items: center;
    gap: 4px;
    color: #666;
    text-decoration: none;
    font-size: 14px;
    transition: color 0.3s;
    &:hover {
      color: #ff6b35;
    }
  }
}
// 商品网格
.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
}
// 社区网格
.post-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: 24px;
}
// 服务网格
.service-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 24px;
}
.service-card {
  background: #fff;
  padding: 32px;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: all 0.3s;
  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 8px 24px rgba(255, 107, 53, 0.2);
  }
  .service-icon {
    font-size: 56px;
    margin-bottom: 16px;
  }
  h4 {
    font-size: 18px;
    font-weight: 600;
    color: #333;
    margin: 0 0 8px;
  }
  p {
    font-size: 14px;
    color: #666;
    margin: 0;
  }
}
// 响应式
@media (max-width: 768px) {
  .banner-section {
    .banner-item {
      height: 300px;
      .banner-content {
        bottom: 40px;
        h2 {
          font-size: 28px;
        }
        p {
          font-size: 14px;
        }
      }
    }
  }
  .category-section {
    padding: 24px 0;
  }
  .category-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
  }
  .category-item {
    padding: 16px 8px;
    .category-icon {
      font-size: 30px;
    }
    .category-name {
      font-size: 12px;
    }
  }
  .products-section,
  .community-section,
  .services-section {
    padding: 32px 0;
  }
  .section-header h3 {
    font-size: 22px;
  }
  .product-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
  .post-grid {
    grid-template-columns: 1fr;
  }
  .service-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
}
</style>
