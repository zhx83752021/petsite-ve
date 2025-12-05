# 宠物网需求文档 - API 接口文档

## 五、API 接口设计

### 5.1 接口设计规范

#### 5.1.1 RESTful API 规范

| 方法   | 说明           | 示例                   |
| ------ | -------------- | ---------------------- |
| GET    | 获取资源       | GET /api/products      |
| POST   | 创建资源       | POST /api/products     |
| PUT    | 更新资源(全量) | PUT /api/products/1    |
| PATCH  | 更新资源(部分) | PATCH /api/products/1  |
| DELETE | 删除资源       | DELETE /api/products/1 |

#### 5.1.2 统一响应格式

**成功响应：**

```typescript
{
  "code": 200,
  "message": "success",
  "data": { /* 业务数据 */ },
  "timestamp": 1704441600000
}
```

**失败响应：**

```typescript
{
  "code": 400,
  "message": "参数错误",
  "errors": [
    { "field": "email", "message": "邮箱格式不正确" }
  ],
  "timestamp": 1704441600000
}
```

**分页响应：**

```typescript
{
  "code": 200,
  "message": "success",
  "data": {
    "items": [ /* 数据列表 */ ],
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 100,
      "totalPages": 5
    }
  }
}
```

#### 5.1.3 状态码说明

| 状态码 | 说明         |
| ------ | ------------ |
| 200    | 请求成功     |
| 201    | 创建成功     |
| 400    | 请求参数错误 |
| 401    | 未授权       |
| 403    | 无权限       |
| 404    | 资源不存在   |
| 500    | 服务器错误   |

### 5.2 用户模块 API

#### 5.2.1 用户注册

**接口地址：** `POST /api/auth/register`

**请求参数：**

```typescript
{
  "username": "string",     // 用户名，3-20字符
  "password": "string",     // 密码，6-20字符
  "phone": "string",        // 手机号
  "code": "string"          // 短信验证码
}
```

**响应数据：**

```typescript
{
  "code": 201,
  "message": "注册成功",
  "data": {
    "userId": "1",
    "username": "testuser",
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

#### 5.2.2 用户登录

**接口地址：** `POST /api/auth/login`

**请求参数：**

```typescript
{
  "username": "string",     // 用户名或手机号
  "password": "string"      // 密码
}
```

**响应数据：**

```typescript
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "userId": "1",
    "username": "testuser",
    "nickname": "测试用户",
    "avatar": "https://...",
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

#### 5.2.3 获取用户信息

**接口地址：** `GET /api/users/me`

**请求头：**

```
Authorization: Bearer {token}
```

**响应数据：**

```typescript
{
  "code": 200,
  "data": {
    "id": "1",
    "username": "testuser",
    "nickname": "测试用户",
    "avatar": "https://...",
    "phone": "138****1234",
    "email": "test@example.com",
    "gender": 1,
    "birthday": "1990-01-01",
    "signature": "热爱宠物的铲屎官",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

#### 5.2.4 更新用户信息

**接口地址：** `PATCH /api/users/me`

**请求参数：**

```typescript
{
  "nickname"?: "string",
  "avatar"?: "string",
  "gender"?: 1 | 2,
  "birthday"?: "string",
  "signature"?: "string"
}
```

**响应数据：**

```typescript
{
  "code": 200,
  "message": "更新成功",
  "data": { /* 更新后的用户信息 */ }
}
```

### 5.3 商品模块 API

#### 5.3.1 获取商品列表

**接口地址：** `GET /api/products`

**请求参数：**

```typescript
{
  "page"?: number,          // 页码，默认1
  "pageSize"?: number,      // 每页数量，默认20
  "categoryId"?: string,    // 分类ID
  "brandId"?: string,       // 品牌ID
  "keyword"?: string,       // 搜索关键词
  "minPrice"?: number,      // 最低价格
  "maxPrice"?: number,      // 最高价格
  "sortBy"?: "default" | "sales" | "price_asc" | "price_desc" | "created"
}
```

**响应数据：**

```typescript
{
  "code": 200,
  "data": {
    "items": [
      {
        "id": "1",
        "name": "皇家小型成犬粮8kg",
        "subtitle": "专为小型犬设计",
        "mainImage": "https://...",
        "price": 299.00,
        "originalPrice": 399.00,
        "sales": 1000,
        "rating": 4.8,
        "tags": ["热销", "包邮"]
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 100,
      "totalPages": 5
    }
  }
}
```

#### 5.3.2 获取商品详情

**接口地址：** `GET /api/products/:id`

**响应数据：**

```typescript
{
  "code": 200,
  "data": {
    "id": "1",
    "name": "皇家小型成犬粮8kg",
    "subtitle": "专为小型犬设计",
    "mainImages": ["https://...", "https://..."],
    "detail": "<p>商品详情HTML</p>",
    "categoryId": "1",
    "categoryName": "犬粮",
    "brandId": "1",
    "brandName": "皇家",
    "petType": 1,
    "ageRange": "成年",
    "ingredients": "鸡肉、大米...",
    "attributes": [
      { "key": "产地", "value": "法国" },
      { "key": "保质期", "value": "18个月" }
    ],
    "skus": [
      {
        "id": "1",
        "skuCode": "SKU001",
        "specCombination": "2kg",
        "price": 99.00,
        "originalPrice": 129.00,
        "stock": 100
      },
      {
        "id": "2",
        "skuCode": "SKU002",
        "specCombination": "8kg",
        "price": 299.00,
        "originalPrice": 399.00,
        "stock": 50
      }
    ],
    "sales": 1000,
    "views": 5000,
    "rating": 4.8,
    "reviewsCount": 280
  }
}
```

#### 5.3.3 获取商品评价

**接口地址：** `GET /api/products/:id/reviews`

**请求参数：**

```typescript
{
  "page"?: number,
  "pageSize"?: number,
  "type"?: "all" | "good" | "medium" | "bad" | "with_image"
}
```

**响应数据：**

```typescript
{
  "code": 200,
  "data": {
    "summary": {
      "total": 280,
      "goodRate": 0.98,
      "tags": [
        { "name": "质量好", "count": 150 },
        { "name": "物流快", "count": 120 }
      ]
    },
    "items": [
      {
        "id": "1",
        "user": {
          "id": "1",
          "nickname": "张三",
          "avatar": "https://..."
        },
        "rating": 5,
        "content": "质量很好，狗狗很爱吃",
        "images": ["https://...", "https://..."],
        "specs": "8kg",
        "createdAt": "2024-01-15T10:30:00Z",
        "likesCount": 12
      }
    ],
    "pagination": { /* ... */ }
  }
}
```

### 5.4 购物车模块 API

#### 5.4.1 获取购物车

**接口地址：** `GET /api/cart`

**响应数据：**

```typescript
{
  "code": 200,
  "data": {
    "items": [
      {
        "id": "1",
        "productId": "1",
        "skuId": "2",
        "productName": "皇家小型成犬粮",
        "productImage": "https://...",
        "specCombination": "8kg",
        "price": 299.00,
        "quantity": 1,
        "stock": 50,
        "isSelected": true,
        "isAvailable": true
      }
    ],
    "summary": {
      "totalAmount": 299.00,
      "selectedCount": 1
    }
  }
}
```

#### 5.4.2 添加到购物车

**接口地址：** `POST /api/cart`

**请求参数：**

```typescript
{
  "skuId": "string",
  "quantity": number
}
```

**响应数据：**

```typescript
{
  "code": 201,
  "message": "添加成功",
  "data": { /* 购物车信息 */ }
}
```

#### 5.4.3 更新购物车商品数量

**接口地址：** `PATCH /api/cart/:id`

**请求参数：**

```typescript
{
  "quantity": number
}
```

#### 5.4.4 删除购物车商品

**接口地址：** `DELETE /api/cart/:id`

**批量删除：** `DELETE /api/cart/batch`

**请求参数：**

```typescript
{
  "ids": ["1", "2", "3"]
}
```

### 5.5 订单模块 API

#### 5.5.1 创建订单

**接口地址：** `POST /api/orders`

**请求参数：**

```typescript
{
  "items": [
    {
      "skuId": "string",
      "quantity": number
    }
  ],
  "addressId": "string",
  "deliveryMethod": "express" | "pickup",
  "paymentMethod": "online" | "cod",
  "couponId"?: "string",
  "remark"?: "string"
}
```

**响应数据：**

```typescript
{
  "code": 201,
  "message": "下单成功",
  "data": {
    "orderId": "1",
    "orderNo": "2024011512345678",
    "payAmount": 687.00,
    "payUrl": "https://..."  // 支付链接
  }
}
```

#### 5.5.2 获取订单列表

**接口地址：** `GET /api/orders`

**请求参数：**

```typescript
{
  "page"?: number,
  "pageSize"?: number,
  "status"?: 1 | 2 | 3 | 4 | 5  // 订单状态
}
```

**响应数据：**

```typescript
{
  "code": 200,
  "data": {
    "items": [
      {
        "id": "1",
        "orderNo": "2024011512345678",
        "items": [
          {
            "productName": "皇家小型成犬粮",
            "productImage": "https://...",
            "specCombination": "8kg",
            "price": 299.00,
            "quantity": 1
          }
        ],
        "totalAmount": 687.00,
        "orderStatus": 2,
        "createdAt": "2024-01-15T10:30:00Z"
      }
    ],
    "pagination": { /* ... */ }
  }
}
```

#### 5.5.3 获取订单详情

**接口地址：** `GET /api/orders/:id`

**响应数据：**

```typescript
{
  "code": 200,
  "data": {
    "id": "1",
    "orderNo": "2024011512345678",
    "orderStatus": 3,
    "payStatus": 2,
    "items": [ /* 商品列表 */ ],
    "address": {
      "name": "张三",
      "phone": "138****1234",
      "detail": "北京市朝阳区xxx"
    },
    "pricing": {
      "totalAmount": 697.00,
      "discountAmount": 20.00,
      "shippingAmount": 10.00,
      "payAmount": 687.00
    },
    "shipping": {
      "expressCompany": "顺丰速运",
      "trackingNumber": "SF1234567890",
      "shippedAt": "2024-01-15T14:30:00Z"
    },
    "timeline": [
      { "status": "已发货", "time": "2024-01-15 14:30" },
      { "status": "已支付", "time": "2024-01-15 10:25" },
      { "status": "已下单", "time": "2024-01-15 10:20" }
    ]
  }
}
```

#### 5.5.4 取消订单

**接口地址：** `POST /api/orders/:id/cancel`

**请求参数：**

```typescript
{
  "reason": "string"  // 取消原因
}
```

#### 5.5.5 确认收货

**接口地址：** `POST /api/orders/:id/confirm`

### 5.6 社区模块 API

#### 5.6.1 获取动态列表

**接口地址：** `GET /api/posts`

**请求参数：**

```typescript
{
  "page"?: number,
  "pageSize"?: number,
  "type"?: "recommend" | "following" | "latest",
  "topicId"?: "string"
}
```

**响应数据：**

```typescript
{
  "code": 200,
  "data": {
    "items": [
      {
        "id": "1",
        "user": {
          "id": "1",
          "nickname": "张三",
          "avatar": "https://..."
        },
        "content": "今天带狗狗去公园玩啦~",
        "images": ["https://...", "https://..."],
        "video": {
          "url": "https://...",
          "cover": "https://...",
          "duration": 60
        },
        "topics": ["萌宠日常", "金毛"],
        "location": "北京市朝阳区",
        "stats": {
          "likes": 128,
          "comments": 32,
          "shares": 12,
          "views": 1500
        },
        "isLiked": false,
        "createdAt": "2024-01-15T10:30:00Z"
      }
    ],
    "pagination": { /* ... */ }
  }
}
```

#### 5.6.2 获取动态详情

**接口地址：** `GET /api/posts/:id`

**响应数据：**

```typescript
{
  "code": 200,
  "data": {
    "id": "1",
    /* 动态完整信息 */,
    "likeUsers": [
      { "id": "1", "nickname": "用户A", "avatar": "https://..." }
    ],
    "comments": [ /* 评论列表 */ ]
  }
}
```

#### 5.6.3 发布动态

**接口地址：** `POST /api/posts`

**请求参数：**

```typescript
{
  "content": "string",
  "images"?: string[],
  "video"?: {
    "url": "string",
    "cover": "string"
  },
  "topics"?: string[],
  "petTags"?: string[],
  "location"?: "string",
  "visibility": 1 | 2 | 3,
  "allowComment": boolean,
  "allowShare": boolean
}
```

**响应数据：**

```typescript
{
  "code": 201,
  "message": "发布成功",
  "data": {
    "id": "1",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

#### 5.6.4 点赞动态

**接口地址：** `POST /api/posts/:id/like`

**取消点赞：** `DELETE /api/posts/:id/like`

#### 5.6.5 评论动态

**接口地址：** `POST /api/posts/:id/comments`

**请求参数：**

```typescript
{
  "content": "string",
  "parentId"?: "string"  // 回复评论时传入
}
```

#### 5.6.6 获取话题列表

**接口地址：** `GET /api/topics`

**响应数据：**

```typescript
{
  "code": 200,
  "data": {
    "items": [
      {
        "id": "1",
        "name": "萌宠日常",
        "description": "分享你的萌宠日常",
        "cover": "https://...",
        "postsCount": 1280,
        "followersCount": 5600,
        "isFollowing": false
      }
    ]
  }
}
```

### 5.7 文件上传 API

#### 5.7.1 上传图片

**接口地址：** `POST /api/upload/image`

**请求方式：** `multipart/form-data`

**请求参数：**

```
file: File  // 图片文件
```

**响应数据：**

```typescript
{
  "code": 200,
  "message": "上传成功",
  "data": {
    "url": "https://cdn.example.com/images/xxx.jpg",
    "filename": "xxx.jpg",
    "size": 102400,
    "mimeType": "image/jpeg"
  }
}
```

#### 5.7.2 上传视频

**接口地址：** `POST /api/upload/video`

**请求参数：**

```
file: File  // 视频文件
```

**响应数据：**

```typescript
{
  "code": 200,
  "message": "上传成功",
  "data": {
    "url": "https://cdn.example.com/videos/xxx.mp4",
    "cover": "https://cdn.example.com/covers/xxx.jpg",
    "filename": "xxx.mp4",
    "size": 10240000,
    "duration": 60
  }
}
```

### 5.8 搜索 API

#### 5.8.1 全局搜索

**接口地址：** `GET /api/search`

**请求参数：**

```typescript
{
  "keyword": "string",
  "type"?: "all" | "product" | "post" | "article",
  "page"?: number,
  "pageSize"?: number
}
```

**响应数据：**

```typescript
{
  "code": 200,
  "data": {
    "products": [ /* 商品列表 */ ],
    "posts": [ /* 动态列表 */ ],
    "articles": [ /* 文章列表 */ ],
    "total": {
      "products": 50,
      "posts": 30,
      "articles": 20
    }
  }
}
```

#### 5.8.2 搜索建议

**接口地址：** `GET /api/search/suggest`

**请求参数：**

```typescript
{
  "keyword": "string"
}
```

**响应数据：**

```typescript
{
  "code": 200,
  "data": {
    "suggestions": [
      "皇家狗粮",
      "皇家猫粮",
      "皇家小型犬"
    ]
  }
}
```

### 5.9 后台管理 API

#### 5.9.1 管理员登录

**接口地址：** `POST /api/admin/auth/login`

**请求参数：**

```typescript
{
  "username": "string",
  "password": "string"
}
```

#### 5.9.2 获取商品列表（后台）

**接口地址：** `GET /api/admin/products`

**请求头：**

```
Authorization: Bearer {admin_token}
```

**请求参数：**

```typescript
{
  "page"?: number,
  "pageSize"?: number,
  "keyword"?: "string",
  "categoryId"?: "string",
  "status"?: 1 | 2
}
```

#### 5.9.3 创建商品

**接口地址：** `POST /api/admin/products`

**请求参数：**

```typescript
{
  "name": "string",
  "categoryId": "string",
  "brandId": "string",
  "mainImages": string[],
  "detail": "string",
  "skus": [
    {
      "skuCode": "string",
      "specCombination": "string",
      "price": number,
      "stock": number
    }
  ],
  /* 更多字段... */
}
```

#### 5.9.4 获取订单列表（后台）

**接口地址：** `GET /api/admin/orders`

**请求参数：**

```typescript
{
  "page"?: number,
  "pageSize"?: number,
  "orderNo"?: "string",
  "status"?: number,
  "startDate"?: "string",
  "endDate"?: "string"
}
```

#### 5.9.5 订单发货

**接口地址：** `POST /api/admin/orders/:id/ship`

**请求参数：**

```typescript
{
  "expressCompany": "string",
  "trackingNumber": "string",
  "remark"?: "string"
}
```

#### 5.9.6 数据统计

**接口地址：** `GET /api/admin/statistics/dashboard`

**响应数据：**

```typescript
{
  "code": 200,
  "data": {
    "today": {
      "sales": 12345.00,
      "orders": 156,
      "newUsers": 234,
      "pageViews": 5678
    },
    "comparison": {
      "salesChange": 0.125,
      "ordersChange": 0.083,
      "usersChange": -0.032,
      "viewsChange": 0.15
    },
    "trends": {
      "sales": [
        { "date": "2024-01-10", "value": 8200 },
        { "date": "2024-01-11", "value": 9100 }
      ]
    }
  }
}
```

### 5.10 错误码说明

| 错误码 | 说明                 |
| ------ | -------------------- |
| 10001  | 用户名已存在         |
| 10002  | 手机号已注册         |
| 10003  | 验证码错误           |
| 10004  | 用户名或密码错误     |
| 10005  | Token 无效或已过期   |
| 20001  | 商品不存在           |
| 20002  | 库存不足             |
| 20003  | 商品已下架           |
| 30001  | 订单不存在           |
| 30002  | 订单状态不允许此操作 |
| 30003  | 支付失败             |
| 40001  | 文件类型不支持       |
| 40002  | 文件大小超过限制     |
| 50001  | 权限不足             |

### 5.11 API 调用示例

#### 5.11.1 前端 Axios 调用示例

```typescript
// api/product.ts
import request from "./request";

export const productApi = {
  // 获取商品列表
  getList(params: ProductListParams) {
    return request.get<ProductListResponse>("/products", { params });
  },

  // 获取商品详情
  getDetail(id: string) {
    return request.get<ProductDetailResponse>(`/products/${id}`);
  },

  // 添加到购物车
  addToCart(data: AddToCartParams) {
    return request.post<CartResponse>("/cart", data);
  },
};

// 使用示例
const { data } = await productApi.getList({
  page: 1,
  pageSize: 20,
  categoryId: "1",
});
```

#### 5.11.2 后端 Controller 示例

```typescript
// controllers/product.controller.ts
import { Request, Response } from "express";
import { ProductService } from "../services/product.service";

export class ProductController {
  // 获取商品列表
  static async getList(req: Request, res: Response) {
    try {
      const params = req.query;
      const result = await ProductService.getList(params);

      res.json({
        code: 200,
        message: "success",
        data: result,
      });
    } catch (error) {
      res.status(500).json({
        code: 500,
        message: error.message,
      });
    }
  }

  // 获取商品详情
  static async getDetail(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const product = await ProductService.getDetail(id);

      if (!product) {
        return res.status(404).json({
          code: 404,
          message: "商品不存在",
        });
      }

      res.json({
        code: 200,
        data: product,
      });
    } catch (error) {
      res.status(500).json({
        code: 500,
        message: error.message,
      });
    }
  }
}
```
