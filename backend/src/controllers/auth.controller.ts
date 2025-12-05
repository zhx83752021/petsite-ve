import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models';
import { logger } from '../utils/logger';

// 临时存储验证码（开发环境使用，生产环境应使用Redis）
const codeStorage = new Map<string, { code: string; expires: number }>();

/**
 * 用户认证控制器
 */
export class AuthController {
  /**
   * 用户注册
   */
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { username, phone, password, code } = req.body;

      // 验证必填字段
      if (!username || !phone || !password || !code) {
        return res.status(400).json({
          code: 400,
          message: '请填写完整信息',
        });
      }

      // 验证验证码
      const storedCode = codeStorage.get(phone);
      if (!storedCode) {
        return res.status(400).json({
          code: 400,
          message: '请先获取验证码',
        });
      }

      // 检查验证码是否过期
      if (Date.now() > storedCode.expires) {
        codeStorage.delete(phone);
        return res.status(400).json({
          code: 400,
          message: '验证码已过期，请重新获取',
        });
      }

      // 验证验证码是否正确
      if (code !== storedCode.code) {
        return res.status(400).json({
          code: 400,
          message: '验证码错误',
        });
      }

      // 验证码使用后删除
      codeStorage.delete(phone);

      // 检查用户名是否已存在
      const existingUsername = await User.findOne({ where: { username } });
      if (existingUsername) {
        return res.status(400).json({
          code: 400,
          message: '用户名已被使用',
        });
      }

      // 检查手机号是否已存在
      const existingPhone = await User.findOne({ where: { phone } });
      if (existingPhone) {
        return res.status(400).json({
          code: 400,
          message: '手机号已被注册',
        });
      }

      // 密码加密
      const hashedPassword = await bcrypt.hash(password, 10);

      // 创建用户（昵称默认使用用户名）
      const user = await User.create({
        username,
        nickname: username, // 昵称默认使用用户名
        phone,
        password: hashedPassword,
        status: 1,
      });

      // 生成 token
      const token = jwt.sign(
        { id: user.id, username: user.username },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '7d' }
      );

      logger.info(`用户注册成功: ${username}`);

      return res.status(201).json({
        code: 201,
        message: '注册成功',
        data: {
          token,
          id: user.id,
          username: user.username,
          nickname: user.nickname,
          avatar: user.avatar,
          phone: user.phone,
        },
      });
    } catch (error) {
      logger.error('用户注册失败:', error);
      return next(error);
    }
  }

  /**
   * 用户登录
   */
  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { username, password } = req.body;

      // 验证必填字段
      if (!username || !password) {
        return res.status(400).json({
          code: 400,
          message: '请输入用户名和密码',
        });
      }

      // 查找用户（支持用户名或手机号登录）
      const user = await User.findOne({
        where: {
          ...(username.includes('@') || /^1[3-9]\d{9}$/.test(username)
            ? { phone: username }
            : { username }),
        },
      });

      if (!user) {
        return res.status(400).json({
          code: 400,
          message: '用户不存在',
        });
      }

      // 验证密码
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(400).json({
          code: 400,
          message: '密码错误',
        });
      }

      // 检查账户状态
      if (user.status !== 1) {
        return res.status(403).json({
          code: 403,
          message: '账户已被禁用',
        });
      }

      // 更新最后登录时间
      await user.update({ lastLoginAt: new Date() });

      // 生成 token
      const token = jwt.sign(
        { id: user.id, username: user.username },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '7d' }
      );

      logger.info(`用户登录成功: ${username}`);

      return res.json({
        code: 200,
        message: '登录成功',
        data: {
          token,
          id: user.id,
          username: user.username,
          nickname: user.nickname,
          avatar: user.avatar,
          phone: user.phone,
        },
      });
    } catch (error) {
      logger.error('用户登录失败:', error);
      return next(error);
    }
  }

  /**
   * 发送验证码
   */
  static async sendCode(req: Request, res: Response, next: NextFunction) {
    try {
      const { phone } = req.body;

      // 验证手机号
      if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
        return res.status(400).json({
          code: 400,
          message: '请输入正确的手机号',
        });
      }

      // 生成6位数验证码
      const code = Math.random().toString().slice(2, 8);

      // 存储验证码，设置5分钟过期
      const expires = Date.now() + 5 * 60 * 1000; // 5分钟
      codeStorage.set(phone, { code, expires });

      // TODO: 实际项目中应该调用短信服务发送验证码
      logger.info(`发送验证码到 ${phone}: ${code} (${new Date(expires).toLocaleString()}过期)`);

      return res.json({
        code: 200,
        message: '验证码已发送',
        data: {
          // 开发环境返回验证码，生产环境不返回
          ...(process.env.NODE_ENV === 'development' && { code }),
        },
      });
    } catch (error) {
      logger.error('发送验证码失败:', error);
      return next(error);
    }
  }

  /**
   * 获取当前用户信息
   */
  static async getCurrentUser(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;

      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({
          code: 404,
          message: '用户不存在',
        });
      }

      return res.json({
        code: 200,
        message: '获取成功',
        data: user.getSafeInfo(),
      });
    } catch (error) {
      logger.error('获取用户信息失败:', error);
      return next(error);
    }
  }

  /**
   * 更新用户信息
   */
  static async updateUserInfo(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const { nickname, avatar, email, gender, birthday, signature } = req.body;

      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({
          code: 404,
          message: '用户不存在',
        });
      }

      await user.update({
        ...(nickname && { nickname }),
        ...(avatar && { avatar }),
        ...(email && { email }),
        ...(gender && { gender }),
        ...(birthday && { birthday }),
        ...(signature && { signature }),
      });

      logger.info(`用户 ${userId} 更新信息成功`);

      return res.json({
        code: 200,
        message: '更新成功',
        data: user.getSafeInfo(),
      });
    } catch (error) {
      logger.error('更新用户信息失败:', error);
      return next(error);
    }
  }

  /**
   * 修改密码
   */
  static async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const { oldPassword, newPassword } = req.body;

      if (!oldPassword || !newPassword) {
        return res.status(400).json({
          code: 400,
          message: '请输入旧密码和新密码',
        });
      }

      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({
          code: 404,
          message: '用户不存在',
        });
      }

      // 验证旧密码
      const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
      if (!isPasswordValid) {
        return res.status(400).json({
          code: 400,
          message: '旧密码错误',
        });
      }

      // 加密新密码
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await user.update({ password: hashedPassword });

      logger.info(`用户 ${userId} 修改密码成功`);

      return res.json({
        code: 200,
        message: '密码修改成功',
      });
    } catch (error) {
      logger.error('修改密码失败:', error);
      return next(error);
    }
  }
}
