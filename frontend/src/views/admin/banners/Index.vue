<template>
    <div class="admin-banners">
        <h2 class="page-title">Banner管理</h2>

        <el-card shadow="never">
            <div class="toolbar">
                <el-button type="primary" @click="handleAdd">
                    <el-icon>
                        <Plus />
                    </el-icon>
                    添加Banner
                </el-button>
            </div>

            <!-- Banner列表 -->
            <div class="banner-list">
                <el-table v-loading="loading" :data="tableData" row-key="id" stripe>
                    <el-table-column label="排序" width="80">
                        <template #default="{ row }">
                            <el-button link type="primary" size="small" @click="handleMoveUp(row)">
                                ↑
                            </el-button>
                            <el-button link type="primary" size="small" @click="handleMoveDown(row)">
                                ↓
                            </el-button>
                        </template>
                    </el-table-column>
                    <el-table-column label="预览" width="200">
                        <template #default="{ row }">
                            <el-image :src="row.image" fit="cover"
                                style="width: 180px; height: 100px; border-radius: 4px" />
                        </template>
                    </el-table-column>
                    <el-table-column prop="title" label="标题" min-width="150" />
                    <el-table-column prop="position" label="展示位置" width="120">
                        <template #default="{ row }">
                            {{ positionMap[row.position] }}
                        </template>
                    </el-table-column>
                    <el-table-column prop="link" label="跳转链接" min-width="200" />
                    <el-table-column label="时间范围" width="220">
                        <template #default="{ row }">
                            <div v-if="row.startTime && row.endTime">
                                {{ row.startTime }} ~ {{ row.endTime }}
                            </div>
                            <div v-else>
                                长期有效
                            </div>
                        </template>
                    </el-table-column>
                    <el-table-column label="状态" width="100">
                        <template #default="{ row }">
                            <el-tag :type="row.status === 1 ? 'success' : 'danger'">
                                {{ row.status === 1 ? '启用' : '禁用' }}
                            </el-tag>
                        </template>
                    </el-table-column>
                    <el-table-column label="操作" width="180" fixed="right">
                        <template #default="{ row }">
                            <el-button link type="primary" size="small" @click="handleEdit(row)">
                                编辑
                            </el-button>
                            <el-button link type="danger" size="small" @click="handleDelete(row)">
                                删除
                            </el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
        </el-card>

        <!-- 添加/编辑对话框 -->
        <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑Banner' : '添加Banner'" width="700px">
            <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
                <el-form-item label="标题" prop="title">
                    <el-input v-model="form.title" placeholder="请输入Banner标题" />
                </el-form-item>

                <el-form-item label="图片" prop="image" required>
                    <el-upload class="banner-uploader" action="#" :show-file-list="false" :auto-upload="false"
                        @change="handleImageChange">
                        <img v-if="form.image" :src="form.image" class="banner-image" />
                        <el-icon v-else class="banner-uploader-icon">
                            <Plus />
                        </el-icon>
                    </el-upload>
                    <div class="upload-tip">建议尺寸: 1920x600px</div>
                </el-form-item>

                <el-form-item label="跳转链接" prop="link">
                    <el-input v-model="form.link" placeholder="请输入跳转链接,如:/shop或http://..." />
                </el-form-item>

                <el-form-item label="展示位置" prop="position">
                    <el-select v-model="form.position" placeholder="请选择展示位置">
                        <el-option label="首页顶部" value="home" />
                        <el-option label="商城页面" value="shop" />
                        <el-option label="社区页面" value="community" />
                    </el-select>
                </el-form-item>

                <el-form-item label="显示时间">
                    <el-date-picker v-model="dateRange" type="datetimerange" range-separator="至"
                        start-placeholder="开始时间" end-placeholder="结束时间" format="YYYY-MM-DD HH:mm"
                        value-format="YYYY-MM-DD HH:mm:ss" />
                    <div class="form-tip">不设置则长期有效</div>
                </el-form-item>

                <el-form-item label="状态">
                    <el-radio-group v-model="form.status">
                        <el-radio :label="1">启用</el-radio>
                        <el-radio :label="2">禁用</el-radio>
                    </el-radio-group>
                </el-form-item>
            </el-form>

            <template #footer>
                <el-button @click="dialogVisible = false">取消</el-button>
                <el-button type="primary" :loading="submitting" @click="handleSubmit">
                    确定
                </el-button>
            </template>
        </el-dialog>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox, FormInstance, FormRules } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'

interface Banner {
    id: number
    title: string
    image: string
    link: string
    position: string
    sort: number
    startTime?: string
    endTime?: string
    status: number
}

const loading = ref(false)
const submitting = ref(false)
const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref<FormInstance>()

const tableData = ref<Banner[]>([])

const form = reactive({
    id: 0,
    title: '',
    image: '',
    link: '',
    position: 'home',
    sort: 0,
    startTime: '',
    endTime: '',
    status: 1,
})

const dateRange = ref<[string, string] | null>(null)

const positionMap: Record<string, string> = {
    home: '首页顶部',
    shop: '商城页面',
    community: '社区页面',
}

const rules: FormRules = {
    title: [{ required: true, message: '请输入Banner标题', trigger: 'blur' }],
    image: [{ required: true, message: '请上传Banner图片', trigger: 'change' }],
    link: [{ required: true, message: '请输入跳转链接', trigger: 'blur' }],
    position: [{ required: true, message: '请选择展示位置', trigger: 'change' }],
}

// 获取数据
const fetchData = async () => {
    loading.value = true
    try {
        // 模拟数据
        tableData.value = [
            {
                id: 1,
                title: '新年钜惠',
                image: 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=1920&h=600&fit=crop',
                link: '/shop',
                position: 'home',
                sort: 1,
                startTime: '2024-01-01 00:00:00',
                endTime: '2024-01-31 23:59:59',
                status: 1,
            },
            {
                id: 2,
                title: '宠物美容',
                image: 'https://images.unsplash.com/photo-1530281700549-e82e7bf110d6?w=1920&h=600&fit=crop',
                link: '/services/grooming',
                position: 'home',
                sort: 2,
                status: 1,
            },
            {
                id: 3,
                title: '健康咨询',
                image: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=1920&h=600&fit=crop',
                link: '/services/consultation',
                position: 'home',
                sort: 3,
                status: 1,
            },
        ]
    } finally {
        loading.value = false
    }
}

// 添加
const handleAdd = () => {
    isEdit.value = false
    Object.assign(form, {
        id: 0,
        title: '',
        image: '',
        link: '',
        position: 'home',
        sort: tableData.value.length + 1,
        startTime: '',
        endTime: '',
        status: 1,
    })
    dateRange.value = null
    dialogVisible.value = true
}

// 编辑
const handleEdit = (row: Banner) => {
    isEdit.value = true
    Object.assign(form, row)

    if (row.startTime && row.endTime) {
        dateRange.value = [row.startTime, row.endTime]
    } else {
        dateRange.value = null
    }

    dialogVisible.value = true
}

// 图片上传
const handleImageChange = (file: any) => {
    const reader = new FileReader()
    reader.onload = (e) => {
        form.image = e.target?.result as string
    }
    reader.readAsDataURL(file.raw)
}

// 提交
const handleSubmit = async () => {
    if (!formRef.value) return

    try {
        await formRef.value.validate()

        if (dateRange.value) {
            form.startTime = dateRange.value[0]
            form.endTime = dateRange.value[1]
        } else {
            form.startTime = ''
            form.endTime = ''
        }

        submitting.value = true

        // TODO: 调用API
        await new Promise((resolve) => setTimeout(resolve, 1000))

        ElMessage.success(isEdit.value ? '编辑成功' : '添加成功')
        dialogVisible.value = false
        fetchData()
    } catch (error) {
        console.error(error)
    } finally {
        submitting.value = false
    }
}

// 删除
const handleDelete = async (row: Banner) => {
    try {
        await ElMessageBox.confirm(`确定要删除Banner"${row.title}"吗?`, '提示', {
            type: 'warning',
        })

        // TODO: 调用API
        ElMessage.success('删除成功')
        fetchData()
    } catch {
        // 取消删除
    }
}

// 上移
const handleMoveUp = (row: Banner) => {
    const index = tableData.value.findIndex((item) => item.id === row.id)
    if (index > 0) {
        [tableData.value[index], tableData.value[index - 1]] = [tableData.value[index - 1], tableData.value[index]]
        ElMessage.success('调整成功')
        // TODO: 调用API保存排序
    }
}

// 下移
const handleMoveDown = (row: Banner) => {
    const index = tableData.value.findIndex((item) => item.id === row.id)
    if (index < tableData.value.length - 1) {
        [tableData.value[index], tableData.value[index + 1]] = [tableData.value[index + 1], tableData.value[index]]
        ElMessage.success('调整成功')
        // TODO: 调用API保存排序
    }
}

onMounted(() => {
    fetchData()
})
</script>

<style scoped lang="scss">
.admin-banners {
    .page-title {
        margin: 0 0 20px 0;
        font-size: 20px;
        font-weight: 600;
    }

    .toolbar {
        margin-bottom: 16px;
    }

    .banner-list {
        margin-top: 16px;
    }
}

.banner-uploader {
    :deep(.el-upload) {
        border: 1px dashed #d9d9d9;
        border-radius: 6px;
        cursor: pointer;
        position: relative;
        overflow: hidden;
        transition: all 0.3s;

        &:hover {
            border-color: #409eff;
        }
    }

    .banner-image {
        width: 500px;
        height: 200px;
        display: block;
        object-fit: cover;
    }

    .banner-uploader-icon {
        font-size: 28px;
        color: #8c939d;
        width: 500px;
        height: 200px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #fafafa;
    }
}

.upload-tip {
    margin-top: 8px;
    font-size: 12px;
    color: #999;
}

.form-tip {
    margin-top: 4px;
    font-size: 12px;
    color: #999;
}
</style>
