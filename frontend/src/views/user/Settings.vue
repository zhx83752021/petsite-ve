<template>
  <div class="settings-page">
    <h2 class="page-title">账户设置</h2>

    <el-tabs v-model="activeTab">
      <!-- 基本信息 -->
      <el-tab-pane label="基本信息" name="profile">
        <el-form
          ref="profileFormRef"
          :model="profileForm"
          :rules="profileRules"
          label-width="100px"
          class="settings-form"
        >
          <el-form-item label="头像">
            <el-upload
              class="avatar-uploader"
              action="#"
              :show-file-list="false"
              :auto-upload="false"
              @change="handleAvatarChange"
            >
              <img v-if="profileForm.avatar" :src="profileForm.avatar" class="avatar" />
              <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
            </el-upload>
          </el-form-item>

          <el-form-item label="昵称" prop="nickname">
            <el-input v-model="profileForm.nickname" placeholder="请输入昵称" />
          </el-form-item>

          <el-form-item label="性别">
            <el-radio-group v-model="profileForm.gender">
              <el-radio label="male">男</el-radio>
              <el-radio label="female">女</el-radio>
              <el-radio label="other">保密</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="生日">
            <el-date-picker
              v-model="profileForm.birthday"
              type="date"
              placeholder="选择日期"
              style="width: 100%"
            />
          </el-form-item>

          <el-form-item label="所在地">
            <el-cascader
              v-model="profileForm.location"
              :options="locationOptions"
              placeholder="请选择省市"
              style="width: 100%"
            />
          </el-form-item>

          <el-form-item label="个性签名">
            <el-input
              v-model="profileForm.signature"
              type="textarea"
              :rows="3"
              placeholder="介绍一下自己吧"
              maxlength="100"
              show-word-limit
            />
          </el-form-item>

          <el-form-item>
            <el-button type="primary" @click="handleSaveProfile">
              保存修改
            </el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <!-- 账号安全 -->
      <el-tab-pane label="账号安全" name="security">
        <div class="security-items">
          <div class="security-item">
            <div class="item-info">
              <h4>登录密码</h4>
              <p>定期更换密码,保护账号安全</p>
            </div>
            <el-button @click="passwordDialogVisible = true">
              修改密码
            </el-button>
          </div>

          <div class="security-item">
            <div class="item-info">
              <h4>手机号</h4>
              <p>已绑定: 138****1234</p>
            </div>
            <el-button @click="phoneDialogVisible = true">
              更换手机
            </el-button>
          </div>

          <div class="security-item">
            <div class="item-info">
              <h4>微信账号</h4>
              <p>未绑定</p>
            </div>
            <el-button type="success">
              立即绑定
            </el-button>
          </div>

          <div class="security-item">
            <div class="item-info">
              <h4>实名认证</h4>
              <p>未认证</p>
            </div>
            <el-button type="warning">
              去认证
            </el-button>
          </div>
        </div>
      </el-tab-pane>

      <!-- 隐私设置 -->
      <el-tab-pane label="隐私设置" name="privacy">
        <div class="privacy-settings">
          <div class="setting-item">
            <div class="setting-info">
              <h4>允许陌生人查看我的动态</h4>
              <p>关闭后,只有关注你的人才能看到你的动态</p>
            </div>
            <el-switch v-model="privacySettings.allowStrangerView" />
          </div>

          <div class="setting-item">
            <div class="setting-info">
              <h4>显示我的在线状态</h4>
              <p>他人可以看到你是否在线</p>
            </div>
            <el-switch v-model="privacySettings.showOnlineStatus" />
          </div>

          <div class="setting-item">
            <div class="setting-info">
              <h4>允许推荐我的账号</h4>
              <p>开启后,系统可能会将你的账号推荐给其他用户</p>
            </div>
            <el-switch v-model="privacySettings.allowRecommend" />
          </div>

          <div class="setting-item">
            <div class="setting-info">
              <h4>接收系统通知</h4>
              <p>关于订单、动态互动等的通知</p>
            </div>
            <el-switch v-model="privacySettings.receiveNotification" />
          </div>

          <el-button type="primary" @click="handleSavePrivacy">
            保存设置
          </el-button>
        </div>
      </el-tab-pane>

      <!-- 账号管理 -->
      <el-tab-pane label="账号管理" name="account">
        <div class="account-manage">
          <el-alert
            title="注销账号"
            type="warning"
            :closable="false"
            style="margin-bottom: 20px"
          >
            注销后,您的所有数据将被永久删除且无法恢复,请谨慎操作
          </el-alert>

          <el-button type="danger" @click="handleDeleteAccount">
            注销账号
          </el-button>
        </div>
      </el-tab-pane>
    </el-tabs>

    <!-- 修改密码弹窗 -->
    <el-dialog
      v-model="passwordDialogVisible"
      title="修改密码"
      width="500px"
    >
      <el-form
        ref="passwordFormRef"
        :model="passwordForm"
        :rules="passwordRules"
        label-width="100px"
      >
        <el-form-item label="当前密码" prop="oldPassword">
          <el-input
            v-model="passwordForm.oldPassword"
            type="password"
            placeholder="请输入当前密码"
            show-password
          />
        </el-form-item>

        <el-form-item label="新密码" prop="newPassword">
          <el-input
            v-model="passwordForm.newPassword"
            type="password"
            placeholder="请输入新密码"
            show-password
          />
        </el-form-item>

        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
            v-model="passwordForm.confirmPassword"
            type="password"
            placeholder="请再次输入新密码"
            show-password
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="passwordDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleChangePassword">
          确定
        </el-button>
      </template>
    </el-dialog>

    <!-- 更换手机弹窗 -->
    <el-dialog
      v-model="phoneDialogVisible"
      title="更换手机号"
      width="500px"
    >
      <el-form
        ref="phoneFormRef"
        :model="phoneForm"
        :rules="phoneRules"
        label-width="100px"
      >
        <el-form-item label="新手机号" prop="phone">
          <el-input v-model="phoneForm.phone" placeholder="请输入新手机号" />
        </el-form-item>

        <el-form-item label="验证码" prop="code">
          <div class="code-input">
            <el-input v-model="phoneForm.code" placeholder="请输入验证码" />
            <el-button :disabled="countdown > 0" @click="handleSendCode">
              {{ countdown > 0 ? `${countdown}秒后重试` : '发送验证码' }}
            </el-button>
          </div>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="phoneDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleChangePhone">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox, FormInstance, FormRules } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'

const activeTab = ref('profile')

// 基本信息
const profileFormRef = ref<FormInstance>()
const profileForm = reactive({
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop',
  nickname: '宠物爱好者',
  gender: 'male',
  birthday: '',
  location: [],
  signature: '热爱生活,热爱宠物',
})

const profileRules: FormRules = {
  nickname: [
    { required: true, message: '请输入昵称', trigger: 'blur' },
    { min: 2, max: 20, message: '昵称长度为2-20个字符', trigger: 'blur' },
  ],
}

const locationOptions = [
  {
    value: 'beijing',
    label: '北京市',
    children: [
      { value: 'chaoyang', label: '朝阳区' },
      { value: 'haidian', label: '海淀区' },
    ],
  },
  {
    value: 'shanghai',
    label: '上海市',
    children: [
      { value: 'pudong', label: '浦东新区' },
      { value: 'huangpu', label: '黄浦区' },
    ],
  },
]

// 密码修改
const passwordDialogVisible = ref(false)
const passwordFormRef = ref<FormInstance>()
const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
})

const validateConfirmPassword = (rule: any, value: any, callback: any) => {
  if (value !== passwordForm.newPassword) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const passwordRules: FormRules = {
  oldPassword: [{ required: true, message: '请输入当前密码', trigger: 'blur' }],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度为6-20个字符', trigger: 'blur' },
  ],
  confirmPassword: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' },
  ],
}

// 手机号修改
const phoneDialogVisible = ref(false)
const phoneFormRef = ref<FormInstance>()
const phoneForm = reactive({
  phone: '',
  code: '',
})

const phoneRules: FormRules = {
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' },
  ],
  code: [{ required: true, message: '请输入验证码', trigger: 'blur' }],
}

const countdown = ref(0)

// 隐私设置
const privacySettings = reactive({
  allowStrangerView: true,
  showOnlineStatus: true,
  allowRecommend: true,
  receiveNotification: true,
})

// 头像上传
const handleAvatarChange = (file: any) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    profileForm.avatar = e.target?.result as string
  }
  reader.readAsDataURL(file.raw)
}

// 保存基本信息
const handleSaveProfile = async () => {
  if (!profileFormRef.value) return

  try {
    await profileFormRef.value.validate()
    // 这里应该调用API保存信息
    ElMessage.success('保存成功')
  } catch (error) {
    ElMessage.warning('请完善信息')
  }
}

// 修改密码
const handleChangePassword = async () => {
  if (!passwordFormRef.value) return

  try {
    await passwordFormRef.value.validate()
    // 这里应该调用API修改密码
    ElMessage.success('密码修改成功')
    passwordDialogVisible.value = false
    passwordFormRef.value.resetFields()
  } catch (error) {
    ElMessage.warning('请完善信息')
  }
}

// 发送验证码
const handleSendCode = () => {
  if (!/^1[3-9]\d{9}$/.test(phoneForm.phone)) {
    ElMessage.warning('请输入正确的手机号')
    return
  }

  // 模拟发送验证码
  countdown.value = 60
  const timer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(timer)
    }
  }, 1000)

  ElMessage.success('验证码已发送')
}

// 更换手机
const handleChangePhone = async () => {
  if (!phoneFormRef.value) return

  try {
    await phoneFormRef.value.validate()
    // 这里应该调用API更换手机号
    ElMessage.success('手机号更换成功')
    phoneDialogVisible.value = false
    phoneFormRef.value.resetFields()
  } catch (error) {
    ElMessage.warning('请完善信息')
  }
}

// 保存隐私设置
const handleSavePrivacy = () => {
  ElMessage.success('设置已保存')
}

// 注销账号
const handleDeleteAccount = async () => {
  try {
    await ElMessageBox.confirm(
      '注销后,您的所有数据将被永久删除且无法恢复。确定要注销账号吗?',
      '警告',
      {
        confirmButtonText: '确定注销',
        cancelButtonText: '取消',
        type: 'error',
      }
    )

    // 这里应该调用API注销账号
    ElMessage.success('账号已注销')
  } catch {
    // 取消注销
  }
}
</script>

<style scoped lang="scss">
.settings-page {
  .page-title {
    margin: 0 0 25px 0;
    font-size: 24px;
    color: #1f2937;
  }

  .settings-form {
    max-width: 600px;
  }
}

// 头像上传
.avatar-uploader {
  .avatar {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    object-fit: cover;
    display: block;
  }

  :deep(.el-upload) {
    border: 1px dashed #d9d9d9;
    border-radius: 50%;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition: all 0.3s;

    &:hover {
      border-color: #ff6b35;
    }
  }

  .avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 100px;
    height: 100px;
    text-align: center;
    line-height: 100px;
  }
}

// 安全设置
.security-items {
  display: flex;
  flex-direction: column;
  gap: 15px;

  .security-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px;
    background: #f9fafb;
    border-radius: 8px;

    .item-info {
      h4 {
        margin: 0 0 5px 0;
        font-size: 16px;
        color: #1f2937;
      }

      p {
        margin: 0;
        font-size: 14px;
        color: #6b7280;
      }
    }
  }
}

// 隐私设置
.privacy-settings {
  .setting-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 0;
    border-bottom: 1px solid #f3f4f6;

    &:last-of-type {
      border-bottom: none;
    }

    .setting-info {
      h4 {
        margin: 0 0 5px 0;
        font-size: 15px;
        color: #1f2937;
      }

      p {
        margin: 0;
        font-size: 13px;
        color: #9ca3af;
      }
    }
  }

  .el-button {
    margin-top: 20px;
  }
}

// 账号管理
.account-manage {
  padding: 20px 0;
}

// 验证码输入
.code-input {
  display: flex;
  gap: 10px;
  width: 100%;

  .el-input {
    flex: 1;
  }

  .el-button {
    white-space: nowrap;
  }
}

// 响应式
@media (max-width: 768px) {
  .security-item {
    flex-direction: column;
    align-items: flex-start !important;
    gap: 15px;

    .el-button {
      width: 100%;
    }
  }

  .setting-item {
    flex-direction: column;
    align-items: flex-start !important;
    gap: 15px;
  }
}
</style>
