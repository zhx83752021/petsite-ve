import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

/**
 * 订单属性接口
 */
interface OrderAttributes {
  id: number;
  orderNo: string;
  userId: number;
  totalAmount: number;
  discountAmount: number;
  shippingAmount: number;
  payAmount: number;
  payMethod?: number;
  payStatus: number;
  payTime?: Date;
  orderStatus: number;
  remark?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * 订单创建属性接口
 */
interface OrderCreationAttributes
  extends Optional<
    OrderAttributes,
    'id' | 'discountAmount' | 'shippingAmount' | 'payStatus' | 'orderStatus'
  > {}

/**
 * 订单模型
 */
class Order extends Model<OrderAttributes, OrderCreationAttributes> implements OrderAttributes {
  public id!: number;
  public orderNo!: string;
  public userId!: number;
  public totalAmount!: number;
  public discountAmount!: number;
  public shippingAmount!: number;
  public payAmount!: number;
  public payMethod?: number;
  public payStatus!: number;
  public payTime?: Date;
  public orderStatus!: number;
  public remark?: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Order.init(
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
      comment: '订单ID',
    },
    orderNo: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      field: 'order_no',
      comment: '订单号',
    },
    userId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      field: 'user_id',
      comment: '用户ID',
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      field: 'total_amount',
      comment: '商品总额',
    },
    discountAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.0,
      field: 'discount_amount',
      comment: '优惠金额',
    },
    shippingAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.0,
      field: 'shipping_amount',
      comment: '运费',
    },
    payAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      field: 'pay_amount',
      comment: '实付金额',
    },
    payMethod: {
      type: DataTypes.SMALLINT,
      allowNull: true,
      field: 'pay_method',
      comment: '支付方式:1在线2货到付款',
    },
    payStatus: {
      type: DataTypes.SMALLINT,
      allowNull: false,
      defaultValue: 1,
      field: 'pay_status',
      comment: '支付状态:1未支付2已支付3已退款',
    },
    payTime: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'pay_time',
      comment: '支付时间',
    },
    orderStatus: {
      type: DataTypes.SMALLINT,
      allowNull: false,
      defaultValue: 1,
      field: 'order_status',
      comment: '订单状态:1待付款2待发货3已发货4已完成5已取消',
    },
    remark: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: '备注',
    },
  },
  {
    sequelize,
    tableName: 'orders',
    modelName: 'Order',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['order_no'],
      },
      {
        fields: ['user_id'],
      },
      {
        fields: ['order_status'],
      },
      {
        fields: ['created_at'],
      },
    ],
  }
);

export default Order;
