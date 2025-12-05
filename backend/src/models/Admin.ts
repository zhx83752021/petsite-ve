import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

/**
 * 管理员属性接口
 */
interface AdminAttributes {
  id: number;
  username: string;
  password: string;
  realName: string;
  email?: string;
  phone?: string;
  avatar?: string;
  status: number;
  lastLoginAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

/**
 * 管理员创建属性接口
 */
interface AdminCreationAttributes extends Optional<AdminAttributes, 'id'> {}

/**
 * 管理员模型
 */
class Admin extends Model<AdminAttributes, AdminCreationAttributes> implements AdminAttributes {
  public id!: number;
  public username!: string;
  public password!: string;
  public realName!: string;
  public email?: string;
  public phone?: string;
  public avatar?: string;
  public status!: number;
  public lastLoginAt?: Date;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readonly deletedAt?: Date;

  /**
   * 获取安全的管理员信息（不包含密码）
   */
  public getSafeInfo() {
    const { password, ...safeInfo } = this.toJSON();
    return safeInfo;
  }
}

Admin.init(
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
      comment: '管理员ID',
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      comment: '账号',
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: '密码(加密)',
    },
    realName: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: 'real_name',
      comment: '真实姓名',
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: '邮箱',
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: '手机号',
    },
    avatar: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: '头像URL',
    },
    status: {
      type: DataTypes.SMALLINT,
      allowNull: false,
      defaultValue: 1,
      comment: '状态:1正常2禁用',
    },
    lastLoginAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'last_login_at',
      comment: '最后登录时间',
    },
  },
  {
    sequelize,
    tableName: 'admins',
    modelName: 'Admin',
    timestamps: true,
    paranoid: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['username'],
      },
    ],
  }
);

export default Admin;
