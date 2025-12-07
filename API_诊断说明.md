# API 诊断说明

## 当前状态

已将 API 简化为最小版本（不依赖 backend 代码），用于诊断 Serverless Function 基础功能。

## 测试步骤

### 步骤 1: 测试基础端点（等待 Vercel 部署完成后）

```bash
# 测试 1: 独立测试端点
https://ski-row.cn/api/test

# 预期结果:
{
  "success": true,
  "message": "Serverless Function 工作正常",
  ...
}
```

```bash
# 测试 2: 健康检查
https://ski-row.cn/api/health

# 预期结果:
{
  "success": true,
  "message": "API 正常运行",
  ...
}
```

### 步骤 2: 诊断结果

#### ✅ 如果两个端点都返回 200

**说明**: Serverless Function 本身正常，问题在于 backend 代码集成

**解决方案**:

1. backend 可能不适合 Serverless 环境
2. 建议将 backend 部署到专用服务器（Railway/Render）
3. 前端通过 CORS 调用独立部署的 API

#### ❌ 如果仍然返回 500

**说明**: Vercel Serverless Function 配置有问题

**可能原因**:

1. `vercel.json` 配置错误
2. Node.js 版本不兼容
3. 依赖安装失败
4. Vercel 区域限制

## Vercel Serverless Function 的限制

### 免费版限制

- **执行时间**: 10 秒
- **内存**: 1GB
- **冷启动**: 2-5 秒
- **并发**: 有限

### 不适合的场景

- 复杂的数据库操作
- 长时间运行的任务
- 大量并发请求
- 持久化连接

## 推荐方案

### 方案 A: 前后端分离部署

**前端**: Vercel（静态资源）
**后端**: Railway/Render/Fly.io（长期运行服务器）

**优点**:

- ✅ 稳定可靠
- ✅ 无 Serverless 限制
- ✅ 更好的性能
- ✅ 更容易调试

**步骤**:

1. 将 backend 代码部署到 Railway
2. 获取 API 地址（如 `https://petsite-api.railway.app`）
3. 修改前端 `.env.production`:
   ```
   VITE_API_BASE_URL=https://petsite-api.railway.app/api
   ```
4. 重新部署前端到 Vercel

### 方案 B: 全栈部署到单一平台

将前后端都部署到 Railway/Render，不使用 Vercel。

## Railway 部署指南（推荐）

### 1. 注册 Railway

https://railway.app/

### 2. 创建 PostgreSQL 数据库

- 点击 "New Project" → "PostgreSQL"
- 复制 `DATABASE_URL`

### 3. 部署后端

```bash
# 在 Railway Dashboard
- New → GitHub Repo → 选择你的仓库
- 设置 Root Directory: backend
- 添加环境变量:
  DATABASE_URL=<从步骤2复制>
  NODE_ENV=production
  JWT_SECRET=your-secret
  CORS_ORIGIN=*

- 部署成功后，获取 API 地址
```

### 4. 部署前端到 Vercel

修改 `.env.production`:

```
VITE_API_BASE_URL=https://your-api.railway.app/api
```

重新推送到 GitHub，Vercel 自动部署。

## 当前部署状态

- ✅ 前端: Vercel (https://ski-row.cn)
- 🔄 后端: 临时禁用（诊断中）
- 📋 下一步: 根据测试结果决定部署策略
