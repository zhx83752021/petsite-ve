import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

/**
 * SKU属性接口
 */
interface ProductSkuAttributes {
  id: number;
  productId: number;
  skuCode: string;
  specCombination: string;
  price: number;
  originalPrice?: number;
  stock: number;
  weight?: number;
  status: number;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * SKU创建属性接口
 */
interface ProductSkuCreationAttributes extends Optional<ProductSkuAttributes, 'id' | 'status'> {}

/**
 * 商品SKU模型
 */
class ProductSku
  extends Model<ProductSkuAttributes, ProductSkuCreationAttributes>
  implements ProductSkuAttributes
{
  public id!: number;
  public productId!: number;
  public skuCode!: string;
  public specCombination!: string;
  public price!: number;
  public originalPrice?: number;
  public stock!: number;
  public weight?: number;
  public status!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

ProductSku.init(
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
      comment: 'SKU ID',
    },
    productId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      field: 'product_id',
      comment: '商品ID',
    },
    skuCode: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      field: 'sku_code',
      comment: 'SKU编码',
    },
    specCombination: {
      type: DataTypes.STRING(200),
      allowNull: false,
      field: 'spec_combination',
      comment: '规格组合',
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: '价格',
    },
    originalPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      field: 'original_price',
      comment: '原价',
    },
    stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: '库存',
    },
    weight: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: '重量(克)',
    },
    status: {
      type: DataTypes.SMALLINT,
      allowNull: false,
      defaultValue: 1,
      comment: '状态:1启用2禁用',
    },
  },
  {
    sequelize,
    tableName: 'product_skus',
    modelName: 'ProductSku',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['sku_code'],
      },
      {
        fields: ['product_id'],
      },
    ],
  }
);

export default ProductSku;
