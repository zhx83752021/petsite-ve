# Vercel 统一部署说明（前后端一体）

## 📦 项目架构

本项目采用前后端统一部署方案：

- **前端**: Vue 3 + Vite (静态文件)
- **后端**: Express + TypeScript (Serverless Functions)
- **部署**: 单个 Vercel 项目，同一域名

## 🚀 部署步骤

### 1. 通过 Vercel Dashboard 部署

#### a. 创建项目

1. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
2. 点击 **"Add New Project"**
3. 导入 GitHub 仓库：`https://github.com/zhx83752021/petsite-ve.git`

#### b. 配置项目

- **Framework Preset**: 选择 `Other`
- **Root Directory**: 留空（使用根目录）
- **Build Command**: 留空（使用 vercel.json 配置）
- **Output Directory**: 留空（使用 vercel.json 配置）

#### c. 配置环境变量

**前端环境变量**（无需配置，已在代码中）：

```env
VITE_APP_TITLE=宠物网
VITE_API_BASE_URL=/api
```

**后端环境变量**（必须在 Vercel Dashboard 配置）：

```env
NODE_ENV=production

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
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_EXPIRES_IN=7d

# CORS配置（设置为你的Vercel域名）
CORS_ORIGIN=https://your-project.vercel.app
```

#### d. 部署

点击 **"Deploy"** 按钮开始部署。

### 2. 通过 Vercel CLI 部署

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

## ⚙️ 配置文件说明

### vercel.json - 核心配置

```json
{
  "version": 2,
  "builds": [
    {
      "src": "frontend/package.json",
      "use": "@vercel/static-build",
      "config": { "distDir": "dist" }
    },
    {
      "src": "backend/api/index.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/backend/api/index.ts"
    },
    {
      "src": "/(.*)",
      "dest": "/frontend/dist/$1"
    }
  ]
}
```

**说明**：

- 前端构建为静态文件
- 后端作为 Serverless Function
- `/api/*` 路由到后端
- 其他路由到前端

## 🗄️ 数据库配置

### PostgreSQL 推荐服务

1. **Supabase** (推荐)

   - 免费套餐：500MB
   - 地址：https://supabase.com
   - 获取连接字符串：Settings → Database → Connection String

2. **Neon**
   - 免费套餐：3GB
   - 地址：https://neon.tech
   - Serverless PostgreSQL

### Redis 推荐服务

1. **Upstash** (推荐)
   - 免费套餐：10K 命令/天
   - 地址：https://upstash.com
   - 兼容 Serverless

## 📝 部署前检查清单

- [ ] 代码已推送到 GitHub
- [ ] 已准备好 PostgreSQL 数据库连接信息
- [ ] 已准备好 Redis 连接信息
- [ ] 已生成 JWT_SECRET（至少 32 位随机字符串）
- [ ] 确认 `vercel.json` 配置正确
- [ ] 确认 `frontend/.env.production` 中 API 地址为 `/api`

## 🔄 持续部署

Vercel 自动部署：

- **main 分支推送** → 自动部署到生产环境
- **其他分支推送** → 自动创建预览环境

## 📍 路由规则

部署后的访问规则：

```
https://your-project.vercel.app/          → 前端首页
https://your-project.vercel.app/shop      → 前端商城页面
https://your-project.vercel.app/api/users → 后端 API
https://your-project.vercel.app/api/products → 后端 API
```

## 🐛 常见问题

### 1. API 请求 404

**原因**：后端 API 路由配置不正确

**解决**：

- 检查 `vercel.json` 中的 routes 配置
- 确保后端路由以 `/api` 开头
- 检查 `backend/src/routes/index.ts` 路由定义

### 2. 数据库连接失败

**原因**：数据库配置或网络问题

**解决**：

- 确认 DATABASE_URL 格式正确
- 检查数据库是否允许外部连接
- 确认 IP 白名单设置（某些数据库服务需要）
- Vercel 使用动态 IP，建议允许所有 IP 或使用支持 Serverless 的数据库

### 3. CORS 错误

**原因**：CORS 配置不匹配

**解决**：

- 设置 CORS_ORIGIN 为你的 Vercel 域名
- 或设置为 `*` 允许所有来源（不推荐生产环境）

### 4. 环境变量不生效

**解决**：

- 环境变量必须在 Vercel Dashboard 中配置
- 修改环境变量后需要重新部署
- 使用 `vercel env pull` 拉取环境变量到本地测试

## 🎯 部署后测试

### 测试前端

访问：`https://your-project.vercel.app`

### 测试后端 API

```bash
# 测试健康检查
curl https://your-project.vercel.app/api/health

# 测试用户列表（需要认证）
curl https://your-project.vercel.app/api/users \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 📞 获取帮助

- [Vercel 文档](https://vercel.com/docs)
- [Vercel Serverless Functions](https://vercel.com/docs/functions/serverless-functions)
- [Vite 部署指南](https://vitejs.dev/guide/static-deploy.html)

## ✅ 部署成功标志

- ✅ 网站可以正常访问
- ✅ 前端页面加载正常
- ✅ API 请求返回正确数据
- ✅ 没有 CORS 错误
- ✅ 数据库连接正常

## 🔐 安全建议

1. **JWT_SECRET**：使用强随机字符串（至少 32 位）
2. **数据库密码**：使用复杂密码
3. **CORS_ORIGIN**：生产环境不要使用 `*`
4. **环境变量**：不要将敏感信息提交到 Git

## 📈 性能优化建议

1. **启用缓存**：静态资源自动缓存
2. **CDN**：Vercel 自动使用全球 CDN
3. **压缩**：自动开启 Gzip/Brotli
4. **图片优化**：考虑使用 Vercel Image Optimization

---

🎉 **祝部署顺利！**
