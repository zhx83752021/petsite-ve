# Vercel 全栈部署配置说明

## 已完成的配置修改

### 1. vercel.json 配置

使用标准的 Vercel 全栈部署配置：

```json
{
  "version": 2,
  "builds": [
    {
      "src": "frontend/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    },
    {
      "src": "backend/src/server.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/backend/src/server.ts"
    },
    {
      "src": "/(.*)",
      "dest": "/frontend/$1"
    }
  ]
}
```

### 2. backend/src/server.ts 修改

添加了 Vercel 环境检测，在 Serverless 环境下导出 Express app：

```typescript
// Vercel Serverless 环境检测
const isVercel = !!process.env.VERCEL;

// 创建 Express 应用实例
const app = createApp();

// Vercel 环境：导出 app
if (isVercel) {
  logger.info("Vercel Serverless 环境检测");
  testConnection()
    .then(() => logger.info("数据库连接成功"))
    .catch((err) => logger.error("数据库连接失败:", err));

  module.exports = app;
} else {
  // 本地环境：启动服务器
  startServer();
}
```

## 部署流程

### 自动部署

1. 推送代码到 GitHub
2. Vercel 自动检测并构建
3. 前端构建为静态文件
4. 后端打包为 Serverless Function

### 环境变量配置

在 Vercel Dashboard 中配置以下环境变量：

**必需变量**:

```
DATABASE_URL=postgresql://...
NODE_ENV=production
JWT_SECRET=your-secret-key
CORS_ORIGIN=*
```

**可选变量**:

```
PORT=3001
JWT_EXPIRES_IN=7d
REDIS_HOST=
REDIS_PORT=
REDIS_PASSWORD=
```

## 路由说明

### 前端路由

- 所有非 `/api` 路径都由前端处理
- 前端使用 Vue Router 进行 SPA 路由

### 后端路由

- 所有 `/api/*` 请求都转发到 backend/src/server.ts
- Express 处理所有 API 请求

## 部署验证

### 检查前端

访问: `https://ski-row.cn/`

- 应该能看到首页
- 页面正常显示

### 检查后端

访问: `https://ski-row.cn/api/health`

- 应该返回 JSON 响应
- 状态码 200

### 检查数据库

访问: `https://ski-row.cn/api/shop/products`

- 应该返回商品列表
- 如果返回空数组，需要初始化数据

## 数据库初始化

如果数据库是空的：

1. 访问: `https://ski-row.cn/api/init/database`
2. 等待表创建完成
3. 运行本地脚本插入数据：
   ```powershell
   cd backend
   # 修改 .env 中的 DATABASE_URL 为生产环境的
   npm run ts-node scripts/add-more-products.ts
   ```

## 故障排查

### 构建失败

1. 检查 Vercel 构建日志
2. 确认所有依赖已正确安装
3. 检查 TypeScript 编译错误

### API 500 错误

1. 查看 Vercel Functions 日志
2. 检查数据库连接
3. 确认环境变量配置正确

### 数据库连接失败

1. 检查 DATABASE_URL 格式是否正确
2. 确认数据库服务器允许 Vercel IP 访问
3. 测试数据库连接字符串

## 性能优化建议

### Serverless 优化

- 使用小的连接池（max: 2）
- 缩短空闲超时（idle: 1000ms）
- 避免长时间运行的查询

### 数据库优化

- 使用 Serverless 友好的数据库（如 Neon, Supabase）
- 启用连接池
- 使用索引优化查询

## 当前部署状态

- ✅ 前端配置完成
- ✅ 后端 Serverless Function 配置完成
- 🔄 等待 Vercel 部署
- ⏭️ 下一步：验证部署结果

## 注意事项

1. **Serverless 限制**: 免费版 10 秒执行超时
2. **冷启动**: 首次请求可能需要 2-3 秒
3. **并发限制**: 免费版有并发请求限制
4. **日志保留**: 免费版日志保留时间有限

如果遇到性能问题，建议考虑升级 Vercel 套餐或迁移后端到专用服务器。
