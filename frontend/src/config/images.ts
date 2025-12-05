/**
 * 图片配置文件
 * 集中管理所有图片资源
 */

// 默认头像 - 使用UI Avatars生成，更稳定
export const DEFAULT_AVATAR = 'https://ui-avatars.com/api/?name='

// 宠物图片
export const PET_IMAGES = {
  dogs: [
    'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&h=600&fit=crop', // 金毛
    'https://images.unsplash.com/photo-1561037404-61cd46aa615b?w=800&h=600&fit=crop', // 柯基
    'https://images.unsplash.com/photo-1530281700549-e82e7bf110d6?w=800&h=600&fit=crop', // 哈士奇
    'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=800&h=600&fit=crop', // 拉布拉多
    'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?w=800&h=600&fit=crop', // 比格犬
    'https://images.unsplash.com/photo-1568572933382-74d440642117?w=800&h=600&fit=crop', // 萨摩耶
  ],
  cats: [
    'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=800&h=600&fit=crop', // 橘猫
    'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800&h=600&fit=crop', // 白猫
    'https://images.unsplash.com/photo-1529778873920-4da4926a72c2?w=800&h=600&fit=crop', // 虎斑猫
    'https://images.unsplash.com/photo-1543852786-1cf6624b9987?w=800&h=600&fit=crop', // 苏格兰折耳猫
    'https://images.unsplash.com/photo-1548681528-6a5c45b66b42?w=800&h=600&fit=crop', // 波斯猫
    'https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8?w=800&h=600&fit=crop', // 暹罗猫
  ],
}

// 商品图片
export const PRODUCT_IMAGES = {
  food: [
    'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=800&h=800&fit=crop', // 狗粮
    'https://images.unsplash.com/photo-1611003228941-98852ba62227?w=800&h=800&fit=crop', // 猫粮
    'https://images.unsplash.com/photo-1603048297172-c92544798d5a?w=800&h=800&fit=crop', // 宠物零食
  ],
  toys: [
    'https://images.unsplash.com/photo-1558788353-f76d92427f16?w=800&h=800&fit=crop', // 玩具球
    'https://images.unsplash.com/photo-1545249390-6bdfa286032f?w=800&h=800&fit=crop', // 猫爬架
    'https://images.unsplash.com/photo-1559523161-0fc0d8b38a7a?w=800&h=800&fit=crop', // 玩具骨头
  ],
  supplies: [
    'https://images.unsplash.com/photo-1579164029149-cf0c20a1d9a2?w=800&h=800&fit=crop', // 饮水机
    'https://images.unsplash.com/photo-1591769225440-811ad7d6eab3?w=800&h=800&fit=crop', // 宠物窝
    'https://images.unsplash.com/photo-1584020850018-51fc341d5e8e?w=800&h=800&fit=crop', // 牵引绳
  ],
}

// 医生/专家头像
export const DOCTOR_AVATARS = [
  'https://i.pravatar.cc/200?img=12', // 男医生1
  'https://i.pravatar.cc/200?img=33', // 女医生1
  'https://i.pravatar.cc/200?img=14', // 男医生2
  'https://i.pravatar.cc/200?img=47', // 女医生2
  'https://i.pravatar.cc/200?img=15', // 男医生3
  'https://i.pravatar.cc/200?img=44', // 女医生3
]

// 店铺/门店图片
export const STORE_IMAGES = [
  'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=1200&h=800&fit=crop', // 宠物店1
  'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=1200&h=800&fit=crop', // 宠物店2
  'https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=1200&h=800&fit=crop', // 宠物店3
  'https://images.unsplash.com/photo-1531844251246-9a1bfaae09fc?w=1200&h=800&fit=crop', // 宠物店4
]

// Banner轮播图
export const BANNER_IMAGES = [
  'https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=1920&h=600&fit=crop', // 宠物家庭
  'https://images.unsplash.com/photo-1530281700549-e82e7bf110d6?w=1920&h=600&fit=crop', // 宠物美容
  'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=1920&h=600&fit=crop', // 健康咨询
  'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=1920&h=600&fit=crop', // 宠物用品
]

// 社区动态图片
export const POST_IMAGES = [
  'https://images.unsplash.com/photo-1633722715463-d30f4f325e24?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1615751072497-5f5169febe17?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800&h=600&fit=crop',
]

// 用户头像生成函数
export function getUserAvatar(seed: string): string {
  // 使用UI Avatars API生成头像
  // 参数：name=名称&background=背景色&color=文字颜色&size=尺寸
  const name = encodeURIComponent(seed)
  return `${DEFAULT_AVATAR}${name}&background=FF6B35&color=fff&size=128`
}

// 获取随机宠物图片
export function getRandomPetImage(type: 'dog' | 'cat' = 'dog'): string {
  const images = type === 'dog' ? PET_IMAGES.dogs : PET_IMAGES.cats
  return images[Math.floor(Math.random() * images.length)]
}

// 获取随机商品图片
export function getRandomProductImage(category: 'food' | 'toys' | 'supplies' = 'food'): string {
  const images = PRODUCT_IMAGES[category]
  return images[Math.floor(Math.random() * images.length)]
}

// 获取随机医生头像
export function getRandomDoctorAvatar(): string {
  return DOCTOR_AVATARS[Math.floor(Math.random() * DOCTOR_AVATARS.length)]
}

// 获取随机店铺图片
export function getRandomStoreImage(): string {
  return STORE_IMAGES[Math.floor(Math.random() * STORE_IMAGES.length)]
}
