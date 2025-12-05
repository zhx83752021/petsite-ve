<template>
    <LayoutMain>
        <div class="services-page">
            <!-- 顶部banner -->
            <section class="services-banner">
                <img src="https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=1920&h=400&fit=crop" alt="宠物服务"
                    class="banner-bg">
                <div class="banner-content">
                    <h1>宠物服务</h1>
                    <p>为您的爱宠提供全方位的专业服务</p>
                </div>
            </section>

            <!-- 服务列表 -->
            <div class="container">
                <div class="services-grid">
                    <div v-for="service in services" :key="service.id" class="service-card"
                        @click="goToService(service.path)">
                        <div class="service-icon">
                            <el-icon :size="48">
                                <component :is="service.icon" />
                            </el-icon>
                        </div>
                        <h3 class="service-title">
                            {{ service.title }}
                        </h3>
                        <p class="service-desc">
                            {{ service.desc }}
                        </p>
                        <div class="service-features">
                            <el-tag v-for="(feature, index) in service.features" :key="index" size="small" type="info">
                                {{ feature }}
                            </el-tag>
                        </div>
                        <el-button type="primary" link class="service-btn">
                            了解详情
                            <el-icon>
                                <ArrowRight />
                            </el-icon>
                        </el-button>
                    </div>
                </div>

                <!-- 服务特色 -->
                <section class="service-advantages">
                    <h2 class="section-title">
                        我们的优势
                    </h2>
                    <div class="advantages-grid">
                        <div v-for="advantage in advantages" :key="advantage.id" class="advantage-item">
                            <div class="advantage-icon">
                                {{ advantage.icon }}
                            </div>
                            <h4>{{ advantage.title }}</h4>
                            <p>{{ advantage.desc }}</p>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    </LayoutMain>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import LayoutMain from '@/components/LayoutMain.vue'
import { ChatLineRound, ScaleToOriginal, House, StarFilled, ArrowRight } from '@element-plus/icons-vue'

const router = useRouter()

const services = [
    {
        id: 1,
        title: '在线问诊',
        desc: '专业宠物医生在线咨询，随时随地解答您的疑问',
        icon: ChatLineRound,
        features: ['24小时在线', '专业医生', '快速响应'],
        path: '/services/consultation',
    },
    {
        id: 2,
        title: '宠物美容',
        desc: '专业美容师为您的爱宠打造完美造型',
        icon: ScaleToOriginal,
        features: ['专业设备', '经验丰富', '环境舒适'],
        path: '/services/grooming',
    },
    {
        id: 3,
        title: '宠物寄养',
        desc: '出差旅游不用愁，专业寄养让您放心',
        icon: House,
        features: ['24小时监控', '独立空间', '定时喂养'],
        path: '/services/boarding',
    },
    {
        id: 4,
        title: '领养中心',
        desc: '给流浪动物一个温暖的家，开启爱的旅程',
        icon: StarFilled,
        features: ['免费领养', '健康保障', '爱心传递'],
        path: '/services/adoption',
    },
]

const advantages = [
    {
        id: 1,
        icon: '🏆',
        title: '专业团队',
        desc: '拥有10年以上经验的专业团队',
    },
    {
        id: 2,
        icon: '💝',
        title: '贴心服务',
        desc: '以爱心和耐心对待每一只宠物',
    },
    {
        id: 3,
        icon: '🔒',
        title: '安全保障',
        desc: '完善的安全措施和保险保障',
    },
    {
        id: 4,
        icon: '⭐',
        title: '用户好评',
        desc: '98%的客户满意度和好评率',
    },
]

const goToService = (path: string) => {
    router.push(path)
}
</script>

<style scoped>
.services-page {
    min-height: 100vh;
    background: #f5f7fa;
}

.services-banner {
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
    filter: brightness(0.7);
}

.banner-content {
    position: relative;
    z-index: 1;
}

.banner-content h1 {
    font-size: 48px;
    font-weight: bold;
    margin-bottom: 16px;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
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

.services-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 24px;
    margin-bottom: 60px;
}

.service-card {
    background: white;
    border-radius: 12px;
    padding: 32px;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.service-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.service-icon {
    width: 80px;
    height: 80px;
    margin: 0 auto 20px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
}

.service-title {
    font-size: 22px;
    font-weight: bold;
    margin-bottom: 12px;
    color: #333;
}

.service-desc {
    color: #666;
    line-height: 1.6;
    margin-bottom: 16px;
    min-height: 48px;
}

.service-features {
    display: flex;
    gap: 8px;
    justify-content: center;
    margin-bottom: 20px;
    flex-wrap: wrap;
}

.service-btn {
    font-size: 16px;
}

.service-advantages {
    margin-top: 60px;
}

.section-title {
    font-size: 32px;
    font-weight: bold;
    text-align: center;
    margin-bottom: 40px;
    color: #333;
}

.advantages-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 24px;
}

.advantage-item {
    background: white;
    border-radius: 12px;
    padding: 32px;
    text-align: center;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.advantage-icon {
    font-size: 48px;
    margin-bottom: 16px;
}

.advantage-item h4 {
    font-size: 20px;
    font-weight: bold;
    margin-bottom: 12px;
    color: #333;
}

.advantage-item p {
    color: #666;
    line-height: 1.6;
}
</style>
