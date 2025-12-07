/**
 * 重建数据库 - 删除所有表并重新创建
 */
import { Client } from 'pg';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ 错误: 未找到 DATABASE_URL 环境变量');
  process.exit(1);
}

async function rebuildDatabase() {
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  });

  try {
    await client.connect();
    console.log('✅ 数据库连接成功\n');

    console.log('⚠️  正在删除所有表...');

    // 按照依赖关系删除表
    await client.query('DROP TABLE IF EXISTS order_items CASCADE;');
    await client.query('DROP TABLE IF EXISTS orders CASCADE;');
    await client.query('DROP TABLE IF EXISTS cart_items CASCADE;');
    await client.query('DROP TABLE IF EXISTS addresses CASCADE;');
    await client.query('DROP TABLE IF EXISTS product_skus CASCADE;');
    await client.query('DROP TABLE IF EXISTS products CASCADE;');
    await client.query('DROP TABLE IF EXISTS categories CASCADE;');
    await client.query('DROP TABLE IF EXISTS users CASCADE;');

    console.log('✓ 所有表已删除\n');
    console.log('现在请运行 init-db-simple.ts 来重新创建表和数据');

  } catch (error) {
    console.error('❌ 操作失败:', error);
    throw error;
  } finally {
    await client.end();
  }
}

rebuildDatabase()
  .then(() => {
    console.log('\n✅ 清理完成');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 错误:', error);
    process.exit(1);
  });
