/**
 * 数据统计 API
 */
import request from './request'

/**
 * 仪表盘统计数据
 */
export interface DashboardStats {
  today: {
    orderCount: number
    sales: number
    newUsers: number
  }
  total: {
    orders: number
    sales: number
    users: number
    products: number
  }
  orderStatus: {
    pending: { count: number; amount: number }
    paid: { count: number; amount: number }
    shipped: { count: number; amount: number }
    completed: { count: number; amount: number }
    cancelled: { count: number; amount: number }
  }
  trend: Array<{
    date: string
    orderCount: number
    amount: number
  }>
  topProducts: Array<{
    id: number
    name: string
    image: string
    sales: number
    price: number
  }>
  categoryStats: Array<{
    id: number
    name: string
    productCount: number
    totalSales: number
  }>
  pendingTasks: {
    pendingOrders: number
    paidOrders: number
    activeProducts: number
    lowStockProducts: number
  }
}

/**
 * 销售统计参数
 */
export interface SalesStatsParams {
  type: 'day' | 'week' | 'month'
  startDate?: string
  endDate?: string
}

/**
 * 销售统计响应
 */
export interface SalesStatsResponse {
  type: string
  list: Array<{
    period: string
    orderCount: number
    totalAmount: number
    completedAmount: number
  }>
  summary: {
    totalOrders: number
    totalAmount: number
    completedAmount: number
  }
}

/**
 * 统计 API
 */
export const statisticsApi = {
  /**
   * 获取仪表盘统计数据
   */
  getDashboard() {
    return request.get<DashboardStats>('/admin/statistics/dashboard')
  },

  /**
   * 获取销售统计
   */
  getSalesStats(params: SalesStatsParams) {
    return request.get<SalesStatsResponse>('/admin/statistics/sales', { params })
  },
}
