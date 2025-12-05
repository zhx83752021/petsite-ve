# Vercel 部署指南

## 📦 项目结构说明

本项目采用前后端分离架构：

- **前端**: Vue 3 + Vite + Element Plus
- **后端**: Express + TypeScript + PostgreSQL

## 🚀 部署方案

### 方案一：前端部署到 Vercel（推荐）

#### 1. 前端部署步骤

**a. 通过 Vercel Dashboard 部署**

1. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
2. 点击 **"Add New Project"**
3. 导入 GitHub 仓库：`https://github.com/zhx83752021/petsite-ve.git`
4. 配置项目：

   - **Framework Preset**: 选择 `Other` 或 `Vite`
   - **Root Directory**: 留空（使用根目录）
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Output Directory**: `frontend/dist`
   - **Install Command**: `cd frontend && npm install`

5. 配置环境变量（Environment Variables）：

   ```
   VITE_APP_TITLE=宠物网
   VITE_API_BASE_URL=https://your-backend-api.com/api
   VITE_CDN_URL=https://your-cdn.com
   ```

6. 点击 **"Deploy"** 开始部署

**b. 通过 Vercel CLI 部署**

```bash
# 安装 Vercel CLI
npm install -g vercel

# 登录 Vercel
vercel login

# 在项目根目录执行部署
vercel

# 生产环境部署
vercel --prod
```

#### 2. 后端部署方案

**方案 A: 后端部署到 Vercel Serverless（适合小型应用）**

1. 创建新的 Vercel 项目用于后端
2. 配置：

   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npm run build`
   - **Output Directory**: 留空

3. 配置环境变量：
   ```
   NODE_ENV=production
   DATABASE_URL=postgresql://user:pass@host:5432/dbname
   REDIS_URL=redis://host:6379
   JWT_SECRET=your-jwt-secret
   CORS_ORIGIN=https://your-frontend.vercel.app
   ```

**方案 B: 后端部署到其他平台（推荐用于生产环境）**

推荐平台：

- **Railway**: 支持数据库 + 后端一体化部署
- **Render**: 免费套餐 + 自动化部署
- **Heroku**: 成熟稳定的 PaaS 平台
- **DigitalOcean App Platform**: 灵活的容器化部署

部署后，将后端 URL 更新到前端的环境变量中。

## ⚙️ 配置文件说明

### 前端配置

**`vercel.json`** - Vercel 前端部署配置

```json
{
  "version": 2,
  "buildCommand": "cd frontend && npm install && npm run build",
  "outputDirectory": "frontend/dist",
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://api.pet-web.com/api/:path*"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

**`frontend/.env.production`** - 生产环境变量

```env
VITE_APP_TITLE=宠物网
VITE_API_BASE_URL=https://api.pet-web.com/api
VITE_CDN_URL=https://cdn.pet-web.com
```

### 后端配置

**`backend/vercel.json`** - Vercel Serverless 配置

```json
{
  "version": 2,
  "builds": [
    {
      "src": "api/index.ts",
      "use": "@vercel/node"
    }
  ]
}
```

## 🗄️ 数据库配置

### PostgreSQL 数据库服务推荐

1. **Supabase** (推荐)

   - 免费套餐：500MB 数据库
   - 自动备份
   - 访问：https://supabase.com

2. **Neon**

   - 免费套餐：3GB 存储
   - Serverless PostgreSQL
   - 访问：https://neon.tech

3. **PlanetScale**
   - MySQL 替代方案
   - 免费套餐：5GB 存储
   - 访问：https://planetscale.com

### Redis 缓存服务推荐

1. **Upstash**

   - 免费套餐：10K 命令/天
   - Serverless Redis
   - 访问：https://upstash.com

2. **Redis Cloud**
   - 免费套餐：30MB
   - 访问：https://redis.com/try-free

## 🔐 环境变量清单

### 前端环境变量

```env
VITE_APP_TITLE=宠物网
VITE_API_BASE_URL=https://your-backend-url.com/api
VITE_CDN_URL=https://your-cdn-url.com
```

### 后端环境变量

```env
NODE_ENV=production
PORT=3001

# 数据库配置
DATABASE_URL=postgresql://user:password@host:5432/database
DB_HOST=your-db-host
DB_PORT=5432
DB_NAME=pet_web
DB_USER=your-username
DB_PASSWORD=your-password

# Redis配置
REDIS_HOST=your-redis-host
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password

# JWT配置
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# CORS配置
CORS_ORIGIN=https://your-frontend.vercel.app

# 文件上传配置
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880
```

## 📝 部署前检查清单

- [ ] 已将代码推送到 GitHub 仓库
- [ ] 已配置 `.gitignore` 排除 `node_modules` 和 `dist`
- [ ] 前端 `.env.production` 已配置正确的 API 地址
- [ ] 后端环境变量已准备好
- [ ] 数据库服务已创建并获取连接字符串
- [ ] Redis 服务已创建并获取连接字符串
- [ ] JWT_SECRET 已生成（建议使用强随机字符串）

## 🔄 持续部署

Vercel 支持自动部署：

- **主分支（main）推送** → 自动部署到生产环境
- **其他分支推送** → 自动创建预览环境

配置方法：

1. 在 Vercel Dashboard 中进入项目设置
2. 找到 Git Integration
3. 确保 "Production Branch" 设置为 `main`

## 🐛 常见问题

### 1. 构建失败：找不到模块

**解决方案**: 确保 `package.json` 中的依赖完整，运行：

```bash
cd frontend
npm install
```

### 2. API 请求失败（CORS 错误）

**解决方案**:

- 检查后端的 CORS 配置
- 确保 `CORS_ORIGIN` 环境变量设置正确
- 前端 API 地址要匹配后端实际部署地址

### 3. 环境变量不生效

**解决方案**:

- Vercel 环境变量需要在 Dashboard 中配置
- 修改环境变量后需要重新部署
- 前端环境变量必须以 `VITE_` 开头

### 4. 数据库连接失败

**解决方案**:

- 检查数据库连接字符串格式
- 确保数据库允许外部连接
- 检查 IP 白名单设置

## 📞 技术支持

如遇到问题，可以查看：

- [Vercel 官方文档](https://vercel.com/docs)
- [Vite 部署指南](https://vitejs.dev/guide/static-deploy.html)
- [Express on Vercel](https://vercel.com/guides/using-express-with-vercel)

## 🎉 部署成功后

访问你的网站：

- 前端：`https://your-project.vercel.app`
- 后端：`https://your-backend.vercel.app/api`

记得将实际的部署 URL 更新到 `frontend/.env.production` 中！
