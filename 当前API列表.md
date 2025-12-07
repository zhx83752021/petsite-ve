# 当前部署的 API 列表

## 📊 Vercel 限制说明

**Hobby 免费计划限制**: 最多 12 个 Serverless Functions

**当前使用**: 8 个 Functions ✅

---

## ✅ 正式 API（共 8 个）

### 商城前台 API (1 个)

#### 1. 商品列表

- **路径**: `/api/shop/products`
- **方法**: GET
- **功能**: 获取商品列表（包含 SKU 价格、库存信息）

---

### 管理后台 API (7 个)

#### 2. 管理员登录

- **路径**: `/api/admin/login`
- **方法**: POST
- **功能**: 管理员登录验证、JWT token 生成

#### 3. 管理员列表

- **路径**: `/api/admin/admins`
- **方法**: GET
- **功能**: 获取管理员列表

#### 4. 仪表盘统计

- **路径**: `/api/admin/statistics/dashboard`
- **方法**: GET
- **功能**: 获取后台首页统计数据

#### 5. 品牌管理

- **路径**: `/api/admin/brands`
- **方法**: GET, POST, PUT, DELETE
- **功能**: 品牌完整 CRUD

#### 6. 订单管理

- **路径**: `/api/admin/orders`
- **方法**: GET, PUT
- **功能**: 订单列表查询、状态更新

#### 7. 动态管理

- **路径**: `/api/admin/posts`
- **方法**: GET, POST, PUT, DELETE
- **功能**: 社区动态完整 CRUD

#### 8. 商品管理

- **路径**: `/api/admin/products`
- **方法**: GET, POST, PUT, DELETE
- **功能**: 商品和 SKU 完整 CRUD

---

## ❌ 已删除的调试 API（5 个）

以下 API 已被删除以符合 Vercel 限制：

1. ~~`/api/test`~~ - 环境测试
2. ~~`/api/test-db`~~ - 数据库测试
3. ~~`/api/init-admin`~~ - 管理员初始化（已执行，不再需要）
4. ~~`/api/debug-login`~~ - 登录调试
5. ~~`/api/debug-products`~~ - 商品调试

**注意**: 这些调试 API 已完成任务，删除不影响正常功能。

---

## 📋 API 使用情况

| 分类          | API 数量 | 说明                   |
| ------------- | -------- | ---------------------- |
| 商城前台      | 1        | 商品展示               |
| 管理后台-认证 | 2        | 登录、管理员列表       |
| 管理后台-统计 | 1        | 仪表盘数据             |
| 管理后台-管理 | 4        | 品牌、订单、动态、商品 |
| **总计**      | **8**    | ✅ 符合限制            |

---

## 🎯 未来扩展建议

如果需要添加更多 API，有以下选择：

### 选项 1: 合并 API

将多个相关端点合并到一个 Function，通过路由参数区分：

```
/api/admin/resources?type=brands
/api/admin/resources?type=posts
```

### 选项 2: 升级到 Pro 计划

- **费用**: $20/月
- **Functions 限制**: 无限制
- **其他优势**: 更多流量、更好性能

### 选项 3: 分离部署

- 前端: Vercel
- 后端 API: 其他平台（Railway, Render, Fly.io 等）

---

## ✨ 当前部署状态

- **前端**: ✅ 完整部署
- **API**: ✅ 8 个核心功能
- **数据库**: ✅ PostgreSQL 连接正常
- **Vercel 限制**: ✅ 符合免费计划要求

---

## 📝 快速访问

**前台**:

- 商城: https://ski-row.cn/shop

**后台**:

- 登录: https://ski-row.cn/admin/login
- 仪表盘: https://ski-row.cn/admin/dashboard
- 管理员管理: https://ski-row.cn/admin/admins
- 品牌管理: https://ski-row.cn/admin/brands
- 订单列表: https://ski-row.cn/admin/orders
- 动态管理: https://ski-row.cn/admin/posts
- 商品管理: https://ski-row.cn/admin/products

**登录账号**:

- 用户名: `admin`
- 密码: `admin123`
