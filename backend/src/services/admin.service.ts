import { Op } from 'sequelize';
import { Admin } from '../models';
import { CryptoUtil } from '../utils/crypto';
import { JWTUtil } from '../config/jwt';
import { PaginationParams, PaginatedResponse } from '../types';

/**
 * 管理员服务层
 */
export class AdminService {
  /**
   * 管理员登录
   */
  static async login(username: string, password: string): Promise<{
    admin: any;
    token: string;
  }> {
    const admin = await Admin.findOne({ where: { username } });

    if (!admin) {
      throw new Error('用户名或密码错误');
    }

    if (admin.status !== 1) {
      throw new Error('账号已被禁用');
    }

    const isPasswordValid = await CryptoUtil.comparePassword(password, admin.password);

    if (!isPasswordValid) {
      throw new Error('用户名或密码错误');
    }

    // 更新最后登录时间
    await admin.update({ lastLoginAt: new Date() });

    // 生成 Token
    const token = JWTUtil.generateToken({
      userId: String(admin.id),
      username: admin.username,
      role: 'admin',
    });

    return {
      admin: admin.getSafeInfo(),
      token,
    };
  }

  /**
   * 获取管理员列表
   */
  static async getList(
    params: PaginationParams & {
      keyword?: string;
      status?: number;
    }
  ): Promise<PaginatedResponse<any>> {
    const { page = 1, pageSize = 20, keyword, status } = params;
    const offset = (page - 1) * pageSize;

    const where: any = {};

    if (keyword) {
      where[Op.or] = [
        { username: { [Op.like]: `%${keyword}%` } },
        { realName: { [Op.like]: `%${keyword}%` } },
      ];
    }

    if (status !== undefined) {
      where.status = status;
    }

    const { count, rows } = await Admin.findAndCountAll({
      where,
      offset,
      limit: pageSize,
      order: [['createdAt', 'DESC']],
      attributes: { exclude: ['password'] },
    });

    return {
      items: rows.map((admin) => admin.toJSON()),
      pagination: {
        page,
        pageSize,
        total: count,
        totalPages: Math.ceil(count / pageSize),
      },
    };
  }

  /**
   * 创建管理员
   */
  static async create(data: {
    username: string;
    password: string;
    realName: string;
    email?: string;
    phone?: string;
  }): Promise<any> {
    // 检查用户名是否已存在
    const existingAdmin = await Admin.findOne({ where: { username: data.username } });
    if (existingAdmin) {
      throw new Error('用户名已存在');
    }

    // 密码加密
    const hashedPassword = await CryptoUtil.hashPassword(data.password);

    const admin = await Admin.create({
      ...data,
      password: hashedPassword,
      status: 1,
    });

    return admin.getSafeInfo();
  }

  /**
   * 更新管理员
   */
  static async update(
    id: number,
    data: {
      realName?: string;
      email?: string;
      phone?: string;
      status?: number;
    }
  ): Promise<any> {
    const admin = await Admin.findByPk(id);

    if (!admin) {
      throw new Error('管理员不存在');
    }

    await admin.update(data);

    return admin.getSafeInfo();
  }

  /**
   * 重置密码
   */
  static async resetPassword(id: number, newPassword: string): Promise<void> {
    const admin = await Admin.findByPk(id);

    if (!admin) {
      throw new Error('管理员不存在');
    }

    const hashedPassword = await CryptoUtil.hashPassword(newPassword);
    await admin.update({ password: hashedPassword });
  }

  /**
   * 删除管理员
   */
  static async delete(id: number): Promise<void> {
    const admin = await Admin.findByPk(id);

    if (!admin) {
      throw new Error('管理员不存在');
    }

    await admin.destroy();
  }
}
