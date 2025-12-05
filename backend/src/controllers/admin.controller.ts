import { Request, Response } from 'express';
import { AdminService } from '../services/admin.service';
import { ResponseUtil } from '../utils/response';
import { logger } from '../utils/logger';

/**
 * 管理员控制器
 */
export class AdminController {
  /**
   * 管理员登录
   */
  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { username, password } = req.body;

      const result = await AdminService.login(username, password);

      ResponseUtil.success(res, result, '登录成功');
    } catch (error: any) {
      logger.error('管理员登录失败:', error);
      ResponseUtil.badRequest(res, error.message);
    }
  }

  /**
   * 获取管理员列表
   */
  static async getList(req: Request, res: Response): Promise<void> {
    try {
      const { page, pageSize, keyword, status } = req.query;

      const result = await AdminService.getList({
        page: page ? Number(page) : 1,
        pageSize: pageSize ? Number(pageSize) : 20,
        keyword: keyword as string,
        status: status ? Number(status) : undefined,
      });

      ResponseUtil.success(res, result);
    } catch (error: any) {
      logger.error('获取管理员列表失败:', error);
      ResponseUtil.internalError(res);
    }
  }

  /**
   * 创建管理员
   */
  static async create(req: Request, res: Response): Promise<void> {
    try {
      const data = req.body;

      const admin = await AdminService.create(data);

      ResponseUtil.created(res, admin);
    } catch (error: any) {
      logger.error('创建管理员失败:', error);
      ResponseUtil.badRequest(res, error.message);
    }
  }

  /**
   * 更新管理员
   */
  static async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const data = req.body;

      const admin = await AdminService.update(Number(id), data);

      ResponseUtil.success(res, admin, '更新成功');
    } catch (error: any) {
      logger.error('更新管理员失败:', error);
      ResponseUtil.badRequest(res, error.message);
    }
  }

  /**
   * 重置密码
   */
  static async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { password } = req.body;

      await AdminService.resetPassword(Number(id), password);

      ResponseUtil.success(res, null, '密码重置成功');
    } catch (error: any) {
      logger.error('重置密码失败:', error);
      ResponseUtil.badRequest(res, error.message);
    }
  }

  /**
   * 删除管理员
   */
  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      await AdminService.delete(Number(id));

      ResponseUtil.success(res, null, '删除成功');
    } catch (error: any) {
      logger.error('删除管理员失败:', error);
      ResponseUtil.badRequest(res, error.message);
    }
  }
}
