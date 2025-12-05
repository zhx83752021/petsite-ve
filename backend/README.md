# 宠物网后台管理系统 - 后端服务

## 项目简介

基于 Node.js + Express + TypeScript + PostgreSQL + Redis 构建的宠物电商平台后台管理系统。

## 技术栈

- **运行时**: Node.js ^20.10.0
- **框架**: Express ^4.18.2
- **语言**: TypeScript ^5.3.3
- **数据库**: PostgreSQL ^14.0
- **ORM**: Sequelize ^6.35.2
- **缓存**: Redis ^7.2.0
- **认证**: JWT
- **日志**: Winston
- **验证**: Joi

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.env.development` 文件并修改配置：

```bash
cp .env.development .env
```

### 3. 数据库初始化

创建数据库：

```bash
# 使用 psql 命令
psql -U postgres -c "CREATE DATABASE pet_web WITH ENCODING 'UTF8';"

# 或使用 createdb 命令
createdb -U postgres pet_web
```

运行迁移：

```bash
npm run migrate
```

### 4. 启动开发服务器

```bash
npm run dev
```

服务将运行在 http://localhost:3000

## 项目结构

```
backend/
├── src/
│   ├── config/            # 配置文件
│   ├── models/            # 数据模型
│   ├── controllers/       # 控制器
│   ├── services/          # 业务逻辑
│   ├── routes/            # 路由
│   ├── middleware/        # 中间件
│   ├── validators/        # 数据验证
│   ├── utils/             # 工具函数
│   ├── types/             # TypeScript 类型
│   ├── app.ts            # Express 应用
│   └── server.ts         # 服务器入口
├── uploads/              # 文件上传目录
├── logs/                 # 日志目录
└── dist/                 # 编译输出
```

## 可用脚本

- `npm run dev` - 启动开发服务器
- `npm run build` - 构建生产版本
- `npm start` - 启动生产服务器
- `npm run lint` - 代码检查
- `npm run format` - 代码格式化
- `npm test` - 运行测试

## API 文档

详见 `/docs/05-API接口文档.md`

## 开发规范

- 使用 TypeScript 严格模式
- 遵循 ESLint 和 Prettier 规则
- 所有 API 返回统一格式
- 接口需要添加完整的错误处理
- 关键操作需要记录日志

## 许可证

MIT
