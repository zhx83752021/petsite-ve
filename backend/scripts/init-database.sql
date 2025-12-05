-- ==========================================
-- 宠物网数据库初始化SQL脚本
-- 适用于 Vercel Postgres
-- ==========================================

-- 1. 用户表 (users)
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    nickname VARCHAR(50) NOT NULL,
    avatar VARCHAR(255),
    phone VARCHAR(20) NOT NULL UNIQUE,
    email VARCHAR(100),
    gender SMALLINT,
    birthday DATE,
    signature VARCHAR(200),
    status SMALLINT NOT NULL DEFAULT 1,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

COMMENT ON TABLE users IS '用户表';
COMMENT ON COLUMN users.id IS '用户ID';
COMMENT ON COLUMN users.username IS '用户名';
COMMENT ON COLUMN users.password IS '密码(加密)';
COMMENT ON COLUMN users.nickname IS '昵称';
COMMENT ON COLUMN users.avatar IS '头像URL';
COMMENT ON COLUMN users.phone IS '手机号';
COMMENT ON COLUMN users.email IS '邮箱';
COMMENT ON COLUMN users.gender IS '性别:1男2女';
COMMENT ON COLUMN users.birthday IS '生日';
COMMENT ON COLUMN users.signature IS '个性签名';
COMMENT ON COLUMN users.status IS '状态:1正常2禁用';
COMMENT ON COLUMN users.last_login_at IS '最后登录时间';

CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- 2. 管理员表 (admins)
CREATE TABLE IF NOT EXISTS admins (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    real_name VARCHAR(50) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(20),
    avatar VARCHAR(255),
    status SMALLINT NOT NULL DEFAULT 1,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

COMMENT ON TABLE admins IS '管理员表';
COMMENT ON COLUMN admins.username IS '账号';
COMMENT ON COLUMN admins.password IS '密码(加密)';
COMMENT ON COLUMN admins.real_name IS '真实姓名';
COMMENT ON COLUMN admins.status IS '状态:1正常2禁用';

CREATE INDEX IF NOT EXISTS idx_admins_username ON admins(username);

-- 3. 分类表 (categories)
CREATE TABLE IF NOT EXISTS categories (
    id BIGSERIAL PRIMARY KEY,
    parent_id BIGINT,
    name VARCHAR(50) NOT NULL,
    icon VARCHAR(255),
    sort INTEGER NOT NULL DEFAULT 0,
    status SMALLINT NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE categories IS '商品分类表';
COMMENT ON COLUMN categories.parent_id IS '父分类ID';
COMMENT ON COLUMN categories.name IS '分类名称';
COMMENT ON COLUMN categories.icon IS '图标';
COMMENT ON COLUMN categories.sort IS '排序';
COMMENT ON COLUMN categories.status IS '状态:1启用2禁用';

CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON categories(parent_id);

-- 4. 品牌表 (brands)
CREATE TABLE IF NOT EXISTS brands (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    logo VARCHAR(255),
    description TEXT,
    sort INTEGER NOT NULL DEFAULT 0,
    status SMALLINT NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE brands IS '品牌表';
COMMENT ON COLUMN brands.name IS '品牌名称';
COMMENT ON COLUMN brands.logo IS '品牌logo';
COMMENT ON COLUMN brands.description IS '品牌描述';
COMMENT ON COLUMN brands.sort IS '排序';
COMMENT ON COLUMN brands.status IS '状态:1启用2禁用';

-- 5. 商品表 (products)
CREATE TABLE IF NOT EXISTS products (
    id BIGSERIAL PRIMARY KEY,
    category_id BIGINT NOT NULL,
    brand_id BIGINT,
    name VARCHAR(200) NOT NULL,
    subtitle VARCHAR(200),
    main_images JSON NOT NULL,
    detail TEXT NOT NULL,
    pet_type SMALLINT,
    age_range VARCHAR(50),
    ingredients TEXT,
    attributes JSON,
    sales INTEGER NOT NULL DEFAULT 0,
    views INTEGER NOT NULL DEFAULT 0,
    status SMALLINT NOT NULL DEFAULT 1,
    seo_title VARCHAR(200),
    seo_keywords VARCHAR(200),
    seo_description VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    FOREIGN KEY (category_id) REFERENCES categories(id),
    FOREIGN KEY (brand_id) REFERENCES brands(id)
);

COMMENT ON TABLE products IS '商品表';
COMMENT ON COLUMN products.category_id IS '分类ID';
COMMENT ON COLUMN products.brand_id IS '品牌ID';
COMMENT ON COLUMN products.name IS '商品名称';
COMMENT ON COLUMN products.subtitle IS '副标题';
COMMENT ON COLUMN products.main_images IS '主图URL数组';
COMMENT ON COLUMN products.detail IS '商品详情';
COMMENT ON COLUMN products.pet_type IS '适用宠物:1犬2猫3其他';
COMMENT ON COLUMN products.age_range IS '适用年龄';
COMMENT ON COLUMN products.ingredients IS '成分配料';
COMMENT ON COLUMN products.attributes IS '商品属性JSON';
COMMENT ON COLUMN products.sales IS '销量';
COMMENT ON COLUMN products.views IS '浏览量';
COMMENT ON COLUMN products.status IS '状态:1上架2下架';

CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_brand_id ON products(brand_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);

-- 6. 商品SKU表 (product_skus)
CREATE TABLE IF NOT EXISTS product_skus (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL,
    sku_name VARCHAR(100) NOT NULL,
    sku_attributes JSON,
    price DECIMAL(10, 2) NOT NULL,
    original_price DECIMAL(10, 2),
    cost_price DECIMAL(10, 2),
    stock INTEGER NOT NULL DEFAULT 0,
    sku_code VARCHAR(100),
    status SMALLINT NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

COMMENT ON TABLE product_skus IS '商品SKU表';
COMMENT ON COLUMN product_skus.product_id IS '商品ID';
COMMENT ON COLUMN product_skus.sku_name IS 'SKU名称';
COMMENT ON COLUMN product_skus.sku_attributes IS 'SKU属性JSON';
COMMENT ON COLUMN product_skus.price IS '销售价格';
COMMENT ON COLUMN product_skus.original_price IS '原价';
COMMENT ON COLUMN product_skus.cost_price IS '成本价';
COMMENT ON COLUMN product_skus.stock IS '库存';
COMMENT ON COLUMN product_skus.sku_code IS 'SKU编码';
COMMENT ON COLUMN product_skus.status IS '状态:1上架2下架';

CREATE INDEX IF NOT EXISTS idx_product_skus_product_id ON product_skus(product_id);

-- 7. 订单表 (orders)
CREATE TABLE IF NOT EXISTS orders (
    id BIGSERIAL PRIMARY KEY,
    order_no VARCHAR(50) NOT NULL UNIQUE,
    user_id BIGINT NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    discount_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    shipping_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    pay_amount DECIMAL(10, 2) NOT NULL,
    pay_method SMALLINT,
    pay_status SMALLINT NOT NULL DEFAULT 0,
    pay_time TIMESTAMP WITH TIME ZONE,
    order_status SMALLINT NOT NULL DEFAULT 0,
    remark TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

COMMENT ON TABLE orders IS '订单表';
COMMENT ON COLUMN orders.order_no IS '订单号';
COMMENT ON COLUMN orders.user_id IS '用户ID';
COMMENT ON COLUMN orders.total_amount IS '商品总额';
COMMENT ON COLUMN orders.discount_amount IS '优惠金额';
COMMENT ON COLUMN orders.shipping_amount IS '运费';
COMMENT ON COLUMN orders.pay_amount IS '实付金额';
COMMENT ON COLUMN orders.pay_method IS '支付方式:1微信2支付宝';
COMMENT ON COLUMN orders.pay_status IS '支付状态:0未支付1已支付';
COMMENT ON COLUMN orders.pay_time IS '支付时间';
COMMENT ON COLUMN orders.order_status IS '订单状态:0待支付1待发货2已发货3已完成4已取消';
COMMENT ON COLUMN orders.remark IS '备注';

CREATE INDEX IF NOT EXISTS idx_orders_order_no ON orders(order_no);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);

-- 8. 购物车表 (cart_items)
CREATE TABLE IF NOT EXISTS cart_items (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    sku_id BIGINT,
    quantity INTEGER NOT NULL DEFAULT 1,
    checked BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE cart_items IS '购物车表';
COMMENT ON COLUMN cart_items.user_id IS '用户ID';
COMMENT ON COLUMN cart_items.product_id IS '商品ID';
COMMENT ON COLUMN cart_items.sku_id IS 'SKU ID';
COMMENT ON COLUMN cart_items.quantity IS '数量';
COMMENT ON COLUMN cart_items.checked IS '是否选中';

CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_product_id ON cart_items(product_id);

-- ==========================================
-- 初始化数据
-- ==========================================

-- 插入默认管理员 (密码: admin123)
INSERT INTO admins (username, password, real_name, status)
VALUES ('admin', '$2a$10$YQqy2lQxH8P.2fG6Zx9TY.rH4cL5KL3wQ8jv3H5qYzV1xF8H2D3uG', '系统管理员', 1)
ON CONFLICT (username) DO NOTHING;

-- 插入默认分类
INSERT INTO categories (name, sort, status) VALUES
('狗粮', 1, 1),
('猫粮', 2, 1),
('零食', 3, 1),
('玩具', 4, 1),
('用品', 5, 1)
ON CONFLICT DO NOTHING;

-- 插入默认品牌
INSERT INTO brands (name, sort, status) VALUES
('皇家', 1, 1),
('冠能', 2, 1),
('渴望', 3, 1),
('爱肯拿', 4, 1)
ON CONFLICT DO NOTHING;

-- ==========================================
-- 完成
-- ==========================================
