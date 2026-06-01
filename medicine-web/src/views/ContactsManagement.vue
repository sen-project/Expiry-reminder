<template>
  <div class="contacts-management-container">
    <div class="page-header">
      <h1>通知人员设置</h1>
      <p>管理药品过期通知的接收人员</p>
    </div>
    
    <div class="card">
      <div class="card-title">
        <el-icon :size="18" color="#3b82f6"><Message /></el-icon>
        <span>通知人员列表</span>
      </div>
      
      <div class="form-section">
        <el-form
          :model="contactForm"
          :rules="rules"
          ref="contactFormRef"
          label-width="100px"
        >
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="邮箱" prop="contactEmail">
                <el-input
                  v-model="contactForm.contactEmail"
                  placeholder="请输入邮箱地址"
                  clearable
                />
              </el-form-item>
              
              <el-form-item label="关系类型">
                <el-input
                  v-model="contactForm.relationType"
                  placeholder="请输入关系类型"
                  clearable
                />
              </el-form-item>
            </el-col>
            
            <el-col :span="12">
              <el-form-item label="是否接收通知">
                <el-switch
                  v-model="contactForm.isNotify"
                  active-text="是"
                  inactive-text="否"
                />
              </el-form-item>
              
              <el-form-item>
                <div style="margin-top: 24px;"></div>
              </el-form-item>
            </el-col>
          </el-row>
          
          <el-form-item>
            <el-button type="primary" @click="submitForm" :loading="loading">
              {{ isEditing ? '更新人员' : '添加人员' }}
            </el-button>
            <el-button @click="resetForm">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
      
      <div class="list-section">
        <el-table
          :data="contacts"
          stripe
          border
          style="width: 100%"
          v-loading="tableLoading"
        >
          <el-table-column type="index" label="序号" width="60" align="center" />
          <el-table-column prop="relation_email" label="邮箱" min-width="200" />
          <el-table-column prop="relation_type" label="关系类型" width="120">
            <template #default="{ row }">
              <el-tag size="small">
                {{ row.relation_type || '未设置' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="is_notify" label="是否接收通知" width="120" align="center">
            <template #default="{ row }">
              <el-tag :type="row.is_notify === 1 ? 'success' : 'danger'" size="small">
                {{ row.is_notify === 1 ? '是' : '否' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="created_at" label="创建时间" width="180">
            <template #default="{ row }">
              {{ formatTime(row.created_at) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="180" align="center">
            <template #default="{ row }">
              <el-button
                type="warning"
                size="small"
                @click="handleEdit(row)"
              >
                编辑
              </el-button>
              <el-button
                type="danger"
                size="small"
                @click="handleDelete(row)"
                style="margin-left: 8px"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        
        <div v-if="contacts.length === 0 && !tableLoading" class="empty-state">
          <el-empty description="暂无通知人员，请添加" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Message } from '@element-plus/icons-vue'
import { getContacts, addContact, updateContact, deleteContact } from '@/api/index.js'

// 表单数据
const contactForm = ref({
  contactEmail: '',
  relationType: '',
  isNotify: true
})

// 验证规则
const rules = {
  contactEmail: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ]
}

// 状态
const loading = ref(false)
const tableLoading = ref(false)
const isEditing = ref(false)
const currentEditingEmail = ref('')
const contactFormRef = ref(null)

// 通知人员列表
const contacts = ref([])

/**
 * 格式化时间
 * @param {string} timeStr - 时间字符串
 * @returns {string} 格式化后的时间
 */
const formatTime = (timeStr) => {
  if (!timeStr) return ''
  const date = new Date(timeStr)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

/**
 * 加载联系人列表
 */
const loadContacts = async () => {
  tableLoading.value = true
  try {
    const res = await getContacts()
    if (res.code === 200 && res.data) {
      contacts.value = res.data
    } else {
      contacts.value = []
    }
  } catch (error) {
    console.error('加载联系人失败:', error)
    ElMessage.error('加载联系人失败')
    contacts.value = []
  } finally {
    tableLoading.value = false
  }
}

/**
 * 提交表单
 */
const submitForm = async () => {
  if (!contactFormRef.value) return
  
  try {
    await contactFormRef.value.validate()
    loading.value = true
    
    if (isEditing.value) {
      // 更新人员
      const res = await updateContact({
        contactEmail: currentEditingEmail.value,
        relationType: contactForm.value.relationType,
        isNotify: contactForm.value.isNotify?1:0
      })
      if (res.code === 200) {
        ElMessage.success('人员信息更新成功！')
        await loadContacts()
        resetForm()
      } else {
        ElMessage.error(res.msg || '更新失败')
      }
    } else {
      // 添加人员
      const res = await addContact(contactForm.value)
      if (res.code === 200) {
        ElMessage.success('人员添加成功！')
        await loadContacts()
        resetForm()
      } else {
        ElMessage.error(res.msg || '添加失败')
      }
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('操作失败:', error)
      ElMessage.error('操作失败，请重试！')
    }
  } finally {
    loading.value = false
  }
}

/**
 * 重置表单
 */
const resetForm = () => {
  contactFormRef.value?.resetFields()
  contactForm.value = {
    contactEmail: '',
    relationType: '',
    isNotify: true
  }
  isEditing.value = false
  currentEditingEmail.value = ''
}

/**
 * 编辑人员
 * @param {Object} contact - 人员信息
 */
const handleEdit = (contact) => {
  isEditing.value = true
  currentEditingEmail.value = contact.relation_email
  contactForm.value = {
    contactEmail: contact.relation_email,
    relationType: contact.relation_type || '',
    isNotify: contact.is_notify == 1 ? true : false
  }
  // 滚动到表单顶部
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

/**
 * 删除人员
 * @param {Object} contact - 人员信息
 */
const handleDelete = async (contact) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除邮箱为${contact.relation_email}的通知人员吗？`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    const res = await deleteContact({ contactEmail: contact.relation_email })
    if (res.code === 200) {
      ElMessage.success('人员删除成功！')
      await loadContacts()
    } else {
      ElMessage.error(res.msg || '删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
      ElMessage.error('删除失败，请重试！')
    }
  }
}

/**
 * 页面挂载
 */
onMounted(() => {
  loadContacts()
})
</script>

<style scoped>
.contacts-management-container {
  padding: 24px;
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.page-header {
  margin-bottom: 32px;
}

.page-header h1 {
  font-size: 28px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 8px 0;
}

.page-header p {
  font-size: 16px;
  color: #64748b;
  margin: 0;
}

.card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.15);
}

.card-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 18px;
  font-weight: 600;
  color: #2563eb;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid #eff6ff;
}

.form-section {
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid #e2e8f0;
}

:deep(.el-input__wrapper) {
  border-radius: 8px;
  transition: all 0.3s ease;
}

:deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px #3b82f6 inset;
}

:deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #3b82f6 inset;
}

:deep(.el-select .el-input__wrapper) {
  border-radius: 8px;
}

.empty-state {
  padding: 40px 20px;
  text-align: center;
}

:deep(.el-empty__description) {
  color: #94a3b8;
}

:deep(.el-table) {
  border-radius: 8px;
  overflow: hidden;
}

:deep(.el-table th) {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  font-weight: 600;
  color: #334155;
}

:deep(.el-table tr:hover > td) {
  background-color: #f8fafc;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .el-row {
    flex-direction: column;
  }
  
  .el-col {
    width: 100% !important;
  }
}

@media (max-width: 768px) {
  .contacts-management-container {
    padding: 16px;
    max-width: 100vw;
    overflow-x: hidden;
  }
  
  .page-header h1 {
    font-size: 24px;
  }
  
  .page-header p {
    font-size: 14px;
  }
  
  .card {
    padding: 16px;
    max-width: 100%;
    overflow-x: hidden;
  }
  
  .card-title {
    font-size: 16px;
  }
  
  :deep(.el-row) {
    flex-direction: column;
  }
  
  :deep(.el-col) {
    width: 100% !important;
    max-width: 100%;
  }
  
  :deep(.el-form) {
    max-width: 100%;
  }
  
  :deep(.el-form-item) {
    margin-bottom: 18px;
    display: flex;
    align-items: center;
  }
  
  :deep(.el-form-item__label) {
    width: 80px !important;
    font-size: 13px;
    flex-shrink: 0;
    margin-right: 12px;
  }
  
  :deep(.el-form-item__content) {
    margin-left: 0 !important;
    flex: 1;
    min-width: 0;
  }
  
  :deep(.el-input),
  :deep(.el-select) {
    width: 100% !important;
    max-width: 100%;
  }
  
  :deep(.el-input__wrapper) {
    width: 100% !important;
  }
  
  :deep(.el-table) {
    font-size: 12px;
  }
  
  :deep(.el-button--small) {
    padding: 5px 8px;
    font-size: 12px;
  }
  
  .list-section {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
  
  :deep(.el-table) {
    min-width: 800px;
  }
}

@media (max-width: 480px) {
  .contacts-management-container {
    padding: 12px;
  }
  
  .card {
    padding: 12px;
  }
  
  :deep(.el-form-item__label) {
    width: 70px !important;
    font-size: 12px;
  }
  
  :deep(.el-button) {
    width: 100%;
    margin-bottom: 8px;
  }
  
  :deep(.el-button + .el-button) {
    margin-left: 0 !important;
  }
}
</style>