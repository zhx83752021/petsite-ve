# 宠物网前端项目

基于 Vue 3 + TypeScript + Element Plus 的宠物电商平台前端项目。

## 技术栈

- **框架**: Vue 3.4 (Composition API)
- **语言**: TypeScript 5.3
- **UI库**: Element Plus 2.5
- **路由**: Vue Router 4.2
- **状态管理**: Pinia 2.1
- **构建工具**: Vite 5.0
- **样式**: SCSS + Tailwind CSS
- **HTTP**: Axios 1.6
- **工具**: VueUse 10.7, Day.js 1.11

## 项目结构

```
frontend/
├── src/
│   ├── components/       # 公共组件
│   │   ├── AppHeader.vue
│   │   ├── AppFooter.vue
│   │   ├── BottomNav.vue
│   │   ├── LayoutMain.vue
│   │   ├── ProductCard.vue
│   │   └── PostCard.vue
│   ├── views/           # 页面组件
│   │   ├── Home.vue
│   │   ├── shop/
│   │   ├── community/
│   │   ├── user/
│   │   └── auth/
│   ├── types/           # TypeScript类型定义
│   ├── api/             # API接口
│   ├── stores/          # Pinia状态管理
│   ├── router/          # 路由配置
│   └── assets/          # 静态资源
├── public/              # 公共静态文件
└── docs/                # 文档
```

## 快速开始

### 安装依赖

```bash
npm install
```

### 开发环境

```bash
npm run dev
```

访问 http://localhost:5173

### 生产构建

```bash
npm run build
```

构建产物在 `dist/` 目录

### 代码检查

```bash
npm run lint
```

### 代码格式化

```bash
npm run format
```

## 已完成功能

### ✅ 基础架构

- 完整的TypeScript类型系统
- 公共组件库(导航栏、页脚、底部导航等)
- 响应式布局框架
- 路由配置

### ✅ 首页

- 轮播Banner(自动播放、手动切换)
- 分类导航(横向滚动)
- 热门商品推荐
- 社区精选动态
- 宠物服务入口

### ✅ 商城模块

- **商品列表页**
  - 左侧筛选栏(分类/价格/品牌/标签)
  - 排序功能(综合/销量/价格/评价)
  - 商品网格展示
  - 分页导航

- **商品详情页**
  - 图片展示(主图+缩略图切换)
  - 规格选择(SKU联动)
  - 数量选择(库存限制)
  - 商品详情(富文本)
  - 用户评价(筛选、排序)

## 响应式设计

项目采用移动优先设计,支持以下断点:

- **移动端** (<768px): 2列商品,隐藏侧边栏,底部导航
- **平板** (768px-1023px): 3列商品,显示侧边栏
- **桌面端** (≥1024px): 4列商品,完整布局
- **大屏** (≥1440px): 5列商品,最大宽度1440px

## 设计规范

### 色彩

- 主色: `#ff6b35` (橙色)
- 辅色: `#ff8c5a`
- 背景: `#f5f7fa`
- 文字: `#333` / `#666` / `#999`

### 间距

- 容器: 24px (PC) / 12px (移动)
- 卡片: 32px (PC) / 16px (移动)
- 元素: 16px/24px/32px/48px

### 圆角

- 卡片: 8px/12px
- 按钮/输入: 4px

## 数据说明

当前所有数据为模拟数据,位于各组件的 `loadData()` 等方法中。

对接后端API时,需要:

1. 创建API服务层 (`src/api/`)
2. 替换组件中的Mock数据
3. 处理加载状态和错误

示例:

```typescript
// src/api/product.ts
import request from './request'

export const getProductList = params => {
  return request.get('/api/products', { params })
}

// 在组件中使用
import { getProductList } from '@/api/product'

const loadProducts = async () => {
  loading.value = true
  try {
    const { data } = await getProductList(filters)
    products.value = data.list
    totalCount.value = data.total
  } catch (error) {
    ElMessage.error('加载失败')
  } finally {
    loading.value = false
  }
}
```

## 浏览器支持

- Chrome >= 90
- Firefox >= 88
- Safari >= 14
- Edge >= 90

## 待开发功能

- [ ] 购物车页面
- [ ] 订单确认和支付
- [ ] 社区模块(动态发布、详情)
- [ ] 服务模块(问诊、预约)
- [ ] 个人中心(宠物档案、订单管理)
- [ ] 搜索功能
- [ ] 登录注册完善

## 文档

- [前端开发进度.md](./前端开发进度.md) - 开发进度追踪
- [项目完成总结.md](./项目完成总结.md) - 详细功能说明
- [快速开始指南.md](../快速开始指南.md) - 项目整体说明

## 常见问题

### Q: 如何修改主题色?

A: 修改 `src/assets/styles/index.css` 中的 CSS变量:

```css
:root {
  --primary-color: #ff6b35;
  --primary-light: #ff8c5a;
}
```

### Q: 如何添加新页面?

A:

1. 在 `src/views/` 创建页面组件
2. 在 `src/router/index.ts` 添加路由配置
3. 使用 `LayoutMain` 组件包裹保持布局一致

### Q: 图片如何优化?

A:

1. 使用CDN加速
2. 实现懒加载(`@vueuse/core` 的 `useIntersectionObserver`)
3. 使用WebP格式
4. 添加占位符/骨架屏

## License

MIT

## 联系方式

如有问题请提Issue或联系开发团队。
