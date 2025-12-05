<template>
    <el-dialog v-model="visible" :title="isLogin ? '欢迎登录' : '欢迎注册'" width="400px" :close-on-click-modal="false"
        class="auth-dialog" @close="handleClose">
        <!-- 登录表单 -->
        <el-form v-if="isLogin" ref="loginFormRef" :model="loginForm" :rules="loginRules" label-width="0">
            <el-form-item prop="username">
                <el-input v-model="loginForm.username" placeholder="请输入用户名或手机号" size="large">
                    <template #prefix>
                        <el-icon>
                            <User />
                        </el-icon>
                    </template>
                </el-input>
            </el-form-item>

            <el-form-item prop="password">
                <el-input v-model="loginForm.password" type="password" placeholder="请输入密码" size="large" show-password>
                    <template #prefix>
                        <el-icon>
                            <Lock />
                        </el-icon>
                    </template>
                </el-input>
            </el-form-item>

            <el-form-item>
                <el-button type="primary" size="large" :loading="loading" style="width: 100%" @click="handleLogin">
                    登录
                </el-button>
            </el-form-item>
        </el-form>

        <!-- 注册表单 -->
        <el-form v-else ref="registerFormRef" :model="registerForm" :rules="registerRules" label-width="0">
            <el-form-item prop="username">
                <el-input v-model="registerForm.username" placeholder="请输入用户名" size="large">
                    <template #prefix>
                        <el-icon>
                            <User />
                        </el-icon>
                    </template>
                </el-input>
            </el-form-item>

            <el-form-item prop="phone">
                <el-input v-model="registerForm.phone" placeholder="请输入手机号" size="large" maxlength="11">
                    <template #prefix>
                        <el-icon>
                            <Iphone />
                        </el-icon>
                    </template>
                </el-input>
            </el-form-item>

            <el-form-item prop="code">
                <div class="code-input">
                    <el-input v-model="registerForm.code" placeholder="请输入验证码" size="large" maxlength="6">
                        <template #prefix>
                            <el-icon>
                                <Message />
                            </el-icon>
                        </template>
                    </el-input>
                    <el-button size="large" :disabled="countdown > 0" :loading="sendingCode" @click="handleSendCode">
                        {{ countdown > 0 ? `${countdown}秒后重试` : '获取验证码' }}
                    </el-button>
                </div>
            </el-form-item>

            <el-form-item prop="password">
                <el-input v-model="registerForm.password" type="password" placeholder="请设置密码(6-20位)" size="large"
                    show-password>
                    <template #prefix>
                        <el-icon>
                            <Lock />
                        </el-icon>
                    </template>
                </el-input>
            </el-form-item>

            <el-form-item prop="confirmPassword">
                <el-input v-model="registerForm.confirmPassword" type="password" placeholder="请再次输入密码" size="large"
                    show-password>
                    <template #prefix>
                        <el-icon>
                            <Lock />
                        </el-icon>
                    </template>
                </el-input>
            </el-form-item>

            <el-form-item>
                <el-button type="primary" size="large" :loading="loading" style="width: 100%" @click="handleRegister">
                    注册
                </el-button>
            </el-form-item>
        </el-form>

        <!-- 切换登录/注册 -->
        <div class="switch-type">
            <span v-if="isLogin">
                还没有账号？
                <el-button type="primary" link @click="isLogin = false">
                    立即注册
                </el-button>
            </span>
            <span v-else>
                已有账号？
                <el-button type="primary" link @click="isLogin = true">
                    立即登录
                </el-button>
            </span>
        </div>
    </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { authApi } from '@/api/auth'
import { ElMessage, FormInstance, FormRules } from 'element-plus'
import { User, Lock, Iphone, Message } from '@element-plus/icons-vue'

interface Props {
    modelValue: boolean
    defaultType?: 'login' | 'register'
}

const props = withDefaults(defineProps<Props>(), {
    defaultType: 'login',
})

const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void
}>()

const router = useRouter()
const userStore = useUserStore()

const isLogin = ref(props.defaultType === 'login')
const loading = ref(false)
const sendingCode = ref(false)
const countdown = ref(0)
const loginFormRef = ref<FormInstance>()
const registerFormRef = ref<FormInstance>()

const visible = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value),
})

const loginForm = reactive({
    username: '',
    password: '',
})

const registerForm = reactive({
    username: '',
    phone: '',
    code: '',
    password: '',
    confirmPassword: '',
})

// 手机号验证
const validatePhone = (_rule: any, value: string, callback: any) => {
    if (!value) {
        callback(new Error('请输入手机号'))
    } else if (!/^1[3-9]\d{9}$/.test(value)) {
        callback(new Error('请输入正确的手机号'))
    } else {
        callback()
    }
}

// 确认密码验证
const validateConfirmPassword = (_rule: any, value: string, callback: any) => {
    if (!value) {
        callback(new Error('请再次输入密码'))
    } else if (value !== registerForm.password) {
        callback(new Error('两次输入的密码不一致'))
    } else {
        callback()
    }
}

const loginRules: FormRules = {
    username: [{ required: true, message: '请输入用户名或手机号', trigger: 'input' }],
    password: [{ required: true, message: '请输入密码', trigger: 'input' }],
}

const registerRules: FormRules = {
    username: [
        { required: true, message: '请输入用户名', trigger: 'input' },
        { min: 3, max: 20, message: '用户名长度为3-20个字符', trigger: 'input' },
        { pattern: /^[a-zA-Z0-9_]+$/, message: '用户名只能包含字母、数字和下划线', trigger: 'input' },
    ],
    phone: [{ required: true, validator: validatePhone, trigger: 'input' }],
    code: [
        { required: true, message: '请输入验证码', trigger: 'input' },
        { len: 6, message: '验证码为6位数字', trigger: 'input' },
    ],
    password: [
        { required: true, message: '请设置密码', trigger: 'input' },
        { min: 6, max: 20, message: '密码长度为6-20位', trigger: 'input' },
    ],
    confirmPassword: [{ required: true, validator: validateConfirmPassword, trigger: 'input' }],
}

// 发送验证码
const handleSendCode = async () => {
    try {
        await registerFormRef.value?.validateField('phone')

        sendingCode.value = true
        const response = await authApi.sendCode(registerForm.phone)

        // 开发环境显示验证码
        if (response.data?.code) {
            ElMessage.success({
                message: `验证码已发送: ${response.data.code}`,
                duration: 10000,
                showClose: true,
            })
            // 自动填充验证码（开发环境方便测试）
            registerForm.code = response.data.code
        } else {
            ElMessage.success('验证码已发送，请注意查收')
        }

        countdown.value = 60
        const timer = setInterval(() => {
            countdown.value--
            if (countdown.value <= 0) {
                clearInterval(timer)
            }
        }, 1000)
    } catch (error: any) {
        if (error !== false) {
            ElMessage.error(error.message || '发送验证码失败')
        }
    } finally {
        sendingCode.value = false
    }
}

// 登录
const handleLogin = async () => {
    try {
        await loginFormRef.value?.validate()
        loading.value = true

        await userStore.login(loginForm.username, loginForm.password)
        ElMessage.success('登录成功')
        visible.value = false
    } catch (error: any) {
        if (error !== false) {
            ElMessage.error(error.message || '登录失败')
        }
    } finally {
        loading.value = false
    }
}

// 注册
const handleRegister = async () => {
    try {
        await registerFormRef.value?.validate()
        loading.value = true

        await userStore.register(registerForm)
        ElMessage.success('注册成功')
        visible.value = false
    } catch (error: any) {
        if (error !== false) {
            ElMessage.error(error.message || '注册失败')
        }
    } finally {
        loading.value = false
    }
}

// 关闭对话框
const handleClose = () => {
    loginFormRef.value?.resetFields()
    registerFormRef.value?.resetFields()
    countdown.value = 0
}

// 监听类型切换时重置表单
watch(isLogin, () => {
    loginFormRef.value?.resetFields()
    registerFormRef.value?.resetFields()
})

// 监听defaultType变化,同步更新isLogin
watch(() => props.defaultType, (newType) => {
    isLogin.value = newType === 'login'
})

// 监听弹窗打开,同步defaultType到isLogin
watch(() => props.modelValue, (newValue) => {
    if (newValue) {
        isLogin.value = props.defaultType === 'login'
    }
})
</script>

<style scoped>
:deep(.el-dialog) {
    border-radius: 16px;
    overflow: hidden;
}

:deep(.el-dialog__header) {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 24px;
    margin: 0;
}

:deep(.el-dialog__title) {
    color: white;
    font-size: 20px;
    font-weight: bold;
}

:deep(.el-dialog__headerbtn .el-dialog__close) {
    color: white;
    font-size: 20px;
}

:deep(.el-dialog__body) {
    padding: 32px;
}

:deep(.el-form-item) {
    margin-bottom: 20px;
}

:deep(.el-input__wrapper) {
    border-radius: 8px;
    box-shadow: 0 0 0 1px #dcdfe6 inset;
    transition: all 0.3s;
}

:deep(.el-input__wrapper:hover),
:deep(.el-input__wrapper.is-focus) {
    box-shadow: 0 0 0 1px #667eea inset;
}

:deep(.el-button--primary) {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border: none;
    border-radius: 8px;
    height: 44px;
    font-size: 16px;
    font-weight: bold;
    transition: all 0.3s;
}

:deep(.el-button--primary:hover) {
    background: linear-gradient(135deg, #7e8ef1 0%, #8b5cb8 100%);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.code-input {
    display: flex;
    gap: 8px;
}

.code-input :deep(.el-input) {
    flex: 1;
}

.code-input :deep(.el-button) {
    width: 120px;
    flex-shrink: 0;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border: none;
    color: white;
    border-radius: 8px;
}

.code-input :deep(.el-button:hover) {
    background: linear-gradient(135deg, #7e8ef1 0%, #8b5cb8 100%);
}

.code-input :deep(.el-button.is-disabled) {
    background: #e4e7ed;
    color: #a8abb2;
}

.switch-type {
    text-align: center;
    color: #666;
    margin-top: 24px;
    padding-top: 24px;
    border-top: 1px solid #f0f0f0;
    font-size: 14px;
}

.switch-type :deep(.el-button--primary) {
    background: none;
    padding: 0;
    height: auto;
    font-size: 14px;
    color: #667eea;
    font-weight: 500;
}

.switch-type :deep(.el-button--primary:hover) {
    color: #764ba2;
    transform: none;
    box-shadow: none;
}
</style>
