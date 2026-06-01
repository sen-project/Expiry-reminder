<template>
  <div class="contacts-manager">
    <el-dialog
      v-model="dialogVisible"
      title="通知人员设置"
      width="600px"
      :close-on-click-modal="false"
    >
      <div class="dialog-content">
        <!-- 添加亲友表单 -->
        <el-form :model="contactForm" :rules="rules" ref="contactFormRef" label-width="100px">
          <el-form-item label="亲友邮箱" prop="contactEmail">
            <el-input v-model="contactForm.contactEmail" placeholder="请输入亲友邮箱" />
          </el-form-item>
          <el-form-item label="关系类型" prop="relationType">
            <el-input v-model="contactForm.relationType" placeholder="请输入关系类型（家人/配偶/父母/子女等）" />
          </el-form-item>
          <el-form-item label="是否发送预警邮件">
            <el-switch v-model="contactForm.isNotify" active-value="1" inactive-value="0" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="editingContact ? handleSaveContact() : handleAddContact()" :loading="loading">
              {{ editingContact ? '保存' : '添加亲友' }}
            </el-button>
            <el-button @click="resetForm">重置</el-button>
          </el-form-item>
        </el-form>

        <!-- 亲友列表 -->
        <div class="contacts-list">
          <h3>亲友列表</h3>
          <el-table :data="contactsList" style="width: 100%" v-loading="loading">
            <el-table-column prop="relation_email" label="邮箱" width="200" />
            <el-table-column prop="relation_type" label="关系类型" width="120" />
            <el-table-column prop="is_notify" label="是否通知" width="100">
              <template #default="scope">
                <el-switch 
                  v-model="scope.row.is_notify" 
                  active-value="1" 
                  inactive-value="0"
                  @change="handleToggleNotify(scope.row)"
                />
              </template>
            </el-table-column>
            <el-table-column prop="created_at" label="创建时间" width="180" />
            <el-table-column label="操作" width="150">
              <template #default="scope">
                <el-button type="primary" size="small" @click="handleEditContact(scope.row)">编辑</el-button>
                <el-button type="danger" size="small" @click="handleDeleteContact(scope.row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { addContact, deleteContact, updateContact, getContacts } from '@/api/index.js'

// 组件属性
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  }
})

// 组件事件
const emit = defineEmits(['update:visible'])

// 响应式数据
const dialogVisible = ref(false)
const contactForm = ref({
  contactEmail: '',
  relationType: '',
  isNotify: '1'
})
const contactsList = ref([])
const loading = ref(false)
const contactFormRef = ref(null)
const editingContact = ref(null)

// 表单验证规则
const rules = {
  contactEmail: [
    { required: true, message: '请输入亲友邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  relationType: [
    { required: true, message: '请输入关系类型', trigger: 'blur' }
  ]
}

// 监听visible属性变化
watch(() => props.visible, (newVal) => {
  dialogVisible.value = newVal
  if (newVal) {
    getContactsList()
  }
})

// 监听dialogVisible变化，通知父组件
watch(dialogVisible, (newVal) => {
  emit('update:visible', newVal)
})

// 获取亲友列表
const getContactsList = async () => {
  loading.value = true
  try {
    const response = await getContacts()
    if (response.code === 200) {
      contactsList.value = response.data
    } else {
      ElMessage.error(response.msg || '获取亲友列表失败')
    }
  } catch (error) {
    console.error('获取亲友列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 添加亲友
const handleAddContact = async () => {
  await contactFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        const response = await addContact(contactForm.value)
        if (response.code === 200) {
          ElMessage.success('添加亲友成功')
          resetForm()
          await getContactsList()
        } else {
          ElMessage.error(response.msg || '添加亲友失败')
        }
      } catch (error) {
        console.error('添加亲友失败:', error)
      } finally {
        loading.value = false
      }
    }
  })
}

// 删除亲友
const handleDeleteContact = async (contact) => {
  try {
    await ElMessageBox.confirm('确定要删除该亲友吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    loading.value = true
    const response = await deleteContact({ contactEmail: contact.relation_email })
    if (response.code === 200) {
      ElMessage.success('删除亲友成功')
      await getContactsList()
    } else {
      ElMessage.error(response.msg || '删除亲友失败')
    }
  } catch (error) {
    if (error.message !== 'cancel') {
      console.error('删除亲友失败:', error)
    }
  } finally {
    loading.value = false
  }
}

// 编辑亲友
const handleEditContact = (contact) => {
  editingContact.value = contact
  contactForm.value = {
    contactEmail: contact.relation_email,
    relationType: contact.relation_type,
    isNotify: contact.is_notify.toString()
  }
}

// 保存编辑的亲友信息
const handleSaveContact = async () => {
  if (!editingContact.value) return
  
  await contactFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        const response = await updateContact({
          contactEmail: contactForm.value.contactEmail,
          relationType: contactForm.value.relationType,
          isNotify: contactForm.value.isNotify
        })
        if (response.code === 200) {
          ElMessage.success('更新亲友信息成功')
          resetForm()
          await getContactsList()
        } else {
          ElMessage.error(response.msg || '更新亲友信息失败')
        }
      } catch (error) {
        console.error('更新亲友信息失败:', error)
      } finally {
        loading.value = false
      }
    }
  })
}

// 切换通知状态
const handleToggleNotify = async (contact) => {
  loading.value = true
  try {
    const response = await updateContact({
      contactEmail: contact.relation_email,
      isNotify: contact.is_notify
    })
    if (response.code !== 200) {
      ElMessage.error(response.msg || '更新通知状态失败')
      contact.is_notify = contact.is_notify === '1' ? '0' : '1'
    }
  } catch (error) {
    console.error('更新通知状态失败:', error)
    contact.is_notify = contact.is_notify === '1' ? '0' : '1'
  } finally {
    loading.value = false
  }
}

// 重置表单
const resetForm = () => {
  contactFormRef.value.resetFields()
  contactForm.value = {
    contactEmail: '',
    relationType: '',
    isNotify: '1'
  }
  editingContact.value = null
}

// 初始化
onMounted(() => {
  if (props.visible) {
    getContactsList()
  }
})
</script>

<style scoped>
.contacts-manager {
  .dialog-content {
    .contacts-list {
      margin-top: 30px;
      h3 {
        margin-bottom: 15px;
        font-size: 16px;
        font-weight: 600;
        color: #333;
      }
    }
  }
}
</style>