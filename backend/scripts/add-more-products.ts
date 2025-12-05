import { Product, ProductSku, Category, Brand } from '../src/models';
import sequelize from '../src/config/database';

async function addMoreProducts() {
  try {
    await sequelize.authenticate();
    console.log('数据库连接成功');

    // 获取现有的分类和品牌
    const category = await Category.findOne();
    const brand = await Brand.findOne();

    if (!category || !brand) {
      console.log('请先运行 add-test-product.ts 创建分类和品牌');
      process.exit(1);
    }

    // 创建多个测试商品
    const productsData = [
      {
        name: '猫咪自动喂食器',
        subtitle: '智能定时定量，APP远程控制',
        images: [
          'https://images.unsplash.com/photo-1558788353-f76d92427f16?w=800',
          'https://images.unsplash.com/photo-1545249390-6bdfa286032f?w=800',
        ],
        skus: [
          { spec: '标准版', price: 199, originalPrice: 259, stock: 80 },
          { spec: '豪华版', price: 299, originalPrice: 399, stock: 50 },
        ],
      },
      {
        name: '宠物互动玩具球',
        subtitle: '自动滚动，激发宠物玩耍兴趣',
        images: [
          'https://images.unsplash.com/photo-1561037404-61cd46aa615b?w=800',
          'https://images.unsplash.com/photo-1535294435445-d7249524ef2e?w=800',
        ],
        skus: [
          { spec: '小号', price: 69, originalPrice: 99, stock: 150 },
          { spec: '大号', price: 89, originalPrice: 129, stock: 120 },
        ],
      },
      {
        name: '狗狗磨牙棒套装',
        subtitle: '天然牛皮，健康磨牙',
        images: [
          'https://images.unsplash.com/photo-1583511655826-05700dcb1355?w=800',
          'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800',
        ],
        skus: [
          { spec: '10支装', price: 39, originalPrice: 59, stock: 200 },
          { spec: '20支装', price: 69, originalPrice: 99, stock: 150 },
        ],
      },
      {
        name: '渴望成犬粮',
        subtitle: '高蛋白配方，85%动物原料',
        images: [
          'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=800',
          'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=800',
        ],
        skus: [
          { spec: '6kg', price: 299, originalPrice: 399, stock: 60 },
          { spec: '11kg', price: 499, originalPrice: 599, stock: 40 },
        ],
      },
      {
        name: '猫咪自动饮水器',
        subtitle: '循环过滤，鼓励多喝水',
        images: [
          'https://images.unsplash.com/photo-1558788353-f76d92427f16?w=800',
          'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800',
        ],
        skus: [
          { spec: '1.5L', price: 139, originalPrice: 189, stock: 100 },
          { spec: '2.5L', price: 179, originalPrice: 229, stock: 80 },
        ],
      },
      {
        name: '宠物智能项圈',
        subtitle: 'GPS定位，健康监测',
        images: [
          'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=800',
          'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800',
        ],
        skus: [
          { spec: '基础版', price: 299, originalPrice: 399, stock: 50 },
          { spec: '旗舰版', price: 499, originalPrice: 699, stock: 30 },
        ],
      },
    ];

    for (const productData of productsData) {
      console.log(`\n创建商品: ${productData.name}`);

      const product = await Product.create({
        categoryId: category.id,
        brandId: brand.id,
        name: productData.name,
        subtitle: productData.subtitle,
        mainImages: productData.images,
        detail: `
          <h3>产品介绍</h3>
          <p>${productData.subtitle}</p>
          <h3>产品特点</h3>
          <ul>
            <li>优质材料，安全放心</li>
            <li>精心设计，贴合需求</li>
            <li>性价比高，物超所值</li>
          </ul>
        `,
        petType: 1,
        ageRange: '全年龄',
        status: 1,
        sales: Math.floor(Math.random() * 1000),
        views: Math.floor(Math.random() * 5000),
      });

      // 创建SKU
      const skus = productData.skus.map((sku) => ({
        productId: product.id,
        skuCode: `${product.name.substring(0, 3)}-${sku.spec}-${Date.now()}`,
        specCombination: sku.spec,
        price: sku.price,
        originalPrice: sku.originalPrice,
        stock: sku.stock,
        status: 1,
      }));

      await ProductSku.bulkCreate(skus);
      console.log(`✓ 创建成功，ID: ${product.id}，SKU数量: ${skus.length}`);
    }

    console.log('\n\n全部测试商品创建成功！');
    console.log('现在数据库中共有以下商品：');

    const allProducts = await Product.findAll({
      attributes: ['id', 'name'],
      order: [['id', 'ASC']],
    });

    allProducts.forEach((p) => {
      console.log(`ID: ${p.id}, 名称: ${p.name}`);
    });

    await sequelize.close();
  } catch (error) {
    console.error('错误:', error);
    process.exit(1);
  }
}

addMoreProducts();
