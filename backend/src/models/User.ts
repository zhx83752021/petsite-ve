import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

/**
 * 用户属性接口
 */
interface UserAttributes {
  id: number;
  username: string;
  password: string;
  nickname: string;
  avatar?: string;
  phone: string;
  email?: string;
  gender?: number;
  birthday?: Date;
  signature?: string;
  status: number;
  lastLoginAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

/**
 * 用户创建属性接口
 */
interface UserCreationAttributes extends Optional<UserAttributes, 'id'> {}

/**
 * 用户模型
 */
class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: number;
  public username!: string;
  public password!: string;
  public nickname!: string;
  public avatar?: string;
  public phone!: string;
  public email?: string;
  public gender?: number;
  public birthday?: Date;
  public signature?: string;
  public status!: number;
  public lastLoginAt?: Date;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readonly deletedAt?: Date;

  /**
   * 获取安全的用户信息（不包含密码）
   */
  public getSafeInfo() {
    const { password, ...safeInfo } = this.toJSON();
    return safeInfo;
  }
}

User.init(
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
      comment: '用户ID',
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      comment: '用户名',
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: '密码(加密)',
    },
    nickname: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: '昵称',
    },
    avatar: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: '头像URL',
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
      comment: '手机号',
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: '邮箱',
    },
    gender: {
      type: DataTypes.SMALLINT,
      allowNull: true,
      comment: '性别:1男2女',
    },
    birthday: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: '生日',
    },
    signature: {
      type: DataTypes.STRING(200),
      allowNull: true,
      comment: '个性签名',
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
    tableName: 'users',
    modelName: 'User',
    timestamps: true,
    paranoid: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['username'],
      },
      {
        unique: true,
        fields: ['phone'],
      },
      {
        fields: ['created_at'],
      },
    ],
  }
);

export default User;
