<template>
    <div class="admin-coupons">
        <h2 class="page-title">优惠券管理</h2>

        <el-card shadow="never">
            <div class="toolbar">
                <el-button type="primary" @click="handleAdd">
                    <el-icon>
                        <Plus />
                    </el-icon>
                    创建优惠券
                </el-button>
            </div>

            <!-- 表格 -->
            <el-table v-loading="loading" :data="tableData" stripe style="width: 100%; margin-top: 16px">
                <el-table-column prop="id" label="ID" width="80" />
                <el-table-column prop="name" label="优惠券名称" min-width="150" />
                <el-table-column label="类型" width="100">
                    <template #default="{ row }">
                        {{ typeMap[row.type] }}
                    </template>
                </el-table-column>
                <el-table-column label="优惠" width="120">
                    <template #default="{ row }">
                        <span v-if="row.type === 'full_reduce'">
                            满{{ row.threshold }}减{{ row.amount }}
                        </span>
                        <span v-else-if="row.type === 'discount'">
                            {{ row.amount }}折
                        </span>
                        <span v-else-if="row.type === 'exchange'">
                            {{ row.amount }}元
                        </span>
                        <span v-else>
                            包邮
                        </span>
                    </template>
                </el-table-column>
                <el-table-column label="发放/使用" width="120">
                    <template #default="{ row }">
                        {{ row.usedCount }} / {{ row.totalCount }}
                    </template>
                </el-table-column>
                <el-table-column label="限领" width="100">
                    <template #default="{ row }">
                        每人{{ row.perUserLimit }}张
                    </template>
                </el-table-column>
                <el-table-column label="有效期" width="220">
                    <template #default="{ row }">
                        {{ row.startTime }}<br>{{ row.endTime }}
                    </template>
                </el-table-column>
                <el-table-column label="状态" width="100">
                    <template #default="{ row }">
                        <el-tag :type="getStatusType(row)">
                            {{ getStatusText(row) }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="180" fixed="right">
                    <template #default="{ row }">
                        <el-button link type="primary" size="small" @click="handleSend(row)">
                            发放
                        </el-button>
                        <el-button link type="primary" size="small" @click="handleEdit(row)">
                            编辑
                        </el-button>
                        <el-button link type="danger" size="small" @click="handleDelete(row)">
                            删除
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>

            <!-- 分页 -->
            <el-pagination v-model:current-page="pagination.page" v-model:page-size="pagination.pageSize"
                :total="pagination.total" :page-sizes="[10, 20, 50]" layout="total, sizes, prev, pager, next"
                @current-change="fetchData" @size-change="fetchData"
                style="margin-top: 16px; justify-content: flex-end" />
        </el-card>

        <!-- 添加/编辑对话框 -->
        <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑优惠券' : '创建优惠券'" width="700px">
            <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
                <el-form-item label="优惠券名称" prop="name">
                    <el-input v-model="form.name" placeholder="请输入优惠券名称" />
                </el-form-item>

                <el-form-item label="优惠类型" prop="type">
                    <el-radio-group v-model="form.type">
                        <el-radio label="full_reduce">满减券</el-radio>
                        <el-radio label="discount">折扣券</el-radio>
                        <el-radio label="exchange">兑换券</el-radio>
                        <el-radio label="shipping">包邮券</el-radio>
                    </el-radio-group>
                </el-form-item>

                <el-form-item v-if="form.type === 'full_reduce'" label="满减金额" required>
                    <el-row :gutter="10">
                        <el-col :span="12">
                            <el-input v-model.number="form.threshold" placeholder="满">
                                <template #append>元</template>
                            </el-input>
                        </el-col>
                        <el-col :span="12">
                            <el-input v-model.number="form.amount" placeholder="减">
                                <template #append>元</template>
                            </el-input>
                        </el-col>
                    </el-row>
                </el-form-item>

                <el-form-item v-else-if="form.type === 'discount'" label="折扣" required>
                    <el-input v-model.number="form.amount" placeholder="如输入8表示8折" style="width: 200px">
                        <template #append>折</template>
                    </el-input>
                </el-form-item>

                <el-form-item v-else-if="form.type === 'exchange'" label="面额" required>
                    <el-input v-model.number="form.amount" placeholder="请输入面额" style="width: 200px">
                        <template #append>元</template>
                    </el-input>
                </el-form-item>

                <el-form-item v-if="form.type === 'shipping'" label="使用门槛" required>
                    <el-input v-model.number="form.threshold" placeholder="满多少可用" style="width: 200px">
                        <template #append>元</template>
                    </el-input>
                </el-form-item>

                <el-form-item label="发放数量" prop="totalCount">
                    <el-input v-model.number="form.totalCount" placeholder="总发放数量" style="width: 200px">
                        <template #append>张</template>
                    </el-input>
                </el-form-item>

                <el-form-item label="每人限领" prop="perUserLimit">
                    <el-input v-model.number="form.perUserLimit" placeholder="每人限领数量" style="width: 200px">
                        <template #append>张</template>
                    </el-input>
                </el-form-item>

                <el-form-item label="有效期" required>
                    <el-date-picker v-model="dateRange" type="datetimerange" range-separator="至"
                        start-placeholder="开始时间" end-placeholder="结束时间" format="YYYY-MM-DD HH:mm"
                        value-format="YYYY-MM-DD HH:mm:ss" />
                </el-form-item>

                <el-form-item label="使用范围">
                    <el-radio-group v-model="form.scope">
                        <el-radio label="all">全场通用</el-radio>
                        <el-radio label="category">指定分类</el-radio>
                        <el-radio label="product">指定商品</el-radio>
                    </el-radio-group>
                </el-form-item>

                <el-form-item v-if="form.scope !== 'all'" label="选择商品">
                    <el-button size="small">选择商品</el-button>
                    <div class="form-tip">已选择 0 个商品</div>
                </el-form-item>
            </el-form>

            <template #footer>
                <el-button @click="dialogVisible = false">取消</el-button>
                <el-button type="primary" :loading="submitting" @click="handleSubmit">
                    确定
                </el-button>
            </template>
        </el-dialog>

        <!-- 发放对话框 -->
        <el-dialog v-model="sendVisible" title="发放优惠券" width="500px">
            <el-form label-width="100px">
                <el-form-item label="发放方式">
                    <el-radio-group v-model="sendType">
                        <el-radio label="all">全部用户</el-radio>
                        <el-radio label="specific">指定用户</el-radio>
                    </el-radio-group>
                </el-form-item>

                <el-form-item v-if="sendType === 'specific'" label="用户ID">
                    <el-input type="textarea" :rows="4" placeholder="请输入用户ID,多个用逗号分隔" />
                </el-form-item>
            </el-form>

            <template #footer>
                <el-button @click="sendVisible = false">取消</el-button>
                <el-button type="primary" @click="handleConfirmSend">
                    确定发放
                </el-button>
            </template>
        </el-dialog>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox, FormInstance, FormRules } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'

interface Coupon {
    id: number
    name: string
    type: string
    amount: number
    threshold: number
    totalCount: number
    usedCount: number
    perUserLimit: number
    startTime: string
    endTime: string
    scope: string
}

const loading = ref(false)
const submitting = ref(false)
const dialogVisible = ref(false)
const sendVisible = ref(false)
const isEdit = ref(false)
const formRef = ref<FormInstance>()

const pagination = reactive({
    page: 1,
    pageSize: 20,
    total: 0,
})

const tableData = ref<Coupon[]>([])

const form = reactive({
    id: 0,
    name: '',
    type: 'full_reduce',
    amount: 0,
    threshold: 0,
    totalCount: 100,
    perUserLimit: 1,
    startTime: '',
    endTime: '',
    scope: 'all',
})

const dateRange = ref<[string, string] | null>(null)
const sendType = ref('all')

const typeMap: Record<string, string> = {
    full_reduce: '满减券',
    discount: '折扣券',
    exchange: '兑换券',
    shipping: '包邮券',
}

const rules: FormRules = {
    name: [{ required: true, message: '请输入优惠券名称', trigger: 'blur' }],
    type: [{ required: true, message: '请选择优惠类型', trigger: 'change' }],
    totalCount: [{ required: true, message: '请输入发放数量', trigger: 'blur' }],
    perUserLimit: [{ required: true, message: '请输入限领数量', trigger: 'blur' }],
}

const getStatusType = (row: Coupon) => {
    const now = new Date()
    const start = new Date(row.startTime)
    const end = new Date(row.endTime)

    if (now < start) return 'info'
    if (now > end) return 'info'
    return 'success'
}

const getStatusText = (row: Coupon) => {
    const now = new Date()
    const start = new Date(row.startTime)
    const end = new Date(row.endTime)

    if (now < start) return '未开始'
    if (now > end) return '已结束'
    return '进行中'
}

// 获取数据
const fetchData = async () => {
    loading.value = true
    try {
        tableData.value = [
            {
                id: 1,
                name: '新用户专享券',
                type: 'full_reduce',
                amount: 50,
                threshold: 200,
                totalCount: 1000,
                usedCount: 235,
                perUserLimit: 1,
                startTime: '2024-01-01 00:00:00',
                endTime: '2024-12-31 23:59:59',
                scope: 'all',
            },
            {
                id: 2,
                name: '全场8折券',
                type: 'discount',
                amount: 8,
                threshold: 0,
                totalCount: 500,
                usedCount: 89,
                perUserLimit: 2,
                startTime: '2024-01-15 00:00:00',
                endTime: '2024-01-31 23:59:59',
                scope: 'all',
            },
        ]
        pagination.total = tableData.value.length
    } finally {
        loading.value = false
    }
}

// 添加
const handleAdd = () => {
    isEdit.value = false
    Object.assign(form, {
        id: 0,
        name: '',
        type: 'full_reduce',
        amount: 0,
        threshold: 0,
        totalCount: 100,
        perUserLimit: 1,
        startTime: '',
        endTime: '',
        scope: 'all',
    })
    dateRange.value = null
    dialogVisible.value = true
}

// 编辑
const handleEdit = (row: Coupon) => {
    isEdit.value = true
    Object.assign(form, row)
    dateRange.value = [row.startTime, row.endTime]
    dialogVisible.value = true
}

// 提交
const handleSubmit = async () => {
    if (!formRef.value) return

    try {
        await formRef.value.validate()

        if (dateRange.value) {
            form.startTime = dateRange.value[0]
            form.endTime = dateRange.value[1]
        }

        submitting.value = true
        await new Promise((resolve) => setTimeout(resolve, 1000))

        ElMessage.success(isEdit.value ? '编辑成功' : '创建成功')
        dialogVisible.value = false
        fetchData()
    } catch (error) {
        console.error(error)
    } finally {
        submitting.value = false
    }
}

// 删除
const handleDelete = async (row: Coupon) => {
    try {
        await ElMessageBox.confirm(`确定要删除优惠券"${row.name}"吗?`, '提示', {
            type: 'warning',
        })

        ElMessage.success('删除成功')
        fetchData()
    } catch {
        // 取消删除
    }
}

// 发放
const handleSend = (row: Coupon) => {
    sendVisible.value = true
}

// 确认发放
const handleConfirmSend = () => {
    ElMessage.success('发放成功')
    sendVisible.value = false
}

onMounted(() => {
    fetchData()
})
</script>

<style scoped lang="scss">
.admin-coupons {
    .page-title {
        margin: 0 0 20px 0;
        font-size: 20px;
        font-weight: 600;
    }

    .toolbar {
        margin-bottom: 16px;
    }
}

.form-tip {
    margin-top: 4px;
    font-size: 12px;
    color: #999;
}
</style>
