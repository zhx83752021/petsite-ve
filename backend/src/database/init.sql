-- 宠物网数据库初始化脚本 (PostgreSQL)

-- 创建数据库
-- CREATE DATABASE pet_web WITH ENCODING 'UTF8';

-- 连接到数据库后执行以下命令
-- \c pet_web

-- 创建管理员表
CREATE TABLE IF NOT EXISTS admins (
  id BIGSERIAL PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  real_name VARCHAR(50) NOT NULL,
  email VARCHAR(100) DEFAULT NULL,
  phone VARCHAR(20) DEFAULT NULL,
  avatar VARCHAR(255) DEFAULT NULL,
  status SMALLINT NOT NULL DEFAULT 1,
  last_login_at TIMESTAMP DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP DEFAULT NULL
);

-- 创建注释
COMMENT ON TABLE admins IS '管理员表';
COMMENT ON COLUMN admins.id IS '管理员ID';
COMMENT ON COLUMN admins.username IS '账号';
COMMENT ON COLUMN admins.password IS '密码(加密)';
COMMENT ON COLUMN admins.real_name IS '真实姓名';
COMMENT ON COLUMN admins.email IS '邮箱';
COMMENT ON COLUMN admins.phone IS '手机号';
COMMENT ON COLUMN admins.avatar IS '头像URL';
COMMENT ON COLUMN admins.status IS '状态:1正常2禁用';
COMMENT ON COLUMN admins.last_login_at IS '最后登录时间';
COMMENT ON COLUMN admins.created_at IS '创建时间';
COMMENT ON COLUMN admins.updated_at IS '更新时间';
COMMENT ON COLUMN admins.deleted_at IS '删除时间';

-- 创建触发器自动更新 updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_admins_updated_at
BEFORE UPDATE ON admins
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- 插入默认管理员（密码: admin123）
-- INSERT INTO admins (username, password, real_name, email, status) VALUES
-- ('admin', '$2a$10$X7wXQXJHF4lXk4LqPXXXXekM3w8oLmPVLmPVLmPVLmPVLmPVLm', '超级管理员', 'admin@petshop.com', 1);

-- 注意：上面的密码哈希是示例，实际使用时需要通过 bcrypt 生成真实的哈希值
-- 推荐使用脚本创建管理员账号: npx ts-node scripts/create-admin.ts

-- 创建用户表
CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  nickname VARCHAR(50),
  email VARCHAR(100),
  phone VARCHAR(20),
  avatar VARCHAR(255),
  status SMALLINT NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP DEFAULT NULL
);

COMMENT ON TABLE users IS '用户表';
COMMENT ON COLUMN users.id IS '用户ID';
COMMENT ON COLUMN users.username IS '用户名';
COMMENT ON COLUMN users.password IS '密码(加密)';
COMMENT ON COLUMN users.nickname IS '昵称';
COMMENT ON COLUMN users.email IS '邮箱';
COMMENT ON COLUMN users.phone IS '手机号';
COMMENT ON COLUMN users.avatar IS '头像URL';
COMMENT ON COLUMN users.status IS '状态:1正常2禁用';
COMMENT ON COLUMN users.created_at IS '创建时间';
COMMENT ON COLUMN users.updated_at IS '更新时间';
COMMENT ON COLUMN users.deleted_at IS '删除时间';

CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- 创建商品表
CREATE TABLE IF NOT EXISTS products (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  original_price DECIMAL(10, 2),
  stock INTEGER NOT NULL DEFAULT 0,
  sales INTEGER NOT NULL DEFAULT 0,
  image VARCHAR(255),
  images TEXT[],
  category_id BIGINT,
  brand_id BIGINT,
  status SMALLINT NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP DEFAULT NULL
);

COMMENT ON TABLE products IS '商品表';
COMMENT ON COLUMN products.id IS '商品ID';
COMMENT ON COLUMN products.name IS '商品名称';
COMMENT ON COLUMN products.description IS '商品描述';
COMMENT ON COLUMN products.price IS '售价';
COMMENT ON COLUMN products.original_price IS '原价';
COMMENT ON COLUMN products.stock IS '库存';
COMMENT ON COLUMN products.sales IS '销量';
COMMENT ON COLUMN products.image IS '主图';
COMMENT ON COLUMN products.images IS '商品图片';
COMMENT ON COLUMN products.category_id IS '分类ID';
COMMENT ON COLUMN products.brand_id IS '品牌ID';
COMMENT ON COLUMN products.status IS '状态:1上架2下架';
COMMENT ON COLUMN products.created_at IS '创建时间';
COMMENT ON COLUMN products.updated_at IS '更新时间';
COMMENT ON COLUMN products.deleted_at IS '删除时间';

CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON products
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- 购物车表由 Sequelize 自动创建，不需要在这里定义
