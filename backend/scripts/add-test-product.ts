import { Product, ProductSku, Category, Brand } from '../src/models';
import sequelize from '../src/config/database';

async function addTestProduct() {
  try {
    await sequelize.authenticate();
    console.log('数据库连接成功');

    // 检查分类
    let category = await Category.findOne();
    if (!category) {
      console.log('创建默认分类...');
      category = await Category.create({
        name: '宠物食品',
        parentId: 0,
        level: 1,
        sort: 1,
        status: 1,
      } as any);
    }
    console.log(`使用分类: ${category.name} (ID: ${category.id})`);

    // 检查品牌
    let brand = await Brand.findOne();
    if (!brand) {
      console.log('创建默认品牌...');
      brand = await Brand.create({
        name: '皇家',
        logo: 'https://via.placeholder.com/100',
        description: '知名宠物食品品牌',
        status: 1,
      } as any);
    }
    console.log(`使用品牌: ${brand.name} (ID: ${brand.id})`);

    // 创建测试商品
    console.log('创建测试商品...');
    const product = await Product.create({
      categoryId: category.id,
      brandId: brand.id,
      name: '皇家小型成犬粮',
      subtitle: '专为小型犬设计的营养配方',
      mainImages: [
        'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=800',
        'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=800',
      ],
      detail: `
        <h3>产品介绍</h3>
        <p>皇家小型成犬粮专为1-10岁的小型犬设计,满足其独特的营养需求。</p>
        <h3>产品特点</h3>
        <ul>
          <li>精确营养配方,维持理想体重</li>
          <li>专利颗粒设计,促进咀嚼</li>
          <li>omega-3和omega-6脂肪酸,呵护皮肤健康</li>
          <li>高适口性,挑食狗狗也爱吃</li>
        </ul>
      `,
      petType: 1,
      ageRange: '成年',
      status: 1,
      sales: 0,
      views: 0,
    });

    console.log(`商品创建成功，ID: ${product.id}`);

    // 创建SKU
    console.log('创建商品SKU...');
    const skus = [
      {
        productId: product.id,
        skuCode: `DOG-FOOD-2KG-${Date.now()}`,
        specCombination: '2kg',
        price: 89,
        originalPrice: 119,
        stock: 100,
        status: 1,
      },
      {
        productId: product.id,
        skuCode: `DOG-FOOD-8KG-${Date.now()}`,
        specCombination: '8kg',
        price: 299,
        originalPrice: 399,
        stock: 50,
        status: 1,
      },
      {
        productId: product.id,
        skuCode: `DOG-FOOD-15KG-${Date.now()}`,
        specCombination: '15kg',
        price: 499,
        originalPrice: 599,
        stock: 30,
        status: 1,
      },
    ];

    await ProductSku.bulkCreate(skus);
    console.log(`创建了 ${skus.length} 个SKU`);

    console.log('\n测试商品添加成功！');
    console.log(`商品ID: ${product.id}`);
    console.log(`访问地址: http://localhost:5173/product/${product.id}`);

    await sequelize.close();
  } catch (error) {
    console.error('错误:', error);
    process.exit(1);
  }
}

addTestProduct();
