# 后端项目启动指南

## 一、环境准备

### 1. 确保已安装

- Node.js >= 20.10.0
- PostgreSQL >= 14.0
- Redis >= 7.2.0 (可选，用于缓存)

### 2. 检查版本

```bash
node --version
npm --version
psql --version
```

## 二、安装依赖

进入后端目录并安装依赖：

```bash
cd backend
npm install
```

这将安装所有必需的依赖包，包括：

- Express (Web 框架)
- Sequelize (ORM)
- TypeScript
- JWT (认证)
- 其他工具库

## 三、数据库配置

### 1. 创建数据库

```bash
# 方式一：使用 psql 命令行
psql -U postgres
# 在 PostgreSQL 命令行中执行
CREATE DATABASE pet_web WITH ENCODING 'UTF8';
\q
# 方式二：使用 createdb 命令
createdb -U postgres pet_web
```

### 2. 配置环境变量

编辑 `.env.development` 文件，修改数据库配置：

```env
# 数据库配置
DB_HOST=localhost
DB_PORT=5432
DB_NAME=pet_web
DB_USER=postgres
DB_PASSWORD=你的PostgreSQL密码
# Redis 配置（如果没有 Redis，可以暂时注释相关代码）
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
# JWT 配置
JWT_SECRET=your_jwt_secret_key_change_in_production
JWT_EXPIRES_IN=7d
```

### 3. 初始化数据库表

**方式一：使用初始化脚本（推荐）**

```bash
# 创建所有数据库表（不删除现有数据）
npm run db:init

# 强制重建所有表（警告：会删除所有现有数据）
npm run db:init:force
```

**方式二：启动开发服务器自动创建**

启动开发服务器时，Sequelize 会自动创建表结构（开发模式）：

```bash
npm run dev
```

### 4. 创建管理员账号

**推荐方式：使用初始化脚本**

```bash
npm run create:admin
```

该命令会创建默认管理员账号：

- **用户名：** `admin`
- **密码：** `admin123`
- **姓名：** 超级管理员
- **邮箱：** admin@petshop.com

**⚠️ 重要：首次登录后请立即修改密码！**

**方式二：手动创建（需要先启动服务器）**

```bash
# 在另一个终端执行
ts-node scripts/create-admin.ts
```

## 四、启动服务器

### 开发模式

```bash
npm run dev
```

服务器将运行在 http://localhost:3000

### 生产模式

```bash
# 编译 TypeScript
npm run build
# 启动生产服务器
npm start
```

## 五、测试 API

### 1. 健康检查

```bash
curl http://localhost:3000/api/health
```

### 2. 管理员登录

```bash
curl -X POST http://localhost:3000/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'
```

成功后会返回 token，用于后续请求的认证。

### 3. 获取商品列表（需要认证）

```bash
curl http://localhost:3000/api/admin/products \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 六、API 文档

完整的 API 接口文档请参考：

- `/docs/05-API接口文档.md`

## 七、常见问题

### Q1: 端口被占用

修改 `.env.development` 中的 `PORT` 配置：

```env
PORT=3001
```

### Q2: 数据库连接失败

检查：

1. PostgreSQL 服务是否启动
2. 数据库配置是否正确（用户名、密码、端口）
3. 数据库用户权限是否足够
4. PostgreSQL 是否允许本地连接（检查 pg_hba.conf）

### Q3: Redis 连接失败（可选）

如果没有 Redis，可以临时注释 Redis 相关代码：

- `src/config/redis.ts`
- `src/services/product.service.ts` 中的缓存逻辑

### Q4: TypeScript 编译错误

确保已安装所有依赖：

```bash
rm -rf node_modules package-lock.json
npm install
```

## 八、目录结构说明

```
backend/
├── src/
│   ├── config/          # 配置文件（数据库、Redis、JWT等）
│   ├── models/          # Sequelize 数据模型
│   ├── controllers/     # 业务逻辑控制器
│   ├── services/        # 业务服务层
│   ├── routes/          # 路由定义
│   ├── middleware/      # 中间件（认证、日志、错误处理）
│   ├── utils/           # 工具函数
│   ├── types/           # TypeScript 类型定义
│   ├── app.ts          # Express 应用配置
│   └── server.ts       # 服务器入口
├── scripts/            # 辅助脚本
├── logs/               # 日志文件（自动生成）
├── uploads/            # 上传文件（自动生成）
└── dist/              # 编译输出（自动生成）
```

## 九、下一步开发

当前已实现的功能：

- ✅ 管理员登录和管理
- ✅ 商品 CRUD
- ✅ 订单管理
- ✅ 完整的错误处理和日志记录
- ✅ JWT 认证
- ✅ 数据库连接和 ORM
  待开发功能：
- ⏳ 用户管理 API
- ⏳ 社区管理 API
- ⏳ 数据统计 API
- ⏳ 文件上传功能
- ⏳ 更多业务逻辑

## 十、开发建议

1. **代码规范**：使用 ESLint 和 Prettier 格式化代码
   ```bash
   npm run lint
   npm run format
   ```
2. **Git 提交**：遵循 Conventional Commits 规范
   ```bash
   git commit -m "feat: 添加商品管理API"
   ```
3. **测试**：编写单元测试和集成测试
   ```bash
   npm test
   ```
4. **日志查看**：开发时查看日志文件
   ```bash
   tail -f logs/combined.log
   tail -f logs/error.log
   ```

---

**祝开发顺利！** 🚀
