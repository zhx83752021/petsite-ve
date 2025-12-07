/**
 * 上传 API
 */
import request from './request'

/**
 * 上传图片参数
 */
export interface UploadImageParams {
  image: string // Base64 格式
  filename?: string
}

/**
 * 上传图片响应
 */
export interface UploadImageResponse {
  url: string
  filename: string
  size: number
  type: string
}

/**
 * 上传 API
 */
export const uploadApi = {
  /**
   * 上传图片
   */
  uploadImage(data: UploadImageParams) {
    return request.post<UploadImageResponse>('/upload/image', data)
  },
}

/**
 * 将文件转换为 Base64
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = error => reject(error)
  })
}
