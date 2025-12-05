import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import Product from './Product';
import ProductSku from './ProductSku';

/**
 * 购物车项属性接口
 */
interface CartItemAttributes {
  id: number;
  userId: number;
  productId: number;
  skuId?: number;
  quantity: number;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * 购物车项创建属性接口
 */
interface CartItemCreationAttributes
  extends Optional<CartItemAttributes, 'id' | 'skuId' | 'quantity'> {}

/**
 * 购物车项模型
 */
class CartItem
  extends Model<CartItemAttributes, CartItemCreationAttributes>
  implements CartItemAttributes
{
  public id!: number;
  public userId!: number;
  public productId!: number;
  public skuId?: number;
  public quantity!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // 关联的商品信息
  public readonly product?: Product;
  public readonly sku?: ProductSku;
}

CartItem.init(
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
      comment: '购物车项ID',
    },
    userId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      field: 'user_id',
      comment: '用户ID',
    },
    productId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      field: 'product_id',
      comment: '商品ID',
    },
    skuId: {
      type: DataTypes.BIGINT,
      allowNull: true,
      field: 'sku_id',
      comment: '规格ID',
      references: undefined, // 暂时不使用外键约束
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      comment: '数量',
    },
  },
  {
    sequelize,
    tableName: 'cart_items',
    modelName: 'CartItem',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['user_id'],
      },
      {
        fields: ['product_id'],
      },
      {
        unique: true,
        fields: ['user_id', 'product_id', 'sku_id'],
        name: 'unique_cart_item',
      },
    ],
  }
);

export default CartItem;
