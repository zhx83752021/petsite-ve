<template>
    <LayoutMain>
        <div v-loading="loading" class="wiki-detail-page">
            <div class="container">
                <!-- 面包屑 -->
                <el-breadcrumb separator=">" class="breadcrumb">
                    <el-breadcrumb-item :to="{ path: '/' }">
                        首页
                    </el-breadcrumb-item>
                    <el-breadcrumb-item :to="{ path: '/wiki' }">
                        宠物百科
                    </el-breadcrumb-item>
                    <el-breadcrumb-item>{{ article?.title }}</el-breadcrumb-item>
                </el-breadcrumb>

                <!-- 文章内容 -->
                <article v-if="article" class="article-content">
                    <!-- 文章头部 -->
                    <header class="article-header">
                        <el-tag type="primary" size="large">
                            {{ article.categoryName }}
                        </el-tag>
                        <h1 class="article-title">
                            {{ article.title }}
                        </h1>
                        <div class="article-meta">
                            <span><el-icon>
                                    <User />
                                </el-icon> {{ article.author }}</span>
                            <span><el-icon>
                                    <Clock />
                                </el-icon> {{ article.date }}</span>
                            <span><el-icon>
                                    <View />
                                </el-icon> {{ article.views }} 次阅读</span>
                        </div>
                    </header>

                    <!-- 文章主图 -->
                    <div v-if="article.image" class="article-image">
                        <img :src="article.image" :alt="article.title">
                    </div>

                    <!-- 文章正文 -->
                    <div class="article-body" v-html="article.content" />

                    <!-- 文章标签 -->
                    <div class="article-tags">
                        <el-tag v-for="tag in article.tags" :key="tag" type="info" effect="plain"
                            style="margin-right: 8px">
                            # {{ tag }}
                        </el-tag>
                    </div>

                    <!-- 文章操作 -->
                    <div class="article-actions">
                        <el-button :icon="Star" @click="handleCollect">
                            {{ isCollected ? '已收藏' : '收藏' }}
                        </el-button>
                        <el-button :icon="Share" @click="handleShare">
                            分享
                        </el-button>
                        <el-button :icon="Printer" @click="handlePrint">
                            打印
                        </el-button>
                    </div>
                </article>

                <!-- 相关推荐 -->
                <section class="related-articles">
                    <h2 class="section-title">
                        相关推荐
                    </h2>
                    <div class="related-grid">
                        <div v-for="item in relatedArticles" :key="item.id" class="related-card"
                            @click="goToArticle(item.id)">
                            <img :src="item.image" :alt="item.title">
                            <div class="related-info">
                                <h4>{{ item.title }}</h4>
                                <p>{{ item.summary }}</p>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- 评论区 -->
                <section class="comments-section">
                    <h2 class="section-title">
                        评论 ({{ comments.length }})
                    </h2>

                    <!-- 发表评论 -->
                    <div class="comment-input">
                        <el-input v-model="newComment" type="textarea" :rows="4" placeholder="发表你的看法..." />
                        <el-button type="primary" @click="handleComment">
                            发表评论
                        </el-button>
                    </div>

                    <!-- 评论列表 -->
                    <div class="comment-list">
                        <div v-for="comment in comments" :key="comment.id" class="comment-item">
                            <el-avatar :src="comment.avatar" :size="40">
                                {{ comment.username.charAt(0) }}
                            </el-avatar>
                            <div class="comment-content">
                                <div class="comment-header">
                                    <span class="username">{{ comment.username }}</span>
                                    <span class="time">{{ comment.time }}</span>
                                </div>
                                <p class="comment-text">
                                    {{ comment.content }}
                                </p>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    </LayoutMain>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import LayoutMain from '@/components/LayoutMain.vue'
import { User, Clock, View, Star, Share, Printer } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()
const loading = ref(false)
const isCollected = ref(false)
const newComment = ref('')

const article = ref({
    id: 1,
    title: '狗狗日常养护指南',
    categoryName: '养护知识',
    author: '宠物专家',
    date: '2024-12-01',
    views: 1254,
    image: 'https://picsum.photos/seed/wiki-detail/1200/400',
    content: `
    <h2>引言</h2>
    <p>养狗是一件需要耐心和责任心的事情。作为宠物主人，我们需要了解狗狗的基本需求，包括饮食、运动、清洁和健康护理等方面。</p>

    <h2>一、日常饮食</h2>
    <p>狗狗的饮食应该营养均衡，包含适量的蛋白质、脂肪、碳水化合物、维生素和矿物质。建议选择高质量的狗粮，并根据狗狗的年龄、体重和活动量调整喂食量。</p>
    <ul>
      <li>幼犬：每天3-4次，营养丰富的幼犬粮</li>
      <li>成犬：每天1-2次，均衡的成犬粮</li>
      <li>老年犬：易消化的老年犬粮，适量减少喂食量</li>
    </ul>

    <h2>二、运动需求</h2>
    <p>适量的运动对狗狗的身心健康至关重要。不同品种的狗狗运动需求不同，一般建议每天至少散步30分钟到2小时。</p>

    <h2>三、清洁护理</h2>
    <p>定期给狗狗洗澡、梳毛、剪指甲和清洁耳朵，可以保持狗狗的健康和舒适。洗澡频率建议为每1-2周一次，过于频繁会破坏皮肤的天然油脂。</p>

    <h2>四、健康检查</h2>
    <p>定期带狗狗去宠物医院进行健康检查，接种疫苗，预防寄生虫感染。及时发现和治疗疾病，可以延长狗狗的寿命。</p>

    <h2>总结</h2>
    <p>养狗需要投入时间、精力和爱心。只有给予狗狗足够的关注和照顾，才能让它们健康快乐地成长。</p>
  `,
    tags: ['养护', '健康', '饮食', '运动'],
})

const relatedArticles = ref([
    {
        id: 2,
        title: '猫咪常见疾病预防',
        summary: '了解猫咪常见疾病的症状、预防措施和治疗方法...',
        image: 'https://picsum.photos/seed/related1/300/200',
    },
    {
        id: 3,
        title: '宠物营养均衡搭配',
        summary: '科学搭配宠物饮食，保证营养均衡，让宠物健康成长...',
        image: 'https://picsum.photos/seed/related2/300/200',
    },
    {
        id: 4,
        title: '狗狗基础训练教程',
        summary: '从基础开始，教你如何训练狗狗的日常行为习惯...',
        image: 'https://picsum.photos/seed/related3/300/200',
    },
])

const comments = ref([
    {
        id: 1,
        username: '爱狗人士',
        avatar: 'https://picsum.photos/seed/user1/100',
        content: '写得很详细，对新手很有帮助！',
        time: '2小时前',
    },
    {
        id: 2,
        username: '宠物达人',
        avatar: 'https://picsum.photos/seed/user2/100',
        content: '收藏了，准备按照这个方法养狗。',
        time: '5小时前',
    },
])

onMounted(() => {
    // TODO: 根据路由参数加载文章详情
    const id = route.params.id
    console.log('文章ID:', id)
})

const handleCollect = () => {
    isCollected.value = !isCollected.value
    ElMessage.success(isCollected.value ? '收藏成功' : '取消收藏')
}

const handleShare = () => {
    ElMessage.success('分享链接已复制')
}

const handlePrint = () => {
    window.print()
}

const handleComment = () => {
    if (!newComment.value.trim()) {
        ElMessage.warning('请输入评论内容')
        return
    }

    comments.value.unshift({
        id: Date.now(),
        username: '当前用户',
        avatar: 'https://picsum.photos/seed/current/100',
        content: newComment.value,
        time: '刚刚',
    })

    newComment.value = ''
    ElMessage.success('评论成功')
}

const goToArticle = (id: number) => {
    router.push(`/wiki/${id}`)
    window.scrollTo(0, 0)
}
</script>

<style scoped>
.wiki-detail-page {
    min-height: 100vh;
    background: #f5f7fa;
    padding: 24px 0;
}

.container {
    max-width: 1000px;
    margin: 0 auto;
    padding: 0 20px;
}

.breadcrumb {
    margin-bottom: 24px;
}

.article-content {
    background: white;
    border-radius: 12px;
    padding: 40px;
    margin-bottom: 24px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.article-header {
    margin-bottom: 32px;
    text-align: center;
}

.article-title {
    font-size: 32px;
    font-weight: bold;
    margin: 16px 0;
    color: #333;
}

.article-meta {
    display: flex;
    justify-content: center;
    gap: 24px;
    color: #999;
    font-size: 14px;
}

.article-meta span {
    display: flex;
    align-items: center;
    gap: 4px;
}

.article-image {
    margin-bottom: 32px;
    border-radius: 8px;
    overflow: hidden;
}

.article-image img {
    width: 100%;
    height: auto;
    display: block;
}

.article-body {
    line-height: 1.8;
    color: #333;
    font-size: 16px;
}

.article-body :deep(h2) {
    font-size: 24px;
    font-weight: bold;
    margin: 32px 0 16px;
    color: #333;
}

.article-body :deep(p) {
    margin-bottom: 16px;
}

.article-body :deep(ul) {
    margin: 16px 0;
    padding-left: 24px;
}

.article-body :deep(li) {
    margin-bottom: 8px;
}

.article-tags {
    margin: 32px 0;
    padding: 24px 0;
    border-top: 1px solid #eee;
    border-bottom: 1px solid #eee;
}

.article-actions {
    display: flex;
    gap: 12px;
    justify-content: center;
}

.related-articles {
    background: white;
    border-radius: 12px;
    padding: 32px;
    margin-bottom: 24px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.section-title {
    font-size: 24px;
    font-weight: bold;
    margin-bottom: 24px;
    color: #333;
}

.related-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 16px;
}

.related-card {
    display: flex;
    gap: 12px;
    cursor: pointer;
    padding: 12px;
    border-radius: 8px;
    transition: all 0.3s ease;
}

.related-card:hover {
    background: #f5f7fa;
    transform: translateX(4px);
}

.related-card img {
    width: 120px;
    height: 80px;
    object-fit: cover;
    border-radius: 4px;
    flex-shrink: 0;
}

.related-info h4 {
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 8px;
    color: #333;
}

.related-info p {
    font-size: 14px;
    color: #666;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
}

.comments-section {
    background: white;
    border-radius: 12px;
    padding: 32px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.comment-input {
    margin-bottom: 32px;
}

.comment-input .el-textarea {
    margin-bottom: 12px;
}

.comment-list {
    display: flex;
    flex-direction: column;
    gap: 24px;
}

.comment-item {
    display: flex;
    gap: 12px;
}

.comment-content {
    flex: 1;
}

.comment-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
}

.username {
    font-weight: bold;
    color: #333;
}

.time {
    color: #999;
    font-size: 14px;
}

.comment-text {
    color: #666;
    line-height: 1.6;
}

@media print {

    .article-actions,
    .related-articles,
    .comments-section,
    .breadcrumb {
        display: none;
    }
}
</style>
