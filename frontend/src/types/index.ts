// 公共类型定义

// 商品相关类型
export interface ProductCard {
  id: string
  image: string
  name: string
  price: number
  originalPrice?: number
  sales: number // 销量
  rating: number // 评分
  tags: string[] // 标签
}

export interface Product extends ProductCard {
  description: string
  specs: ProductSpec[]
  stock: number
  images: string[]
  video?: string
  details: string // 富文本详情
  reviews: Review[]
}

export interface ProductSpec {
  id: string
  name: string
  value: string
  price: number
  stock: number
}

export interface Review {
  id: string
  userId: string
  userName: string
  avatar: string
  rating: number
  content: string
  images?: string[]
  specs: string
  createdAt: string
  helpful: number
}

// 购物车相关
export interface CartItem {
  id: string
  productId: string
  name: string
  image: string
  specs: string
  price: number
  quantity: number
  stock: number
  selected: boolean
  available: boolean
}

// 社区相关类型
export interface Post {
  id: string
  user: {
    id: string
    avatar: string
    nickname: string
  }
  content: string
  images?: string[] // 最多9张
  video?: {
    url: string
    cover: string
    duration: number
  }
  topics: string[] // 话题标签
  petTags?: string[] // 宠物标签
  location?: string
  createdAt: string
  stats: {
    likes: number
    comments: number
    shares: number
    views: number
  }
  isLiked: boolean // 当前用户是否点赞
}

export interface Comment {
  id: string
  userId: string
  userName: string
  avatar: string
  content: string
  createdAt: string
  likes: number
  isLiked: boolean
  replies?: Comment[]
}

// 宠物档案
export interface Pet {
  id: string
  avatar: string
  name: string
  species: 'dog' | 'cat' | 'other' // 物种
  breed: string // 品种
  gender: 'male' | 'female' // 性别
  birthday: string // 生日
  adoptDate?: string // 领养日期
  weight: number // 体重
  isNeutered: boolean // 是否绝育

  // 健康记录
  healthRecords: Array<{
    type: 'vaccine' | 'deworming' | 'checkup' // 类型
    date: string
    item: string // 项目名称
    hospital: string
    nextDate?: string // 下次时间
  }>

  // 照片相册
  photos: string[]

  // 成长日记
  diaries: Array<{
    date: string
    title: string
    content: string
    images: string[]
  }>
}

// 医生信息
export interface Doctor {
  id: string
  avatar: string
  name: string
  title: string // 职称
  hospital: string // 所属医院
  expertise: string[] // 擅长领域
  experience: number // 从业年限
  consultCount: number // 咨询次数
  rating: number // 评分
  price: number // 咨询费用
  status: 'online' | 'offline' // 在线状态
}

// 美容店铺
export interface Store {
  id: string
  name: string
  images: string[] // 门店照片
  address: string
  phone: string
  businessHours: string // 营业时间
  services: Array<{
    id: string
    name: string // 服务名称
    price: number
    duration: number // 时长(分钟)
    description: string
  }>
  rating: number
  reviews: number
  distance: number // 距离(米)
}

// 订单相关
export interface Order {
  id: string
  orderNo: string
  status: 'pending' | 'paid' | 'shipped' | 'completed' | 'cancelled'
  items: CartItem[]
  address: Address
  pricing: {
    subtotal: number
    discount: number
    shipping: number
    total: number
  }
  createdAt: string
  paidAt?: string
  shippedAt?: string
  completedAt?: string
}

export interface Address {
  id: string
  name: string
  phone: string
  province: string
  city: string
  district: string
  detail: string
  isDefault: boolean
}

// 轮播图
export interface Banner {
  id: string
  image: string
  title: string
  link: string
}

// 分类
export interface Category {
  id: string
  name: string
  icon: string
  children?: Category[]
}
