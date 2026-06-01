<template>
  <div class="medicine-management-container">
    <div class="page-header">
      <h1>药品管理</h1>
      <p>添加、编辑和管理药品信息</p>
      <el-button type="primary" @click="openAddDialog">
        <el-icon><Plus /></el-icon>
        添加药品
      </el-button>
    </div>
    
    <!-- 药品列表 -->
    <div class="list-section">
      <div class="card">
        <div class="card-title">
          <el-icon :size="18" color="#3b82f6"><List /></el-icon>
          <span>药品列表</span>
        </div>
        
        <div class="search-section">
          <el-input
            v-model="searchKeyword"
            placeholder="输入药品名称或症状进行搜索"
            clearable
            @input="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>
        
        <div v-if="loading" class="skeleton-container">
          <div v-for="i in 5" :key="i" class="skeleton-item">
            <div class="skeleton skeleton-text" style="width: 80%"></div>
            <div class="skeleton skeleton-text" style="width: 60%"></div>
            <div class="skeleton skeleton-text" style="width: 70%"></div>
          </div>
        </div>
        
        <div v-else class="table-container">
          <el-table
            :data="sortedMedicines"
            border
            style="width: 100%"
            :row-class-name="getRowClassName"
            @sort-change="handleSortChange"
          >
            <el-table-column type="index" label="序号" width="60" align="center" />
            <el-table-column prop="name" label="药品名称" min-width="120" />
            <el-table-column prop="note" label="症状" min-width="120" />
            <el-table-column prop="type" label="分类" width="100" align="center" sortable>
              <template #default="{ row }">
                <el-tag :type="row.type === 'human' ? 'primary' : 'warning'" size="small">
                  {{ row.type === 'human' ? '人用药' : '宠物药' }}
                </el-tag>
              </template>
            </el-table-column>
            
            <el-table-column prop="expiry_date" label="有效期至" width="120" sortable />
            
            <el-table-column prop="location" label="存放位置" width="120" />
            
            <el-table-column prop="remain_num" label="剩余数量" width="100" sortable>
              <template #default="{ row }">
                {{ row.remain_num }}{{ row.unit || '' }}
              </template>
            </el-table-column>
            
            <el-table-column label="照片" width="80" align="center">
              <template #default="{ row }">
                <div class="image-container">
                  <el-image
                    v-if="row.image"
                    :src="row.image"
                    :preview-src-list="[row.image]"
                    :preview-teleported="true"
                    fit="cover"
                    style="width: 40px; height: 40px; border-radius: 6px; cursor: pointer"
                  >
                    <template #error>
                      <div class="image-error">
                        <el-icon><Picture /></el-icon>
                      </div>
                    </template>
                  </el-image>
                  <span v-else style="color: #666; font-size: 12px">无照片</span>
                </div>
              </template>
            </el-table-column>
            
            <el-table-column prop="expiry_date" label="状态" width="140" align="center" sortable>
              <template #default="{ row }">
                <el-tag
                  :type="getStatusType(row.expiry_date)"
                  size="small"
                >
                  {{ getStatusText(row.expiry_date) }}
                </el-tag>
              </template>
            </el-table-column>
            
            <el-table-column label="操作" width="120" align="center" fixed="right">
              <template #default="{ row }">
                <el-button
                  type="warning"
                  size="small"
                  :icon="Edit"
                  @click="handleEdit(row)"
                >
                  编辑
                </el-button>
                <el-button
                  type="danger"
                  size="small"
                  :icon="Delete"
                  @click="handleDelete(row)"
                  style="margin-left: 0"
                >
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
          
          <div v-if="filteredMedicines.length === 0" class="empty-state">
            <el-empty :description="searchKeyword ? '未找到匹配的药品信息' : '暂无药品信息，先录入或导入Excel吧~'" />
          </div>
          
          <div class="total-info">
            共 {{ filteredMedicines.length }} 条记录
          </div>
        </div>
      </div>
    </div>
    
    <!-- 药品表单弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEditing ? '编辑药品' : '添加药品'"
      :width="isMobile ? '95%' : '700px'"
      :close-on-click-modal="false"
      class="medicine-dialog"
    >
      <el-form
        :model="medicineForm"
        :rules="rules"
        ref="medicineFormRef"
        label-width="100px"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="药品名称" prop="name">
              <el-input
                v-model="medicineForm.name"
                placeholder="请输入药品名称"
                clearable
                @blur="handleNameBlur"
                :loading="queryLoading"
              />
            </el-form-item>
            
            <el-form-item label="药品分类" prop="type">
              <el-radio-group v-model="medicineForm.type">
                <el-radio label="human">人用药</el-radio>
                <el-radio label="pet">宠物药</el-radio>
              </el-radio-group>
            </el-form-item>
            
            <el-form-item label="生产日期" prop="produceDate">
              <el-date-picker
                v-model="medicineForm.produceDate"
                type="date"
                placeholder="选择日期"
                style="width: 100%"
              />
            </el-form-item>
            
            <el-form-item label="有效期至" prop="expireDate">
              <el-date-picker
                v-model="medicineForm.expireDate"
                type="date"
                placeholder="选择日期"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          
          <el-col :span="12">
            <el-form-item label="存放位置" prop="location">
              <el-input
                v-model="medicineForm.location"
                placeholder="请输入存放位置"
                clearable
              />
            </el-form-item>
            
            <el-form-item label="剩余数量" prop="remainNum">
              <el-input
                v-model="medicineForm.remainNum"
                placeholder="请输入剩余数量"
                clearable
              />
            </el-form-item>
            
            <el-form-item label="单位" prop="unit">
              <el-input
                v-model="medicineForm.unit"
                placeholder="例如：粒、片、瓶"
                clearable
              />
            </el-form-item>
            
            <el-form-item label="备注" prop="remark">
              <el-input
                v-model="medicineForm.remark"
                type="textarea"
                placeholder="请输入备注信息"
                rows="3"
              />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="照片">
          <div class="photo-upload">
            <el-upload
              class="avatar-uploader"
              action=""
              :auto-upload="false"
              :show-file-list="false"
              :on-change="handlePhotoUpload"
            >
              <img
                v-if="medicineForm.photoUrl"
                :src="medicineForm.photoUrl"
                class="avatar"
              />
              <div v-else class="avatar-placeholder">
                <el-icon><Camera /></el-icon>
                <span>点击上传照片</span>
              </div>
            </el-upload>
            <el-button
              v-if="medicineForm.photoUrl"
              type="danger"
              size="small"
              @click="clearPhoto"
            >
              清除照片
            </el-button>
          </div>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm" :loading="loading">
            {{ isEditing ? '保存修改' : '添加药品' }}
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useMedicineStore } from '@/stores/medicine'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, List, Search, Edit, Delete, Camera, Picture, ArrowDown, ArrowUp } from '@element-plus/icons-vue'
import { getMedicineInfo } from '@/api'

// 状态管理
const medicineStore = useMedicineStore()
const medicineFormRef = ref(null)

// 表单数据
const medicineForm = ref({
  name: '',
  type: 'human',
  produceDate: '',
  expireDate: '',
  location: '',
  remainNum: '',
  unit: '',
  remark: '',
  photoUrl: ''
})

// 验证规则
const rules = {
  name: [
    { required: true, message: '请输入药品名称', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择药品分类', trigger: 'change' }
  ],
  expireDate: [
    { required: true, message: '请选择有效期至', trigger: 'change' }
  ]
}

// 状态
const loading = ref(false)
const isEditing = ref(false)
const currentEditingId = ref('')
const searchKeyword = ref('')
const queryLoading = ref(false)
const dialogVisible = ref(false)
const isMobile = ref(window.innerWidth < 768)

// 排序状态
const sortConfig = ref({
  prop: '',
  order: ''
})

/**
 * 过滤后的药品列表
 */
const filteredMedicines = computed(() => {
  let medicines = [...medicineStore.medicines]
  
  // 搜索过滤
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase().trim()
    medicines = medicines.filter(med => {
      if (med.name && med.name.toLowerCase().includes(keyword)) {
        return true
      }
      if (med.note && med.note.toLowerCase().includes(keyword)) {
        return true
      }
      return false
    })
  }
  
  // 按有效期排序
  medicines = medicines.sort((a, b) => {
    const dateA = new Date(a.expiry_date)
    const dateB = new Date(b.expiry_date)
    return dateA - dateB
  })
  
  return medicines
})

/**
 * 处理照片上传
 * @param {File} file - 上传的文件
 */
const handlePhotoUpload = async (file) => {
  try {
    const photoUrl = await medicineStore.uploadPhoto(file.raw)
    medicineForm.value.photoUrl = photoUrl
  } catch (error) {
    ElMessage.error('照片上传失败，请重试')
  }
}

/**
 * 清除照片
 */
const clearPhoto = () => {
  medicineForm.value.photoUrl = ''
}

/**
 * 打开添加药品弹窗
 */
const openAddDialog = () => {
  isEditing.value = false
  currentEditingId.value = ''
  resetForm()
  dialogVisible.value = true
}

/**
 * 提交表单
 */
const submitForm = async () => {
  if (!medicineFormRef.value) return
  
  try {
    await medicineFormRef.value.validate()
    loading.value = true
    
    if (isEditing.value) {
      // 更新药品
      await medicineStore.updateMedicine(currentEditingId.value, medicineForm.value)
      ElMessage.success('药品更新成功！')
    } else {
      // 添加药品
      await medicineStore.addMedicine(medicineForm.value)
      ElMessage.success('药品添加成功！')
    }
    
    dialogVisible.value = false
    resetForm()
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
  medicineFormRef.value?.resetFields()
  medicineForm.value = {
    name: '',
    type: 'human',
    produceDate: '',
    expireDate: '',
    location: '',
    remainNum: '',
    unit: '',
    remark: '',
    photoUrl: ''
  }
  isEditing.value = false
  currentEditingId.value = ''
}

/**
 * 编辑药品
 * @param {Object} medicine - 药品数据
 */
const handleEdit = (medicine) => {
  isEditing.value = true
  currentEditingId.value = medicine.id
  medicineForm.value = {
    name: medicine.name || '',
    type: medicine.type || 'human',
    produceDate: medicine.purchase_date || '',
    expireDate: medicine.expiry_date || '',
    location: medicine.location || '',
    remainNum: medicine.remain_num || '',
    unit: medicine.unit || '',
    remark: medicine.note || '',
    photoUrl: medicine.image || ''
  }
  dialogVisible.value = true
}

/**
 * 删除药品
 * @param {Object} medicine - 药品数据
 */
const handleDelete = async (medicine) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除药品"${medicine.name}"吗？`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await medicineStore.deleteMedicine(medicine.id)
    ElMessage.success('药品删除成功！')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
      ElMessage.error('删除失败，请重试！')
    }
  }
}

/**
 * 处理药品名称输入完成
 */
const handleNameBlur = async () => {
  if (!medicineForm.value.name.trim()) return
  
  try {
    queryLoading.value = true
    const response = await getMedicineInfo(medicineForm.value.name)
    if (response.code === 200 && response.data.symptoms) {
      medicineForm.value.remark = response.data.symptoms
    }
  } catch (error) {
    console.error('查询药品信息失败:', error)
  } finally {
    queryLoading.value = false
  }
}

/**
 * 处理搜索
 */
const handleSearch = () => {
  // 搜索功能已改为前端过滤，无需重新请求数据
}

/**
 * 处理排序
 * @param {Object} sort - 排序信息
 */
const handleSortChange = (sort) => {
  sortConfig.value = sort
}

/**
 * 排序后的药品列表
 */
const sortedMedicines = computed(() => {
  let medicines = [...filteredMedicines.value]
  
  if (sortConfig.value.prop && sortConfig.value.order) {
    const { prop, order } = sortConfig.value
    const isAsc = order === 'ascending'
    
    medicines = medicines.sort((a, b) => {
      let valueA = a[prop]
      let valueB = b[prop]
      
      // 特殊处理剩余数量（转换为数字）
      if (prop === 'remain_num') {
        valueA = Number(valueA) || 0
        valueB = Number(valueB) || 0
        return isAsc ? valueA - valueB : valueB - valueA
      }
      
      // 特殊处理日期（转换为日期对象）
      if (prop === 'expiry_date') {
        const dateA = new Date(valueA)
        const dateB = new Date(valueB)
        return isAsc ? dateA - dateB : dateB - dateA
      }
      
      // 字符串排序
      if (typeof valueA === 'string' && typeof valueB === 'string') {
        return isAsc 
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA)
      }
      
      // 默认排序
      return 0
    })
  }
  
  return medicines
})

/**
 * 获取行样式类名
 * @param {Object} row - 行数据
 * @returns {string} 样式类名
 */
const getRowClassName = ({ row }) => {
  // 检查剩余数量是否为0
  if (row.remain_num === 0 || row.remain_num === '0') {
    return 'expired'
  }
  
  // 检查过期状态
  const status = medicineStore.getExpireStatus(row.expiry_date)
  return status.class
}

/**
 * 获取状态类型
 * @param {string} expireDate - 过期日期
 * @returns {string} 状态类型
 */
const getStatusType = (expireDate) => {
  const status = medicineStore.getExpireStatus(expireDate)
  if (status.class === 'expired') return 'danger'
  if (status.class === 'expire-soon') return 'warning'
  return 'success'
}

/**
 * 获取状态文本
 * @param {string} expireDate - 过期日期
 * @returns {string} 状态文本
 */
const getStatusText = (expireDate) => {
  const status = medicineStore.getExpireStatus(expireDate)
  return status.text
}

// 监听药品列表变化，显示加载动画
watch(() => medicineStore.medicines, () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
  }, 300)
}, { immediate: true })

// 监听窗口大小变化
window.addEventListener('resize', () => {
  isMobile.value = window.innerWidth < 768
})
</script>

<style scoped>
.medicine-management-container {
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
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 32px;
  flex-wrap: wrap;
  gap: 16px;
}

.page-header h1 {
  font-size: 28px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 8px 0;
  flex: 1;
}

.page-header p {
  font-size: 16px;
  color: #64748b;
  margin: 0;
  flex: 1;
}

.page-header .el-button {
  flex-shrink: 0;
}

/* 弹窗响应式样式 */
:deep(.medicine-dialog .el-dialog__body) {
  padding: 20px;
  max-height: 80vh;
  overflow-y: auto;
}

:deep(.medicine-dialog .el-form) {
  max-width: 100%;
  overflow-x: hidden;
}

:deep(.medicine-dialog .el-row) {
  flex-direction: column;
}

:deep(.medicine-dialog .el-col) {
  width: 100% !important;
  margin-bottom: 16px;
}

:deep(.medicine-dialog .el-form-item) {
  margin-bottom: 18px;
}

:deep(.medicine-dialog .el-form-item__label) {
  width: 80px !important;
  font-size: 13px;
  flex-shrink: 0;
  margin-right: 12px;
}

:deep(.medicine-dialog .el-form-item__content) {
  margin-left: 0 !important;
  flex: 1;
  min-width: 0;
}

:deep(.medicine-dialog .el-input),
:deep(.medicine-dialog .el-select),
:deep(.medicine-dialog .el-date-picker) {
  width: 100% !important;
  max-width: 100%;
}

:deep(.medicine-dialog .el-input__wrapper) {
  width: 100% !important;
}

:deep(.medicine-dialog .el-textarea__inner) {
  width: 100% !important;
  max-width: 100%;
}

:deep(.medicine-dialog .photo-upload) {
  flex-direction: column;
  align-items: flex-start;
}

.form-section {
  margin-bottom: 32px;
}

.list-section {
  margin-bottom: 24px;
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

.search-section {
  margin-bottom: 20px;
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

.photo-upload {
  display: flex;
  align-items: center;
  gap: 16px;
}

.avatar-uploader {
  flex-shrink: 0;
}

.avatar {
  width: 100px;
  height: 100px;
  border-radius: 8px;
  object-fit: cover;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px dashed #e2e8f0;
}

.avatar:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.avatar-placeholder {
  width: 100px;
  height: 100px;
  border: 2px dashed #e2e8f0;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #f8fafc;
}

.avatar-placeholder:hover {
  border-color: #3b82f6;
  color: #3b82f6;
  background: #eff6ff;
}

.avatar-placeholder .el-icon {
  font-size: 24px;
  margin-bottom: 8px;
}

.avatar-placeholder span {
  font-size: 12px;
}

.skeleton-container {
  padding: 20px;
}

.skeleton-item {
  padding: 16px;
  border-bottom: 1px solid #f1f5f9;
}

.skeleton-item:last-child {
  border-bottom: none;
}

.skeleton-text {
  height: 16px;
  margin-bottom: 8px;
  background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  border-radius: 4px;
}

@keyframes loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

.table-container {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

:deep(.el-table) {
  border-radius: 8px;
}

:deep(.el-table th) {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  font-weight: 600;
  color: #334155;
}

:deep(.el-table tr:hover > td) {
  background-color: #f8fafc;
}

/* 过期状态行样式 */
:deep(.el-table__row.expired) {
  background-color: #fec2c2 !important;
}

:deep(.el-table__row.expired:hover > td) {
  background-color: #fee2e2 !important;
}

/* 即将过期状态行样式 */
:deep(.el-table__row.expire-soon) {
  background-color: #fef3c7 !important;
}

:deep(.el-table__row.expire-soon:hover > td) {
  background-color: #fef9c3 !important;
}

.image-error {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f1f5f9;
  border-radius: 6px;
  color: #cbd5e1;
}

.image-container {
  position: relative;
  z-index: 1;
}

/* 确保图片预览的层级最高 */
:deep(.el-image-viewer__) {
  z-index: 9999 !important;
}

/* 确保表格和按钮的层级低于图片预览 */
:deep(.el-table) {
  position: relative;
  z-index: 1;
}

:deep(.el-table__fixed-right) {
  position: relative;
  z-index: 2;
}

.empty-state {
  padding: 40px 20px;
  text-align: center;
}

:deep(.el-empty__description) {
  color: #94a3b8;
}

.total-info {
  margin-top: 16px;
  padding: 12px 16px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 8px;
  text-align: right;
  color: #64748b;
  font-size: 14px;
  font-weight: 500;
  border: 1px solid #e2e8f0;
}

:deep(.el-pagination .el-pager li) {
  border-radius: 6px;
  transition: all 0.3s ease;
}

:deep(.el-pagination .el-pager li:hover) {
  color: #3b82f6;
}

:deep(.el-pagination .el-pager li.active) {
  background-color: #3b82f6;
  color: white;
  border-radius: 6px;
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
  .medicine-management-container {
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
  :deep(.el-select),
  :deep(.el-date-picker) {
    width: 100% !important;
    max-width: 100%;
  }
  
  :deep(.el-input__wrapper) {
    width: 100% !important;
  }
  
  :deep(.el-textarea__inner) {
    width: 100% !important;
    max-width: 100%;
  }
  
  :deep(.el-table) {
    font-size: 12px;
  }
  
  :deep(.el-button--small) {
    padding: 5px 8px;
    font-size: 12px;
  }
  
  .photo-upload {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .table-container {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
  
  :deep(.el-table) {
    min-width: 800px;
  }
}

@media (max-width: 480px) {
  .medicine-management-container {
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