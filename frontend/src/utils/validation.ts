/**
 * 表单验证规则
 */

// 手机号验证
export const validatePhone = (rule: any, value: string, callback: any) => {
  if (!value) {
    callback(new Error('请输入手机号'))
  } else if (!/^1[3-9]\d{9}$/.test(value)) {
    callback(new Error('请输入正确的手机号'))
  } else {
    callback()
  }
}

// 邮箱验证
export const validateEmail = (rule: any, value: string, callback: any) => {
  if (!value) {
    callback()
  } else if (!/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value)) {
    callback(new Error('请输入正确的邮箱地址'))
  } else {
    callback()
  }
}

// 密码验证
export const validatePassword = (rule: any, value: string, callback: any) => {
  if (!value) {
    callback(new Error('请输入密码'))
  } else if (value.length < 6) {
    callback(new Error('密码长度至少6位'))
  } else if (value.length > 20) {
    callback(new Error('密码长度不能超过20位'))
  } else {
    callback()
  }
}

// 确认密码验证
export const validateConfirmPassword = (password: string) => {
  return (rule: any, value: string, callback: any) => {
    if (!value) {
      callback(new Error('请再次输入密码'))
    } else if (value !== password) {
      callback(new Error('两次输入的密码不一致'))
    } else {
      callback()
    }
  }
}

// 用户名验证
export const validateUsername = (rule: any, value: string, callback: any) => {
  if (!value) {
    callback(new Error('请输入用户名'))
  } else if (value.length < 3) {
    callback(new Error('用户名长度至少3位'))
  } else if (value.length > 20) {
    callback(new Error('用户名长度不能超过20位'))
  } else if (!/^[a-zA-Z0-9_]+$/.test(value)) {
    callback(new Error('用户名只能包含字母、数字和下划线'))
  } else {
    callback()
  }
}

// 商品名称验证
export const validateProductName = (rule: any, value: string, callback: any) => {
  if (!value) {
    callback(new Error('请输入商品名称'))
  } else if (value.length < 2) {
    callback(new Error('商品名称至少2个字符'))
  } else if (value.length > 100) {
    callback(new Error('商品名称不能超过100个字符'))
  } else {
    callback()
  }
}

// 价格验证
export const validatePrice = (rule: any, value: number, callback: any) => {
  if (value === undefined || value === null) {
    callback(new Error('请输入价格'))
  } else if (value < 0) {
    callback(new Error('价格不能为负数'))
  } else if (value > 999999) {
    callback(new Error('价格不能超过999999'))
  } else {
    callback()
  }
}

// 库存验证
export const validateStock = (rule: any, value: number, callback: any) => {
  if (value === undefined || value === null) {
    callback(new Error('请输入库存'))
  } else if (value < 0) {
    callback(new Error('库存不能为负数'))
  } else if (value > 999999) {
    callback(new Error('库存不能超过999999'))
  } else if (!Number.isInteger(value)) {
    callback(new Error('库存必须是整数'))
  } else {
    callback()
  }
}

// 分类名称验证
export const validateCategoryName = (rule: any, value: string, callback: any) => {
  if (!value) {
    callback(new Error('请输入分类名称'))
  } else if (value.length < 2) {
    callback(new Error('分类名称至少2个字符'))
  } else if (value.length > 50) {
    callback(new Error('分类名称不能超过50个字符'))
  } else {
    callback()
  }
}

// 收货人姓名验证
export const validateReceiverName = (rule: any, value: string, callback: any) => {
  if (!value) {
    callback(new Error('请输入收货人姓名'))
  } else if (value.length < 2) {
    callback(new Error('收货人姓名至少2个字符'))
  } else if (value.length > 20) {
    callback(new Error('收货人姓名不能超过20个字符'))
  } else {
    callback()
  }
}

// 地址验证
export const validateAddress = (rule: any, value: string, callback: any) => {
  if (!value) {
    callback(new Error('请输入详细地址'))
  } else if (value.length < 5) {
    callback(new Error('详细地址至少5个字符'))
  } else if (value.length > 200) {
    callback(new Error('详细地址不能超过200个字符'))
  } else {
    callback()
  }
}

// 必填项验证
export const required = (message: string) => {
  return { required: true, message, trigger: 'blur' }
}

// 常用验证规则集合
export const commonRules = {
  username: [
    required('请输入用户名'),
    { validator: validateUsername, trigger: 'blur' },
  ],
  password: [
    required('请输入密码'),
    { validator: validatePassword, trigger: 'blur' },
  ],
  phone: [
    required('请输入手机号'),
    { validator: validatePhone, trigger: 'blur' },
  ],
  email: [
    { validator: validateEmail, trigger: 'blur' },
  ],
  productName: [
    required('请输入商品名称'),
    { validator: validateProductName, trigger: 'blur' },
  ],
  price: [
    required('请输入价格'),
    { validator: validatePrice, trigger: 'blur' },
  ],
  stock: [
    required('请输入库存'),
    { validator: validateStock, trigger: 'blur' },
  ],
  categoryName: [
    required('请输入分类名称'),
    { validator: validateCategoryName, trigger: 'blur' },
  ],
  receiverName: [
    required('请输入收货人姓名'),
    { validator: validateReceiverName, trigger: 'blur' },
  ],
  address: [
    required('请输入详细地址'),
    { validator: validateAddress, trigger: 'blur' },
  ],
}
