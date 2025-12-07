# Vercel 数据库初始化指南

## 方法一：本地运行初始化脚本（推荐）

### 1. 获取 Vercel 的数据库连接字符串

在 Vercel Dashboard → Storage → pet_web 数据库 → Connection 中复制 `DATABASE_URL`

### 2. 在本地设置环境变量

创建 `.env` 文件（或临时设置）：

```bash
DATABASE_URL=你的数据库连接字符串
```

### 3. 运行初始化脚本

```bash
cd backend
npx ts-node ../scripts/init-vercel-db.ts
```

## 方法二：使用数据库管理工具

### 1. 连接到 Vercel PostgreSQL

使用 Vercel 提供的数据库连接信息，通过以下工具连接：

- **pgAdmin** (https://www.pgadmin.org/)
- **TablePlus** (https://tableplus.com/)
- **DBeaver** (https://dbeaver.io/)

### 2. 执行 SQL 脚本

运行以下 SQL 脚本创建表结构：

```sql
-- 用户表
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  email VARCHAR(100) UNIQUE,
  phone VARCHAR(20),
  avatar VARCHAR(255),
  role VARCHAR(20) DEFAULT 'user',
  status VARCHAR(20) DEFAULT 'active',
  last_login_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP
);

-- 商品分类表
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  slug VARCHAR(50) UNIQUE NOT NULL,
  parent_id INTEGER REFERENCES categories(id),
  icon VARCHAR(100),
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP
);

-- 商品表
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  slug VARCHAR(200) UNIQUE NOT NULL,
  description TEXT,
  category_id INTEGER REFERENCES categories(id),
  price DECIMAL(10, 2) NOT NULL,
  original_price DECIMAL(10, 2),
  stock INTEGER DEFAULT 0,
  sales INTEGER DEFAULT 0,
  images TEXT[],
  main_image VARCHAR(255),
  status VARCHAR(20) DEFAULT 'active',
  is_featured BOOLEAN DEFAULT false,
  is_hot BOOLEAN DEFAULT false,
  is_new BOOLEAN DEFAULT false,
  tags TEXT[],
  specifications JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP
);

-- 订单表
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  order_no VARCHAR(50) UNIQUE NOT NULL,
  user_id INTEGER REFERENCES users(id),
  total_amount DECIMAL(10, 2) NOT NULL,
  discount_amount DECIMAL(10, 2) DEFAULT 0,
  final_amount DECIMAL(10, 2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  payment_status VARCHAR(20) DEFAULT 'unpaid',
  payment_method VARCHAR(50),
  shipping_address JSONB,
  shipping_fee DECIMAL(10, 2) DEFAULT 0,
  remark TEXT,
  paid_at TIMESTAMP,
  shipped_at TIMESTAMP,
  completed_at TIMESTAMP,
  cancelled_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP
);

-- 订单商品表
CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(id),
  product_name VARCHAR(200),
  product_image VARCHAR(255),
  price DECIMAL(10, 2) NOT NULL,
  quantity INTEGER NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 购物车表
CREATE TABLE IF NOT EXISTS cart_items (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, product_id)
);

-- 收货地址表
CREATE TABLE IF NOT EXISTS addresses (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  receiver_name VARCHAR(50) NOT NULL,
  receiver_phone VARCHAR(20) NOT NULL,
  province VARCHAR(50) NOT NULL,
  city VARCHAR(50) NOT NULL,
  district VARCHAR(50) NOT NULL,
  detail VARCHAR(200) NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);

-- 插入初始分类
INSERT INTO categories (name, slug, icon, sort_order)
VALUES
  ('宠物食品', 'pet-food', '🍖', 1),
  ('狗粮', 'dog-food', '🐕', 2),
  ('猫粮', 'cat-food', '🐈', 3),
  ('零食', 'snacks', '🦴', 4)
ON CONFLICT (slug) DO NOTHING;

-- 创建管理员账号 (密码: admin123)
INSERT INTO users (username, password, email, role, status)
VALUES (
  'admin',
  '$2a$10$xN5cW.YYOqnZp3YZlEq3NOE4eDrjwOLHqjJ3Kz0pYvMqLqJp5tQy.',
  'admin@example.com',
  'admin',
  'active'
)
ON CONFLICT (username) DO NOTHING;
```

## 方法三：使用 Vercel CLI

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录
vercel login

# 连接到项目
vercel link

# 拉取环境变量
vercel env pull

# 本地运行初始化脚本
cd backend
npx ts-node ../scripts/init-vercel-db.ts
```

## 验证数据库

初始化完成后，你可以：

1. 访问你的网站 `https://ski-row.cn/shop` 查看商品列表
2. 使用管理员账号登录：
   - 用户名: `admin`
   - 密码: `admin123`

## 添加测试商品数据

如果需要添加测试商品，可以在本地运行：

```bash
cd backend
npx ts-node scripts/add-more-products.ts
```

或者使用 SQL 直接插入：

```sql
INSERT INTO products (name, slug, description, category_id, price, original_price, stock, main_image, status, is_featured)
VALUES
  ('优质狗粮 10kg', 'premium-dog-food-10kg', '进口原料，营养均衡', 2, 299.00, 399.00, 100, 'https://example.com/dog-food.jpg', 'active', true),
  ('鸡肉猫粮 5kg', 'chicken-cat-food-5kg', '新鲜鸡肉制作，适合成猫', 3, 189.00, 229.00, 150, 'https://example.com/cat-food.jpg', 'active', true);
```

## 故障排查

### 连接超时

如果连接超时，请检查：

1. Vercel 数据库的 IP 白名单设置
2. 数据库连接字符串是否正确
3. SSL 配置是否启用

### 权限错误

确保数据库用户有创建表的权限：

```sql
GRANT ALL PRIVILEGES ON DATABASE your_database TO your_user;
```

### 查看现有表

```sql
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public';
```
