import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

/**
 * 商品属性接口
 */
interface ProductAttributes {
  id: number;
  categoryId: number;
  brandId?: number;
  name: string;
  subtitle?: string;
  mainImages: string[];
  detail: string;
  petType?: number;
  ageRange?: string;
  ingredients?: string;
  attributes?: Record<string, any>;
  sales: number;
  views: number;
  status: number;
  seoTitle?: string;
  seoKeywords?: string;
  seoDescription?: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

/**
 * 商品创建属性接口
 */
interface ProductCreationAttributes
  extends Optional<ProductAttributes, 'id' | 'sales' | 'views' | 'status'> {}

/**
 * 商品模型
 */
class Product
  extends Model<ProductAttributes, ProductCreationAttributes>
  implements ProductAttributes
{
  public id!: number;
  public categoryId!: number;
  public brandId?: number;
  public name!: string;
  public subtitle?: string;
  public mainImages!: string[];
  public detail!: string;
  public petType?: number;
  public ageRange?: string;
  public ingredients?: string;
  public attributes?: Record<string, any>;
  public sales!: number;
  public views!: number;
  public status!: number;
  public seoTitle?: string;
  public seoKeywords?: string;
  public seoDescription?: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readonly deletedAt?: Date;
}

Product.init(
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
      comment: '商品ID',
    },
    categoryId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      field: 'category_id',
      comment: '分类ID',
    },
    brandId: {
      type: DataTypes.BIGINT,
      allowNull: true,
      field: 'brand_id',
      comment: '品牌ID',
    },
    name: {
      type: DataTypes.STRING(200),
      allowNull: false,
      comment: '商品名称',
    },
    subtitle: {
      type: DataTypes.STRING(200),
      allowNull: true,
      comment: '副标题',
    },
    mainImages: {
      type: DataTypes.JSON,
      allowNull: false,
      field: 'main_images',
      comment: '主图URL数组',
    },
    detail: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: '商品详情',
    },
    petType: {
      type: DataTypes.SMALLINT,
      allowNull: true,
      field: 'pet_type',
      comment: '适用宠物:1犬2猫3其他',
    },
    ageRange: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'age_range',
      comment: '适用年龄',
    },
    ingredients: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '成分配料',
    },
    attributes: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: '商品属性JSON',
    },
    sales: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: '销量',
    },
    views: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: '浏览量',
    },
    status: {
      type: DataTypes.SMALLINT,
      allowNull: false,
      defaultValue: 1,
      comment: '状态:1上架2下架',
    },
    seoTitle: {
      type: DataTypes.STRING(200),
      allowNull: true,
      field: 'seo_title',
      comment: 'SEO标题',
    },
    seoKeywords: {
      type: DataTypes.STRING(200),
      allowNull: true,
      field: 'seo_keywords',
      comment: 'SEO关键词',
    },
    seoDescription: {
      type: DataTypes.STRING(500),
      allowNull: true,
      field: 'seo_description',
      comment: 'SEO描述',
    },
  },
  {
    sequelize,
    tableName: 'products',
    modelName: 'Product',
    timestamps: true,
    paranoid: true,
    underscored: true,
    indexes: [
      {
        fields: ['category_id'],
      },
      {
        fields: ['brand_id'],
      },
      {
        fields: ['status'],
      },
    ],
  }
);

export default Product;
