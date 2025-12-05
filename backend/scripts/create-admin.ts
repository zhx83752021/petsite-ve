/**
 * 创建管理员账号脚本
 * 使用方法: ts-node scripts/create-admin.ts
 */
import dotenv from 'dotenv';
import { Admin } from '../src/models';
import { CryptoUtil } from '../src/utils/crypto';
import { testConnection } from '../src/config/database';

// 加载环境变量
dotenv.config({ path: '.env.development' });

async function createAdmin() {
  try {
    // 连接数据库
    await testConnection();

    // 管理员信息
    const adminData = {
      username: 'admin',
      password: 'admin123', // 默认密码
      realName: '超级管理员',
      email: 'admin@petshop.com',
      status: 1,
    };

    // 检查是否已存在
    const existingAdmin = await Admin.findOne({ where: { username: adminData.username } });
    if (existingAdmin) {
      console.log('管理员账号已存在');
      process.exit(0);
    }

    // 加密密码
    const hashedPassword = await CryptoUtil.hashPassword(adminData.password);

    // 创建管理员
    const admin = await Admin.create({
      ...adminData,
      password: hashedPassword,
    });

    console.log('管理员创建成功:');
    console.log('用户名:', adminData.username);
    console.log('密码:', adminData.password);
    console.log('请登录后立即修改密码！');

    process.exit(0);
  } catch (error) {
    console.error('创建管理员失败:', error);
    process.exit(1);
  }
}

createAdmin();
