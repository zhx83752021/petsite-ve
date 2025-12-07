/**
 * 简化版数据库初始化脚本
 */
import { Client } from 'pg';
import * as bcrypt from 'bcryptjs';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ 错误: 未找到 DATABASE_URL 环境变量');
  process.exit(1);
}

console.log('🔌 正在连接数据库...');

async function initDatabase() {
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  });

  try {
    await client.connect();
    console.log('✅ 数据库连接成功\n');

    // 创建表结构
    console.log('📊 开始创建数据库表...');

    // 用户表
    await client.query(`
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
    await client.query(`
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
    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(200) NOT NULL,
        slug VARCHAR(200),
        subtitle VARCHAR(500),
        detail TEXT,
        main_images TEXT[],
        category_id INTEGER,
        brand_id INTEGER,
        status SMALLINT DEFAULT 1,
        sales INTEGER DEFAULT 0,
        views INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP
      );
    `);
    console.log('✓ 商品表创建完成');

    // 商品SKU表
    await client.query(`
      CREATE TABLE IF NOT EXISTS product_skus (
        id SERIAL PRIMARY KEY,
        product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
        sku_code VARCHAR(100) UNIQUE NOT NULL,
        spec_combination VARCHAR(200),
        price DECIMAL(10, 2) NOT NULL,
        original_price DECIMAL(10, 2),
        stock INTEGER DEFAULT 0,
        status SMALLINT DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✓ 商品SKU表创建完成');

    // 订单表
    await client.query(`
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
    await client.query(`
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
    await client.query(`
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
    await client.query(`
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
    await client.query('CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);');
    await client.query('CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);');
    await client.query('CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);');
    await client.query('CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);');
    await client.query('CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);');
    console.log('✓ 索引创建完成');

    // 插入初始分类数据
    console.log('\n📝 插入初始数据...');
    await client.query(`
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
    const hashedPassword = await bcrypt.hash('admin123', 10);

    await client.query(
      `INSERT INTO users (username, password, email, role, status)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (username) DO NOTHING;`,
      ['admin', hashedPassword, 'admin@example.com', 'admin', 'active']
    );
    console.log('✓ 管理员账号创建完成');
    console.log('   用户名: admin');
    console.log('   密码: admin123');

    // 插入一些测试商品
    console.log('\n🛍️  添加测试商品...');

    // 先删除旧数据（如果存在）
    await client.query('DELETE FROM product_skus;');
    await client.query('DELETE FROM products;');

    // 插入商品1: 优质狗粮
    const product1 = await client.query(`
      INSERT INTO products (name, subtitle, detail, main_images, category_id, status, sales)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id;
    `, [
      '优质狗粮 10kg',
      '进口原料，营养均衡，适合成年犬',
      '<p>精选优质原料，科学配比，全面满足成年犬营养需求。</p>',
      ['https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=400'],
      2,
      1,
      156
    ]);
    await client.query(`
      INSERT INTO product_skus (product_id, sku_code, spec_combination, price, original_price, stock, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7);
    `, [product1.rows[0].id, 'DOG-FOOD-10KG', '10kg装', 299.00, 399.00, 100, 1]);

    // 插入商品2: 鸡肉猫粮
    const product2 = await client.query(`
      INSERT INTO products (name, subtitle, detail, main_images, category_id, status, sales)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id;
    `, [
      '鸡肉猫粮 5kg',
      '新鲜鸡肉制作，适合成猫，营养丰富',
      '<p>精选新鲜鸡肉，低敏配方，呵护猫咪肠胃健康。</p>',
      ['https://images.unsplash.com/photo-1529257414772-1960b7bea4eb?w=400'],
      3,
      1,
      89
    ]);
    await client.query(`
      INSERT INTO product_skus (product_id, sku_code, spec_combination, price, original_price, stock, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7);
    `, [product2.rows[0].id, 'CAT-FOOD-5KG', '5kg装', 189.00, 229.00, 150, 1]);

    // 插入商品3: 牛肉零食条
    const product3 = await client.query(`
      INSERT INTO products (name, subtitle, detail, main_images, category_id, status, sales)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id;
    `, [
      '牛肉零食条 500g',
      '纯天然牛肉制作，无添加剂，狗狗最爱',
      '<p>100%纯牛肉，自然风干，保留营养，是训练和奖励的最佳选择。</p>',
      ['https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400'],
      4,
      1,
      234
    ]);
    await client.query(`
      INSERT INTO product_skus (product_id, sku_code, spec_combination, price, original_price, stock, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7);
    `, [product3.rows[0].id, 'BEEF-SNACK-500G', '500g装', 89.00, 119.00, 200, 1]);

    // 插入商品4: 鱼味猫粮
    const product4 = await client.query(`
      INSERT INTO products (name, subtitle, detail, main_images, category_id, status, sales)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id;
    `, [
      '鱼味猫粮 3kg',
      '深海鱼类制作，Omega-3丰富，毛发亮泽',
      '<p>深海鱼类精华，富含Omega-3，让毛发更加亮泽柔顺。</p>',
      ['https://images.unsplash.com/photo-1425082661705-1834bfd09dca?w=400'],
      3,
      1,
      67
    ]);
    await client.query(`
      INSERT INTO product_skus (product_id, sku_code, spec_combination, price, original_price, stock, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7);
    `, [product4.rows[0].id, 'FISH-CAT-3KG', '3kg装', 159.00, 189.00, 120, 1]);

    // 插入商品5: 幼犬奶粉
    const product5 = await client.query(`
      INSERT INTO products (name, subtitle, detail, main_images, category_id, status, sales)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id;
    `, [
      '幼犬奶粉 400g',
      '专为幼犬设计，富含DHA，促进大脑发育',
      '<p>接近母乳配方，易吸收，为幼犬提供全面营养支持。</p>',
      ['https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400'],
      2,
      1,
      123
    ]);
    await client.query(`
      INSERT INTO product_skus (product_id, sku_code, spec_combination, price, original_price, stock, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7);
    `, [product5.rows[0].id, 'PUPPY-MILK-400G', '400g装', 128.00, 158.00, 80, 1]);

    console.log('✓ 测试商品和SKU数据添加完成');

    console.log('\n✅ 数据库初始化完成！');
    console.log('\n📊 数据统计:');

    const categoryCount = await client.query('SELECT COUNT(*) FROM categories');
    const productCount = await client.query('SELECT COUNT(*) FROM products');
    const userCount = await client.query('SELECT COUNT(*) FROM users');

    console.log(`   - 分类数量: ${categoryCount.rows[0].count}`);
    console.log(`   - 商品数量: ${productCount.rows[0].count}`);
    console.log(`   - 用户数量: ${userCount.rows[0].count}`);

  } catch (error) {
    console.error('❌ 数据库初始化失败:', error);
    throw error;
  } finally {
    await client.end();
  }
}

// 执行初始化
initDatabase()
  .then(() => {
    console.log('\n🎉 所有操作已完成！');
    console.log('\n下一步:');
    console.log('1. 访问 https://ski-row.cn/shop 查看商品');
    console.log('2. 使用 admin/admin123 登录后台');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 初始化过程中出现错误:', error);
    process.exit(1);
  });
