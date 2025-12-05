<template>
    <div class="admin-roles">
        <h2 class="page-title">角色管理</h2>

        <el-card shadow="never">
            <div class="toolbar">
                <el-button type="primary" @click="handleAdd">
                    <el-icon>
                        <Plus />
                    </el-icon>
                    添加角色
                </el-button>
            </div>

            <!-- 表格 -->
            <el-table v-loading="loading" :data="tableData" stripe style="width: 100%; margin-top: 16px">
                <el-table-column prop="id" label="ID" width="80" />
                <el-table-column prop="name" label="角色名称" width="150" />
                <el-table-column prop="code" label="角色标识" width="150" />
                <el-table-column prop="description" label="描述" min-width="200" />
                <el-table-column label="状态" width="100">
                    <template #default="{ row }">
                        <el-tag :type="row.status === 1 ? 'success' : 'danger'">
                            {{ row.status === 1 ? '启用' : '禁用' }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="createdAt" label="创建时间" width="180" />
                <el-table-column label="操作" width="200" fixed="right">
                    <template #default="{ row }">
                        <el-button link type="primary" size="small" @click="handlePermission(row)">
                            权限配置
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
                :total="pagination.total" :page-sizes="[10, 20, 50, 100]"
                layout="total, sizes, prev, pager, next, jumper" @current-change="fetchData" @size-change="fetchData"
                style="margin-top: 16px; justify-content: flex-end" />
        </el-card>

        <!-- 添加/编辑对话框 -->
        <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑角色' : '添加角色'" width="600px">
            <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
                <el-form-item label="角色名称" prop="name">
                    <el-input v-model="form.name" placeholder="请输入角色名称" />
                </el-form-item>
                <el-form-item label="角色标识" prop="code">
                    <el-input v-model="form.code" placeholder="请输入角色标识(英文)" />
                </el-form-item>
                <el-form-item label="描述" prop="description">
                    <el-input v-model="form.description" type="textarea" :rows="3" placeholder="请输入角色描述" />
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

        <!-- 权限配置对话框 -->
        <el-dialog v-model="permissionVisible" title="权限配置" width="700px">
            <el-tree ref="treeRef" :data="permissionTree" :props="treeProps" show-checkbox node-key="id"
                :default-checked-keys="checkedPermissions" />

            <template #footer>
                <el-button @click="permissionVisible = false">取消</el-button>
                <el-button type="primary" @click="handleSavePermission">
                    保存
                </el-button>
            </template>
        </el-dialog>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox, FormInstance, FormRules } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'

interface Role {
    id: number
    name: string
    code: string
    description: string
    status: number
    createdAt: string
}

const loading = ref(false)
const submitting = ref(false)
const dialogVisible = ref(false)
const permissionVisible = ref(false)
const isEdit = ref(false)
const formRef = ref<FormInstance>()
const treeRef = ref()

const pagination = reactive({
    page: 1,
    pageSize: 20,
    total: 0,
})

const tableData = ref<Role[]>([])

const form = reactive({
    id: 0,
    name: '',
    code: '',
    description: '',
    status: 1,
})

const rules: FormRules = {
    name: [{ required: true, message: '请输入角色名称', trigger: 'blur' }],
    code: [
        { required: true, message: '请输入角色标识', trigger: 'blur' },
        { pattern: /^[a-zA-Z_]+$/, message: '只能包含字母和下划线', trigger: 'blur' },
    ],
}

// 权限树配置
const treeProps = {
    children: 'children',
    label: 'name',
}

const permissionTree = ref([
    {
        id: 'system',
        name: '系统管理',
        children: [
            { id: 'system:admin', name: '管理员管理' },
            { id: 'system:role', name: '角色管理' },
            { id: 'system:log', name: '操作日志' },
        ],
    },
    {
        id: 'user',
        name: '用户管理',
        children: [
            { id: 'user:list', name: '用户列表' },
            { id: 'user:detail', name: '用户详情' },
        ],
    },
    {
        id: 'product',
        name: '商品管理',
        children: [
            { id: 'product:list', name: '商品列表' },
            { id: 'product:add', name: '添加商品' },
            { id: 'product:edit', name: '编辑商品' },
            { id: 'product:delete', name: '删除商品' },
            { id: 'product:category', name: '分类管理' },
            { id: 'product:brand', name: '品牌管理' },
        ],
    },
    {
        id: 'order',
        name: '订单管理',
        children: [
            { id: 'order:list', name: '订单列表' },
            { id: 'order:detail', name: '订单详情' },
            { id: 'order:ship', name: '订单发货' },
            { id: 'order:refund', name: '售后管理' },
        ],
    },
    {
        id: 'community',
        name: '社区管理',
        children: [
            { id: 'community:post', name: '动态管理' },
            { id: 'community:comment', name: '评论管理' },
            { id: 'community:topic', name: '话题管理' },
            { id: 'community:report', name: '举报处理' },
        ],
    },
    {
        id: 'content',
        name: '内容管理',
        children: [
            { id: 'content:article', name: '文章管理' },
            { id: 'content:banner', name: 'Banner管理' },
        ],
    },
    {
        id: 'marketing',
        name: '营销管理',
        children: [
            { id: 'marketing:coupon', name: '优惠券管理' },
            { id: 'marketing:activity', name: '活动管理' },
        ],
    },
    {
        id: 'stats',
        name: '数据统计',
        children: [
            { id: 'stats:dashboard', name: '数据概览' },
            { id: 'stats:user', name: '用户分析' },
            { id: 'stats:product', name: '商品分析' },
            { id: 'stats:finance', name: '财务报表' },
        ],
    },
])

const checkedPermissions = ref<string[]>([])
const currentRole = ref<Role | null>(null)

// 获取数据
const fetchData = async () => {
    loading.value = true
    try {
        // 模拟数据
        tableData.value = [
            {
                id: 1,
                name: '超级管理员',
                code: 'super_admin',
                description: '拥有系统全部权限',
                status: 1,
                createdAt: '2024-01-01 10:00:00',
            },
            {
                id: 2,
                name: '运营人员',
                code: 'operator',
                description: '负责商品、订单、内容、营销管理',
                status: 1,
                createdAt: '2024-01-05 14:20:00',
            },
            {
                id: 3,
                name: '客服人员',
                code: 'customer_service',
                description: '负责用户、订单、售后管理',
                status: 1,
                createdAt: '2024-01-10 09:15:00',
            },
            {
                id: 4,
                name: '财务人员',
                code: 'finance',
                description: '只读订单和财务数据',
                status: 1,
                createdAt: '2024-01-15 11:30:00',
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
        code: '',
        description: '',
        status: 1,
    })
    dialogVisible.value = true
}

// 编辑
const handleEdit = (row: Role) => {
    isEdit.value = true
    Object.assign(form, row)
    dialogVisible.value = true
}

// 提交
const handleSubmit = async () => {
    if (!formRef.value) return

    try {
        await formRef.value.validate()
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
const handleDelete = async (row: Role) => {
    try {
        await ElMessageBox.confirm(`确定要删除角色"${row.name}"吗?`, '提示', {
            type: 'warning',
        })

        // TODO: 调用API
        ElMessage.success('删除成功')
        fetchData()
    } catch {
        // 取消删除
    }
}

// 权限配置
const handlePermission = (row: Role) => {
    currentRole.value = row

    // 模拟已有权限
    if (row.code === 'super_admin') {
        checkedPermissions.value = permissionTree.value.flatMap((item) =>
            item.children.map((child: any) => child.id)
        )
    } else if (row.code === 'operator') {
        checkedPermissions.value = ['product:list', 'product:add', 'product:edit', 'order:list', 'content:article', 'marketing:coupon']
    } else if (row.code === 'customer_service') {
        checkedPermissions.value = ['user:list', 'order:list', 'order:refund']
    } else {
        checkedPermissions.value = ['stats:dashboard', 'stats:finance']
    }

    permissionVisible.value = true
}

// 保存权限
const handleSavePermission = async () => {
    const checkedKeys = treeRef.value.getCheckedKeys()

    // TODO: 调用API保存权限
    console.log('保存权限:', checkedKeys)

    ElMessage.success('权限配置保存成功')
    permissionVisible.value = false
}

onMounted(() => {
    fetchData()
})
</script>

<style scoped lang="scss">
.admin-roles {
    .page-title {
        margin: 0 0 20px 0;
        font-size: 20px;
        font-weight: 600;
    }

    .toolbar {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
}
</style>
