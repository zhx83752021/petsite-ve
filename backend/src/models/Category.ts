import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

/**
 * 分类属性接口
 */
interface CategoryAttributes {
  id: number;
  parentId?: number;
  name: string;
  icon?: string;
  sort: number;
  status: number;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * 分类创建属性接口
 */
interface CategoryCreationAttributes extends Optional<CategoryAttributes, 'id' | 'sort' | 'status'> {}

/**
 * 商品分类模型
 */
class Category
  extends Model<CategoryAttributes, CategoryCreationAttributes>
  implements CategoryAttributes
{
  public id!: number;
  public parentId?: number;
  public name!: string;
  public icon?: string;
  public sort!: number;
  public status!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Category.init(
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
      comment: '分类ID',
    },
    parentId: {
      type: DataTypes.BIGINT,
      allowNull: true,
      field: 'parent_id',
      comment: '父分类ID',
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: '分类名称',
    },
    icon: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: '图标',
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
    tableName: 'categories',
    modelName: 'Category',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['parent_id'],
      },
    ],
  }
);

export default Category;
