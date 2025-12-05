import { Product, ProductSku } from '../src/models';
import sequelize from '../src/config/database';

async function checkProducts() {
  try {
    await sequelize.authenticate();
    console.log('数据库连接成功');

    // 查询所有商品
    const products = await Product.findAll({
      attributes: ['id', 'name', 'status'],
      order: [['id', 'ASC']],
      limit: 10,
    });

    console.log('\n=== 商品列表 ===');
    if (products.length === 0) {
      console.log('数据库中没有商品数据');
    } else {
      products.forEach((product) => {
        console.log(`ID: ${product.id}, 名称: ${product.name}, 状态: ${product.status}`);
      });
    }

    // 查询商品3的详细信息
    console.log('\n=== 商品ID=3的详细信息 ===');
    const product3 = await Product.findByPk(3);
    if (product3) {
      console.log('商品存在:', JSON.stringify(product3, null, 2));

      // 查询SKU
      const skus = await ProductSku.findAll({
        where: { productId: 3 },
      });
      console.log(`\n该商品有 ${skus.length} 个SKU`);
      skus.forEach((sku) => {
        console.log(`SKU ID: ${sku.id}, 规格: ${sku.specCombination}, 价格: ${sku.price}, 库存: ${sku.stock}`);
      });
    } else {
      console.log('商品ID=3不存在');
    }

    await sequelize.close();
  } catch (error) {
    console.error('错误:', error);
    process.exit(1);
  }
}

checkProducts();
