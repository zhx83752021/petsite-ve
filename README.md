# 🐾 宠物网 Pet Web

一个集"社区 + 电商 + 服务"三位一体的全方位宠物互联网平台

## 📋 项目简介

宠物网是一个现代化的宠物综合服务平台，为养宠家庭提供：

- 🛒 **宠物商城** - 食品、用品、玩具等一站式购物
- 💬 **宠物社区** - 养宠经验分享、萌宠交流互动
- 🏥 **宠物服务** - 在线问诊、预约美容、宠物寄养
- 📚 **知识百科** - 专业养宠知识库和视频教程

## 🚀 技术栈

### 前端

- **Vue 3** - 渐进式 JavaScript 框架
- **Vite** - 极速的构建工具
- **TypeScript** - 类型安全
- **Pinia** - 状态管理
- **Element Plus** - UI 组件库
- **Tailwind CSS** - 原子化 CSS 框架

### 后端

- **Node.js** - JavaScript 运行时
- **Express** - Web 应用框架
- **TypeScript** - 类型安全
- **Sequelize** - ORM 框架
- **PostgreSQL** - 关系型数据库
- **Redis** - 缓存数据库
- **JWT** - 身份认证

### 部署

- **Vercel** - 前后端部署平台
- **PlanetScale** - MySQL 数据库服务
- **Upstash** - Redis 服务
- **Cloudinary** - 图片/视频存储

## 📁 项目结构

```
pet-web/
├── docs/                      # 项目文档
│   ├── 01-项目概述与竞品分析.md
│   ├── 02-前台功能设计.md
│   ├── 03-后台管理系统.md
│   ├── 04-技术架构与数据库设计.md
│   ├── 05-API接口文档.md
│   └── 06-部署运维与项目排期.md
├── frontend/                  # 前端项目
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.ts
├── backend/                   # 后端项目
│   ├── src/
│   ├── package.json
│   └── tsconfig.json
└── README.md
```

## 🛠️ 快速开始

### 环境要求

- Node.js >= 20.0.0
- npm >= 10.0.0
- MySQL >= 8.0
- Redis >= 7.0

### 前端开发

```bash
# 进入前端目录
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

### 后端开发

```bash
# 进入后端目录
cd backend

# 安装依赖
npm install

# 初始化数据库
npm run db:migrate

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

## 📦 功能模块

### 前台用户端

- ✅ 用户注册登录
- ✅ 商品浏览购买
- ✅ 购物车管理
- ✅ 订单流程
- ✅ 社区动态发布
- ✅ 评论互动
- ✅ 个人中心
- ✅ 宠物档案管理

### 后台管理端

- ✅ 系统管理
- ✅ 用户管理
- ✅ 商品管理
- ✅ 订单管理
- ✅ 社区管理
- ✅ 内容管理
- ✅ 营销管理
- ✅ 数据统计

## 🎨 核心特性

- 📱 **响应式设计** - 完美适配 PC、平板、手机
- ⚡ **极速加载** - Vite 构建，代码分割，懒加载
- 🔐 **安全可靠** - JWT 认证，数据加密，SQL 注入防护
- 🎯 **用户体验** - 流畅的交互，优雅的动画
- 📊 **数据可视化** - ECharts 图表，运营数据一目了然
- 🔍 **SEO 优化** - SSR 支持，Meta 标签优化

## 📈 项目进度

- [x] 需求分析与设计
- [x] 数据库设计
- [x] API 接口设计
- [x] 前端项目搭建
- [x] 后端项目搭建
- [ ] 核心功能开发（进行中）
- [ ] 响应式适配
- [ ] 测试与优化
- [ ] 部署上线

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

### 开发流程

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

### 代码规范

- 使用 ESLint 和 Prettier 保持代码风格一致
- 遵循 Vue3 和 TypeScript 最佳实践
- 提交信息遵循 Conventional Commits 规范

## 📝 许可证

本项目采用 MIT 许可证

## 📮 联系方式

- 项目主页：https://github.com/yourusername/pet-web
- 问题反馈：https://github.com/yourusername/pet-web/issues

## 🙏 致谢

感谢所有为这个项目做出贡献的开发者！

---

**让我们一起打造最好的宠物服务平台！** 🐶🐱✨
