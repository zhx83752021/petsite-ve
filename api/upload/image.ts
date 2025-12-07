/**
 * 图片上传 API
 * 支持 Base64 格式上传（简化版）
 * 生产环境建议使用 OSS 或 CDN
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';

// 验证 token（管理员或用户都可以上传）
function getUserFromToken(req: VercelRequest): { id: number; role: string } | null {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
    return { id: decoded.id, role: decoded.role };
  } catch (error) {
    return null;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 设置 CORS 头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(200).json({
      code: 405,
      message: '方法不允许',
      data: null,
    });
  }

  // 验证用户身份
  const user = getUserFromToken(req);
  if (!user) {
    return res.status(200).json({
      code: 401,
      message: '请先登录',
      data: null,
    });
  }

  try {
    const { image, filename } = req.body || {};

    if (!image) {
      return res.status(200).json({
        code: 400,
        message: '图片数据不能为空',
        data: null,
      });
    }

    // 验证是否为 Base64 格式
    const base64Regex = /^data:image\/(jpeg|jpg|png|gif|webp);base64,/;
    if (!base64Regex.test(image)) {
      return res.status(200).json({
        code: 400,
        message: '图片格式不正确，仅支持 jpeg, jpg, png, gif, webp',
        data: null,
      });
    }

    // 检查文件大小（限制5MB）
    const sizeInBytes = (image.length * 3) / 4;
    const sizeInMB = sizeInBytes / (1024 * 1024);
    if (sizeInMB > 5) {
      return res.status(200).json({
        code: 400,
        message: '图片大小不能超过5MB',
        data: null,
      });
    }

    // 提取文件类型
    const typeMatch = image.match(base64Regex);
    const fileType = typeMatch ? typeMatch[1] : 'png';

    // 生成文件名
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const fileName = filename || `upload_${timestamp}_${randomStr}.${fileType}`;

    // 这里是简化版，直接返回 Base64 数据
    // 生产环境应该上传到 OSS/CDN 并返回真实 URL
    const imageUrl = image;

    // 如果有配置云存储服务，可以在这里上传
    // 例如：上传到阿里云 OSS、腾讯云 COS、七牛云等
    // const uploadResult = await uploadToOSS(image, fileName);
    // const imageUrl = uploadResult.url;

    return res.status(200).json({
      code: 200,
      message: '上传成功',
      data: {
        url: imageUrl,
        filename: fileName,
        size: sizeInBytes,
        type: fileType,
      },
    });
  } catch (error: any) {
    console.error('[API] 图片上传失败:', error);

    res.status(200).json({
      code: 500,
      message: error.message || '上传失败',
      data: null,
    });
  }
}

// Vercel Functions 配置
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb', // 允许较大的请求体
    },
  },
};
