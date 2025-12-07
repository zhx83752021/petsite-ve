# Vercel 部署终极方案

## 📅 创建时间

2025-12-07 18:50

## ⚠️ 当前问题

**错误**: `Permission denied: /vercel/path0/frontend/node_modules/.bin/vite`

**根本原因**: Vercel 构建环境对执行权限的严格限制

## 🎯 终极解决方案：调整项目结构

如果 `chmod` 方案仍然失败，需要重构项目结构为 Vercel 标准布局。

### 方案：将 frontend 设为根目录

#### 新的项目结构

```
petsite-ve/
├── api/                    # Serverless Functions (保持不变)
│   ├── admin/
│   │   └── login.ts
│   └── shop/
│       └── products.ts
├── src/                    # 前端源码 (从 frontend/src 移动)
├── public/                 # 静态资源 (从 frontend/public 移动)
├── index.html              # 入口文件 (从 frontend 移动)
├── vite.config.ts          # Vite 配置 (从 frontend 移动)
├── package.json            # 前端依赖 (合并)
├── tsconfig.json           # TS 配置
├── backend/                # 保留作为参考
└── vercel.json             # 简化配置
```

#### 迁移步骤

**1. 移动前端文件到根目录**

```powershell
# 在 d:\site4 执行
Move-Item frontend\src .\
Move-Item frontend\public .\
Move-Item frontend\index.html .\
Move-Item frontend\vite.config.ts .\
Move-Item frontend\tsconfig.json .\tsconfig.frontend.json
Move-Item frontend\package.json .\package.frontend.json
```

**2. 合并 package.json**

```json
{
  "name": "petsite-ve",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "vue": "^3.4.0",
    "vue-router": "^4.2.5",
    "pinia": "^2.1.7",
    "element-plus": "^2.4.4",
    "@element-plus/icons-vue": "^2.3.1",
    "axios": "^1.6.2",
    "pg": "^8.11.3",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2"
  },
  "devDependencies": {
    "@vercel/node": "^3.0.0",
    "@types/bcryptjs": "^2.4.6",
    "@types/jsonwebtoken": "^9.0.5",
    "@types/node": "^20.10.6",
    "@types/pg": "^8.10.0",
    "vite": "^5.0.8",
    "@vitejs/plugin-vue": "^5.0.0",
    "typescript": "^5.3.3"
  }
}
```

**3. 简化 vercel.json**

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

**4. 修改 vite.config.ts** (如果需要)

确保路径配置正确：

```typescript
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
```

**5. 提交并部署**

```bash
git add .
git commit -m "refactor: 调整项目结构，前端移至根目录"
git push origin main
```

### 优势

✅ **符合 Vercel 标准结构**
✅ **无需复杂的构建配置**
✅ **自动识别 Vite 项目**
✅ **API 保持在 /api 目录**
✅ **无权限问题**

### 缺点

- 需要重构目录结构
- 需要更新导入路径（如果有绝对路径引用）
- backend 目录变为参考代码

## 🔄 另一个方案：分离部署

如果不想重构，可以：

### 方案 B：前端和 API 分离

**1. 创建新的 Vercel 项目（仅前端）**

- Root Directory: `frontend`
- Framework: Vite
- Build Command: `npm run build`
- Output Directory: `dist`

**2. 当前项目仅部署 API**

修改 `vercel.json`:

```json
{
  "functions": {
    "api/**/*.ts": {
      "runtime": "nodejs20.x"
    }
  }
}
```

**3. 前端配置 API 地址**

在前端 `.env.production`:

```
VITE_API_BASE_URL=https://your-api-domain.vercel.app/api
```

### 优势

✅ **前端和后端独立部署**
✅ **各自优化**
✅ **无权限问题**

### 缺点

- 需要两个 Vercel 项目
- CORS 配置
- 管理复杂度增加

## 📋 快速决策指南

### 如果 chmod 方案成功

✅ **继续使用当前结构**

### 如果 chmod 方案失败

1. **推荐**: 方案 - 重构为标准结构
2. **备选**: 方案 B - 分离部署

## 🚀 立即执行（如果需要）

**方案：重构脚本**

创建 `重构项目.ps1`:

```powershell
# 备份
git checkout -b backup-before-restructure

# 移动前端文件
Move-Item frontend\src .\
Move-Item frontend\public .\
Move-Item frontend\index.html .\
Move-Item frontend\vite.config.ts .\

# 复制配置文件并合并
# (需要手动合并 package.json)

# 清理旧目录
Remove-Item frontend -Recurse -Force

# 提交
git add .
git commit -m "refactor: 前端移至根目录"
git push origin main
```

## 💡 建议

**立即尝试**: 等待当前的 chmod 部署结果

**如果失败**: 立即执行方案（预计 10 分钟完成重构）

**长期方案**: 考虑将后端迁移到独立服务器（Railway/Render），前端保持在 Vercel
