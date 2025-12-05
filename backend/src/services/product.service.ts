import { Op } from 'sequelize';
import { Product, ProductSku, Category, Brand } from '../models';
import { PaginationParams, PaginatedResponse } from '../types';
import { CacheService } from '../config/redis';

/**
 * 商品服务层
 */
export class ProductService {
  /**
   * 获取商品列表
   */
  static async getList(
    params: PaginationParams & {
      keyword?: string;
      categoryId?: number;
      brandId?: number;
      status?: number;
    }
  ): Promise<PaginatedResponse<any>> {
    const { page = 1, pageSize = 20, keyword, categoryId, brandId, status } = params;
    const offset = (page - 1) * pageSize;

    const where: any = {};

    if (keyword) {
      where.name = { [Op.like]: `%${keyword}%` };
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (brandId) {
      where.brandId = brandId;
    }

    if (status !== undefined) {
      where.status = status;
    }

    const { count, rows } = await Product.findAndCountAll({
      where,
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name'],
        },
        {
          model: Brand,
          as: 'brand',
          attributes: ['id', 'name', 'logo'],
        },
        {
          model: ProductSku,
          as: 'skus',
          attributes: ['id', 'price', 'stock'],
        },
      ],
      offset,
      limit: pageSize,
      order: [['createdAt', 'DESC']],
    });

    return {
      items: rows.map((product) => product.toJSON()),
      pagination: {
        page,
        pageSize,
        total: count,
        totalPages: Math.ceil(count / pageSize),
      },
    };
  }

  /**
   * 获取商品详情
   */
  static async getDetail(id: number): Promise<any> {
    const cacheKey = `product:${id}`;

    // 尝试从缓存获取
    let product = await CacheService.get(cacheKey);

    if (!product) {
      const productData = await Product.findByPk(id, {
        include: [
          {
            model: Category,
            as: 'category',
            attributes: ['id', 'name'],
          },
          {
            model: Brand,
            as: 'brand',
            attributes: ['id', 'name', 'logo', 'description'],
          },
          {
            model: ProductSku,
            as: 'skus',
          },
        ],
      });

      if (!productData) {
        throw new Error('商品不存在');
      }

      product = productData.toJSON();

      // 写入缓存，过期时间1小时
      await CacheService.set(cacheKey, product, 3600);
    }

    return product;
  }

  /**
   * 创建商品
   */
  static async create(data: {
    categoryId: number;
    brandId?: number;
    name: string;
    subtitle?: string;
    mainImages: string[];
    detail: string;
    petType?: number;
    ageRange?: string;
    ingredients?: string;
    attributes?: any;
    skus: Array<{
      skuCode: string;
      specCombination: string;
      price: number;
      originalPrice?: number;
      stock: number;
      weight?: number;
    }>;
  }): Promise<any> {
    const { skus, ...productData } = data;

    // 创建商品
    const product = await Product.create({
      ...productData,
      status: 1,
      sales: 0,
      views: 0,
    });

    // 创建 SKU
    if (skus && skus.length > 0) {
      const skuData = skus.map((sku) => ({
        ...sku,
        productId: product.id,
        status: 1,
      }));
      await ProductSku.bulkCreate(skuData);
    }

    return this.getDetail(product.id);
  }

  /**
   * 更新商品
   */
  static async update(id: number, data: Partial<any>): Promise<any> {
    const product = await Product.findByPk(id);

    if (!product) {
      throw new Error('商品不存在');
    }

    const { skus, ...productData } = data;

    // 更新商品基本信息
    await product.update(productData);

    // 更新 SKU
    if (skus && skus.length > 0) {
      // 删除旧 SKU
      await ProductSku.destroy({ where: { productId: id } });

      // 创建新 SKU
      const skuData = skus.map((sku: any) => ({
        ...sku,
        productId: id,
        status: 1,
      }));
      await ProductSku.bulkCreate(skuData);
    }

    // 清除缓存
    await CacheService.del(`product:${id}`);

    return this.getDetail(id);
  }

  /**
   * 删除商品
   */
  static async delete(id: number): Promise<void> {
    const product = await Product.findByPk(id);

    if (!product) {
      throw new Error('商品不存在');
    }

    await product.destroy();

    // 清除缓存
    await CacheService.del(`product:${id}`);
  }

  /**
   * 上架/下架商品
   */
  static async updateStatus(id: number, status: number): Promise<void> {
    const product = await Product.findByPk(id);

    if (!product) {
      throw new Error('商品不存在');
    }

    await product.update({ status });

    // 清除缓存
    await CacheService.del(`product:${id}`);
  }
}
