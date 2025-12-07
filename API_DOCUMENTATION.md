# API 文档

## 📅 更新时间

2025-12-07 14:16

## ✅ 已完成的 API 端点（阶段 1）

### 商品相关

#### 1. 获取商品列表（支持搜索/筛选）

**接口**: `GET /api/shop/products`

**查询参数**:

- `page` - 页码（默认：1）
- `pageSize` - 每页数量（默认：20）
- `keyword` - 关键词搜索
- `categoryId` - 分类 ID
- `brandId` - 品牌 ID
- `minPrice` - 最低价格
- `maxPrice` - 最高价格
- `sortBy` - 排序字段：`created_at`, `price`, `sales`（默认：`created_at`）
- `sortOrder` - 排序方向：`asc`, `desc`（默认：`desc`）

**示例**:

```
GET /api/shop/products?keyword=狗粮&categoryId=1&sortBy=price&sortOrder=asc
```

**响应**:

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "items": [
      {
        "id": 1,
        "name": "商品名称",
        "subtitle": "副标题",
        "image": "图片URL",
        "images": ["图片1", "图片2"],
        "price": 299.0,
        "originalPrice": 399.0,
        "sales": 156,
        "stock": 100,
        "categoryId": 1
      }
    ],
    "pagination": {
      "total": 50,
      "page": 1,
      "pageSize": 20
    }
  }
}
```

---

#### 2. 获取商品详情

**接口**: `GET /api/shop/products/[id]`

**响应**:

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 5,
    "name": "幼犬奶粉",
    "subtitle": "营养均衡",
    "detail": "详细描述",
    "image": "主图URL",
    "images": ["图片数组"],
    "price": 128.0,
    "originalPrice": 158.0,
    "sales": 123,
    "stock": 80,
    "categoryId": 1,
    "skus": [
      {
        "id": 5,
        "skuCode": "PUPPY-MILK-400G",
        "spec": "400g装",
        "name": "400g装",
        "value": "400g装",
        "price": 128.0,
        "originalPrice": 158.0,
        "stock": 80
      }
    ]
  }
}
```

---

#### 3. 获取商品分类列表

**接口**: `GET /api/shop/categories`

**响应**:

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "list": [
      {
        "id": 1,
        "name": "宠物食品",
        "parentId": null,
        "icon": "icon-food",
        "sort": 1,
        "children": [
          {
            "id": 11,
            "name": "狗粮",
            "parentId": 1,
            "icon": null,
            "sort": 1,
            "children": []
          }
        ]
      }
    ],
    "total": 4
  }
}
```

---

### 用户认证

#### 4. 用户注册

**接口**: `POST /api/auth/register`

**请求体**:

```json
{
  "username": "testuser",
  "password": "password123",
  "email": "test@example.com",
  "phone": "13800138000"
}
```

**响应**:

```json
{
  "code": 200,
  "message": "注册成功",
  "data": {
    "id": 1,
    "username": "testuser",
    "email": "test@example.com",
    "phone": "13800138000",
    "createdAt": "2025-12-07T06:15:00.000Z"
  }
}
```

---

#### 5. 用户登录

**接口**: `POST /api/auth/login`

**请求体**:

```json
{
  "username": "testuser",
  "password": "password123"
}
```

**响应**:

```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "username": "testuser",
      "email": "test@example.com",
      "phone": "13800138000",
      "avatar": null,
      "role": "user",
      "status": "active"
    }
  }
}
```

---

### 购物车

#### 6. 获取购物车列表

**接口**: `GET /api/cart`

**请求头**: `Authorization: Bearer {token}`

**响应**:

```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": 1,
      "productId": 5,
      "skuId": 5,
      "quantity": 2,
      "productName": "幼犬奶粉",
      "image": "图片URL",
      "price": 128.0,
      "stock": 80,
      "spec": "400g装",
      "selected": true
    }
  ]
}
```

---

#### 7. 添加商品到购物车

**接口**: `POST /api/cart`

**请求头**: `Authorization: Bearer {token}`

**请求体**:

```json
{
  "productId": 5,
  "skuId": 5,
  "quantity": 1
}
```

**响应**:

```json
{
  "code": 200,
  "message": "添加成功",
  "data": null
}
```

---

#### 8. 更新购物车商品数量

**接口**: `PUT /api/cart`

**请求头**: `Authorization: Bearer {token}`

**请求体**:

```json
{
  "id": 1,
  "quantity": 3
}
```

**响应**:

```json
{
  "code": 200,
  "message": "更新成功",
  "data": null
}
```

---

#### 9. 删除购物车商品

**接口**: `DELETE /api/cart?id={cartItemId}`

**请求头**: `Authorization: Bearer {token}`

**响应**:

```json
{
  "code": 200,
  "message": "删除成功",
  "data": null
}
```

---

### 订单

#### 10. 创建订单

**接口**: `POST /api/orders/create`

**请求头**: `Authorization: Bearer {token}`

**请求体**:

```json
{
  "items": [
    {
      "skuId": 5,
      "quantity": 2
    }
  ],
  "address": {
    "name": "张三",
    "phone": "13800138000",
    "province": "北京市",
    "city": "北京市",
    "district": "朝阳区",
    "detail": "某某街道123号"
  }
}
```

**响应**:

```json
{
  "code": 200,
  "message": "订单创建成功",
  "data": {
    "orderId": 1,
    "orderNo": "ORD1733548560001234",
    "totalAmount": 256.0,
    "items": [
      {
        "productId": 5,
        "skuId": 5,
        "productName": "幼犬奶粉",
        "spec": "400g装",
        "price": 128.0,
        "quantity": 2,
        "image": "图片URL"
      }
    ],
    "createdAt": "2025-12-07T06:16:00.000Z"
  }
}
```

---

### 管理后台

#### 11. 管理员登录

**接口**: `POST /api/admin/login`

**请求体**:

```json
{
  "username": "admin",
  "password": "admin123"
}
```

**响应**:

```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "admin": {
      "id": 1,
      "username": "admin",
      "email": "admin@example.com",
      "role": "admin",
      "status": "active"
    }
  }
}
```

---

### 辅助接口

#### 12. 健康检查

**接口**: `GET /api/health`

**响应**:

```json
{
  "code": 200,
  "message": "API is running",
  "data": {
    "status": "ok",
    "timestamp": "2025-12-07T06:16:00.000Z",
    "uptime": 123.45
  }
}
```

---

#### 13. SKU 调试（仅测试用）

**接口**: `GET /api/debug-sku`

**响应**: 返回所有 SKU 数据和商品 5 的详细信息

---

## 🔐 认证说明

### 需要认证的接口

以下接口需要在请求头中携带 JWT Token：

- 所有 `/api/cart/*` 接口
- 所有 `/api/orders/*` 接口

**请求头格式**:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Token 获取

- 前台用户：通过 `/api/auth/login` 登录获取
- 管理员：通过 `/api/admin/login` 登录获取

### Token 有效期

- 默认：7 天
- 过期后需要重新登录

---

## 📊 错误码说明

| 错误码 | 说明                          |
| ------ | ----------------------------- |
| 200    | 成功                          |
| 400    | 参数错误                      |
| 401    | 未授权（未登录或 token 无效） |
| 403    | 禁止访问（账号被禁用等）      |
| 404    | 资源不存在                    |
| 405    | 方法不允许                    |
| 500    | 服务器内部错误                |

---

## 🎯 下一步开发计划（阶段 2）

### 管理后台功能

- [ ] 商品列表管理 API
- [ ] 商品新增/编辑/删除 API
- [ ] 分类管理 API
- [ ] 订单列表查看 API
- [ ] 订单状态更新 API

### 前台增强功能

- [ ] 用户个人信息 API
- [ ] 用户地址管理 API
- [ ] 订单列表查询 API
- [ ] 订单详情查询 API
- [ ] 订单取消 API

---

## 💡 使用建议

1. **本地测试**：所有 API 都支持本地开发环境测试
2. **CORS**：已配置跨域支持，可从任何域名访问
3. **数据库**：使用 PostgreSQL，所有查询都经过优化
4. **事务处理**：订单创建等关键操作使用数据库事务保证数据一致性
5. **错误日志**：所有错误都会输出到 Vercel Functions 日志

---

## 📝 更新日志

### 2025-12-07

- ✅ 创建商品分类列表 API
- ✅ 增强商品列表 API（添加搜索/筛选/排序）
- ✅ 创建用户注册/登录 API
- ✅ 创建购物车完整 API（增删改查）
- ✅ 创建订单创建 API（含事务处理）
- ✅ 完成阶段 1：商城核心功能

---

## 🔗 相关文档

- [Vercel 部署状态报告](./VERCEL_DEPLOYMENT_STATUS.md)
- [环境变量配置说明](./VERCEL_ENV_SETUP.md)
