import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

/**
 * 品牌属性接口
 */
interface BrandAttributes {
  id: number;
  name: string;
  logo?: string;
  description?: string;
  sort: number;
  status: number;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * 品牌创建属性接口
 */
interface BrandCreationAttributes extends Optional<BrandAttributes, 'id' | 'sort' | 'status'> {}

/**
 * 品牌模型
 */
class Brand extends Model<BrandAttributes, BrandCreationAttributes> implements BrandAttributes {
  public id!: number;
  public name!: string;
  public logo?: string;
  public description?: string;
  public sort!: number;
  public status!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Brand.init(
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
      comment: '品牌ID',
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: '品牌名称',
    },
    logo: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: '品牌logo',
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '品牌描述',
    },
    sort: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: '排序',
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
    tableName: 'brands',
    modelName: 'Brand',
    timestamps: true,
    underscored: true,
  }
);

export default Brand;
