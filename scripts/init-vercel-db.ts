/**
 * Vercel 数据库初始化脚本
 * 用于在部署后初始化数据库表结构和基础数据
 */
import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';

// 加载环境变量
dotenv.config();

// 从命令行参数或环境变量获取数据库连接
const DATABASE_URL = process.env.DATABASE_URL || process.env.POSTGRES_URL;

if (!DATABASE_URL) {
  console.error('❌ 错误: 未找到 DATABASE_URL 或 POSTGRES_URL 环境变量');
  console.log('请设置环境变量或在 .env 文件中配置');
  process.exit(1);
}

console.log('🔌 正在连接数据库...');

const sequelize = new Sequelize(DATABASE_URL, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
  logging: console.log,
});

/**
 * 初始化数据库表结构
 */
async function initDatabase() {
  try {
    // 测试连接
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功');

    // 创建表结构
    console.log('\n📊 开始创建数据库表...');

    // 用户表
    await sequelize.query(`
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
    `);
    console.log('✓ 用户表创建完成');

    // 商品分类表
    await sequelize.query(`
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
    `);
    console.log('✓ 商品分类表创建完成');

    // 商品表
    await sequelize.query(`
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
    `);
    console.log('✓ 商品表创建完成');

    // 订单表
    await sequelize.query(`
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
    `);
    console.log('✓ 订单表创建完成');

    // 订单商品表
    await sequelize.query(`
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
    `);
    console.log('✓ 订单商品表创建完成');

    // 购物车表
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS cart_items (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
        quantity INTEGER NOT NULL DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, product_id)
      );
    `);
    console.log('✓ 购物车表创建完成');

    // 收货地址表
    await sequelize.query(`
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
    `);
    console.log('✓ 收货地址表创建完成');

    // 创建索引
    console.log('\n📑 创建索引...');
    await sequelize.query('CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);');
    await sequelize.query('CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);');
    await sequelize.query('CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);');
    await sequelize.query('CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);');
    await sequelize.query('CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);');
    console.log('✓ 索引创建完成');

    // 插入初始分类数据
    console.log('\n📝 插入初始数据...');
    await sequelize.query(`
      INSERT INTO categories (name, slug, icon, sort_order)
      VALUES
        ('宠物食品', 'pet-food', '🍖', 1),
        ('狗粮', 'dog-food', '🐕', 2),
        ('猫粮', 'cat-food', '🐈', 3),
        ('零食', 'snacks', '🦴', 4)
      ON CONFLICT (slug) DO NOTHING;
    `);
    console.log('✓ 初始分类数据插入完成');

    // 创建测试管理员账号
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('admin123', 10);

    await sequelize.query(`
      INSERT INTO users (username, password, email, role, status)
      VALUES ('admin', :password, 'admin@example.com', 'admin', 'active')
      ON CONFLICT (username) DO NOTHING;
    `, {
      replacements: { password: hashedPassword }
    });
    console.log('✓ 管理员账号创建完成');
    console.log('   用户名: admin');
    console.log('   密码: admin123');

    console.log('\n✅ 数据库初始化完成！');
  } catch (error) {
    console.error('❌ 数据库初始化失败:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// 执行初始化
initDatabase()
  .then(() => {
    console.log('\n🎉 所有操作已完成');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 初始化过程中出现错误:', error);
    process.exit(1);
  });
