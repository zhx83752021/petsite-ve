<template>
    <LayoutMain>
        <div class="wiki-page">
            <!-- 顶部banner -->
            <section class="wiki-banner">
                <img src="https://images.unsplash.com/photo-1415369629372-26f2fe60c467?w=1920&h=400&fit=crop" alt="宠物百科"
                    class="banner-bg">
                <div class="banner-content">
                    <h1>宠物百科</h1>
                    <p>科学养宠，从了解开始</p>
                </div>
            </section>

            <div class="container">
                <!-- 搜索栏 -->
                <div class="search-bar">
                    <el-input v-model="searchKeyword" placeholder="搜索宠物百科..." size="large" clearable>
                        <template #prefix>
                            <el-icon>
                                <Search />
                            </el-icon>
                        </template>
                        <template #append>
                            <el-button :icon="Search" @click="handleSearch">
                                搜索
                            </el-button>
                        </template>
                    </el-input>
                </div>

                <!-- 分类标签 -->
                <div class="category-tags">
                    <el-tag v-for="category in categories" :key="category.id"
                        :type="selectedCategory === category.id ? 'primary' : 'info'" size="large"
                        :effect="selectedCategory === category.id ? 'dark' : 'plain'"
                        style="cursor: pointer; margin-right: 12px; margin-bottom: 12px"
                        @click="selectedCategory = category.id">
                        {{ category.name }}
                    </el-tag>
                </div>

                <!-- 百科文章列表 -->
                <div class="wiki-grid">
                    <div v-for="article in filteredArticles" :key="article.id" class="wiki-card"
                        @click="goToArticle(article.id)">
                        <div class="wiki-image">
                            <img :src="article.image" :alt="article.title">
                            <div class="wiki-category">
                                {{ article.categoryName }}
                            </div>
                        </div>
                        <div class="wiki-content">
                            <h3 class="wiki-title">
                                {{ article.title }}
                            </h3>
                            <p class="wiki-summary">
                                {{ article.summary }}
                            </p>
                            <div class="wiki-meta">
                                <span><el-icon>
                                        <View />
                                    </el-icon> {{ article.views }}</span>
                                <span><el-icon>
                                        <Clock />
                                    </el-icon> {{ article.date }}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 热门标签 -->
                <section class="hot-tags-section">
                    <h2 class="section-title">
                        热门标签
                    </h2>
                    <div class="hot-tags">
                        <el-tag v-for="tag in hotTags" :key="tag" type="info" effect="plain" size="large"
                            style="cursor: pointer; margin: 0 8px 8px 0">
                            # {{ tag }}
                        </el-tag>
                    </div>
                </section>
            </div>
        </div>
    </LayoutMain>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import LayoutMain from '@/components/LayoutMain.vue'
import { Search, View, Clock } from '@element-plus/icons-vue'

const router = useRouter()
const searchKeyword = ref('')
const selectedCategory = ref(0)

const categories = [
    { id: 0, name: '全部' },
    { id: 1, name: '养护知识' },
    { id: 2, name: '疾病防治' },
    { id: 3, name: '营养饮食' },
    { id: 4, name: '训练技巧' },
    { id: 5, name: '品种介绍' },
]

const articles = [
    {
        id: 1,
        title: '狗狗日常养护指南',
        summary: '全面了解狗狗的日常养护要点，包括饮食、运动、清洁等方面的知识...',
        image: 'https://picsum.photos/seed/wiki1/400/300',
        categoryId: 1,
        categoryName: '养护知识',
        views: 1254,
        date: '2024-12-01',
    },
    {
        id: 2,
        title: '猫咪常见疾病预防',
        summary: '了解猫咪常见疾病的症状、预防措施和治疗方法...',
        image: 'https://picsum.photos/seed/wiki2/400/300',
        categoryId: 2,
        categoryName: '疾病防治',
        views: 986,
        date: '2024-11-28',
    },
    {
        id: 3,
        title: '宠物营养均衡搭配',
        summary: '科学搭配宠物饮食，保证营养均衡，让宠物健康成长...',
        image: 'https://picsum.photos/seed/wiki3/400/300',
        categoryId: 3,
        categoryName: '营养饮食',
        views: 1567,
        date: '2024-11-25',
    },
    {
        id: 4,
        title: '狗狗基础训练教程',
        summary: '从基础开始，教你如何训练狗狗的日常行为习惯...',
        image: 'https://picsum.photos/seed/wiki4/400/300',
        categoryId: 4,
        categoryName: '训练技巧',
        views: 2341,
        date: '2024-11-20',
    },
    {
        id: 5,
        title: '热门猫咪品种介绍',
        summary: '详细介绍各种热门猫咪品种的特点、性格和养护要点...',
        image: 'https://picsum.photos/seed/wiki5/400/300',
        categoryId: 5,
        categoryName: '品种介绍',
        views: 1789,
        date: '2024-11-15',
    },
    {
        id: 6,
        title: '宠物换毛期护理',
        summary: '宠物换毛期的护理要点，减少掉毛困扰...',
        image: 'https://picsum.photos/seed/wiki6/400/300',
        categoryId: 1,
        categoryName: '养护知识',
        views: 891,
        date: '2024-11-10',
    },
]

const hotTags = [
    '疫苗接种',
    '营养补充',
    '行为训练',
    '健康检查',
    '美容护理',
    '牙齿护理',
    '驱虫防疫',
    '老年护理',
]

const filteredArticles = computed(() => {
    let result = articles
    if (selectedCategory.value > 0) {
        result = result.filter((item) => item.categoryId === selectedCategory.value)
    }
    if (searchKeyword.value) {
        result = result.filter(
            (item) =>
                item.title.includes(searchKeyword.value) ||
                item.summary.includes(searchKeyword.value)
        )
    }
    return result
})

const handleSearch = () => {
    // 搜索逻辑
    console.log('搜索:', searchKeyword.value)
}

const goToArticle = (id: number) => {
    router.push(`/wiki/${id}`)
}
</script>

<style scoped>
.wiki-page {
    min-height: 100vh;
    background: #f5f7fa;
}

.wiki-banner {
    height: 400px;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    text-align: center;
    overflow: hidden;
}

.banner-bg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    filter: brightness(0.6);
}

.banner-content {
    position: relative;
    z-index: 1;
}

.banner-content h1 {
    font-size: 48px;
    font-weight: bold;
    margin-bottom: 16px;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.6);
}

.banner-content p {
    font-size: 20px;
    opacity: 0.95;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 40px 20px;
}

.search-bar {
    margin-bottom: 32px;
}

.category-tags {
    margin-bottom: 32px;
}

.wiki-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 24px;
    margin-bottom: 60px;
}

.wiki-card {
    background: white;
    border-radius: 12px;
    overflow: hidden;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.wiki-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.wiki-image {
    position: relative;
    height: 200px;
    overflow: hidden;
}

.wiki-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
}

.wiki-card:hover .wiki-image img {
    transform: scale(1.05);
}

.wiki-category {
    position: absolute;
    top: 12px;
    right: 12px;
    background: rgba(0, 0, 0, 0.6);
    color: white;
    padding: 4px 12px;
    border-radius: 4px;
    font-size: 12px;
}

.wiki-content {
    padding: 20px;
}

.wiki-title {
    font-size: 18px;
    font-weight: bold;
    margin-bottom: 12px;
    color: #333;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.wiki-summary {
    color: #666;
    line-height: 1.6;
    margin-bottom: 16px;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
}

.wiki-meta {
    display: flex;
    gap: 16px;
    color: #999;
    font-size: 14px;
}

.wiki-meta span {
    display: flex;
    align-items: center;
    gap: 4px;
}

.hot-tags-section {
    background: white;
    border-radius: 12px;
    padding: 32px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.section-title {
    font-size: 24px;
    font-weight: bold;
    margin-bottom: 24px;
    color: #333;
}

.hot-tags {
    display: flex;
    flex-wrap: wrap;
}
</style>
