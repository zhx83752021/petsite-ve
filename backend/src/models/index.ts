/**
 * 模型导出文件
 */
import User from './User';
import Admin from './Admin';
import Category from './Category';
import Brand from './Brand';
import Product from './Product';
import ProductSku from './ProductSku';
import Order from './Order';
import CartItem from './CartItem';

/**
 * 模型关联关系
 */

// 商品与分类
Product.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });
Category.hasMany(Product, { foreignKey: 'categoryId', as: 'products' });

// 商品与品牌
Product.belongsTo(Brand, { foreignKey: 'brandId', as: 'brand' });
Brand.hasMany(Product, { foreignKey: 'brandId', as: 'products' });

// 商品与SKU
Product.hasMany(ProductSku, { foreignKey: 'productId', as: 'skus' });
ProductSku.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

// 订单与用户
Order.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(Order, { foreignKey: 'userId', as: 'orders' });

// 购物车与用户、商品
CartItem.belongsTo(User, { foreignKey: 'userId', as: 'user', constraints: false });
CartItem.belongsTo(Product, { foreignKey: 'productId', as: 'product', constraints: false });
CartItem.belongsTo(ProductSku, { foreignKey: 'skuId', as: 'sku', constraints: false });
User.hasMany(CartItem, { foreignKey: 'userId', as: 'cartItems', constraints: false });

export { User, Admin, Category, Brand, Product, ProductSku, Order, CartItem };

export default {
  User,
  Admin,
  Category,
  Brand,
  Product,
  ProductSku,
  Order,
  CartItem,
};
