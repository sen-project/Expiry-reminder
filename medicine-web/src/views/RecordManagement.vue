<template>
  <div class="record-management-container">
    <div class="page-header">
      <h1>使用记录</h1>
      <p>管理药品使用记录</p>
    </div>
    
    <!-- 添加记录表单 -->
    <div class="form-section">
      <div class="card">
        <div class="card-title">
          <el-icon :size="18" color="#3b82f6"><Plus /></el-icon>
          <span>添加使用记录</span>
        </div>
        
        <el-form
          :model="recordForm"
          :rules="rules"
          ref="recordFormRef"
          label-width="100px"
        >
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="药品名称" prop="medicineId">
                <el-select
                  v-model="recordForm.medicineId"
                  placeholder="请选择药品"
                  filterable
                  clearable
                >
                  <el-option
                    v-for="medicine in medicines"
                    :key="medicine.id"
                    :label="medicine.name"
                    :value="medicine.id"
                  >
                    <div class="option-content">
                      <span>{{ medicine.name }}</span>
                      <el-tag :type="medicine.type === 'human' ? 'primary' : 'warning'" size="small" class="option-tag">
                        {{ medicine.type === 'human' ? '人用药' : '宠物药' }}
                      </el-tag>
                    </div>
                  </el-option>
                </el-select>
              </el-form-item>
              
              <el-form-item label="使用日期" prop="useDate">
                <el-date-picker
                  v-model="recordForm.useDate"
                  type="date"
                  placeholder="选择日期"
                  style="width: 100%"
                />
              </el-form-item>
              
              <el-form-item label="使用数量" prop="useNum">
                <el-input
                  v-model="recordForm.useNum"
                  placeholder="请输入使用数量"
                  clearable
                />
              </el-form-item>
            </el-col>
            
            <el-col :span="12">
              <el-form-item label="使用人" prop="usePerson">
                <el-input
                  v-model="recordForm.usePerson"
                  placeholder="请输入使用人"
                  clearable
                />
              </el-form-item>
              
              <el-form-item label="症状" prop="symptom">
                <el-input
                  v-model="recordForm.symptom"
                  placeholder="请输入症状"
                  clearable
                />
              </el-form-item>
              
              <el-form-item label="备注" prop="useRemark">
                <el-input
                  v-model="recordForm.useRemark"
                  type="textarea"
                  placeholder="请输入备注信息"
                  rows="3"
                />
              </el-form-item>
            </el-col>
          </el-row>
          
          <el-form-item>
            <el-button type="primary" @click="submitForm" :loading="loading">
              添加记录
            </el-button>
            <el-button @click="resetForm">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
    
    <!-- 记录列表 -->
    <div class="list-section">
      <div class="card">
        <div class="card-title">
          <el-icon :size="18" color="#3b82f6"><Document /></el-icon>
          <span>使用记录列表</span>
        </div>
        
        <div class="search-section">
          <el-input
            v-model="searchKeyword"
            placeholder="输入药品名称或使用人进行搜索"
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
            :data="filteredRecords"
            stripe
            border
            style="width: 100%"
          >
            <el-table-column type="index" label="序号" width="60" align="center" />
            
            <el-table-column prop="medicineName" label="药品名称" min-width="150" />
            
            <el-table-column label="分类" width="100" align="center">
              <template #default="{ row }">
                <el-tag :type="row.type === 'human' ? 'primary' : 'warning'" size="small">
                  {{ row.type === 'human' ? '人用药' : '宠物药' }}
                </el-tag>
              </template>
            </el-table-column>
            
            <el-table-column prop="useDate" label="使用日期" width="120" >
              <template #default="{ row }">
                {{ row.useDate ? new Date(row.useDate).toLocaleDateString() : '-' }}
              </template>
            </el-table-column>
            
            <el-table-column label="使用数量" width="100">
              <template #default="{ row }">
                {{ row.useNum }}{{ row.unit || '' }}
              </template>
            </el-table-column>
            
            <el-table-column prop="usePerson" label="使用人" width="120" />
            
            <el-table-column prop="symptom" label="症状" width="150" show-overflow-tooltip />
            
            <el-table-column prop="useRemark" label="备注" min-width="150" show-overflow-tooltip />
            
            <el-table-column label="记录时间" width="180">
              <template #default="{ row }">
                {{ new Date(row.createdAt).toLocaleString() }}
              </template>
            </el-table-column>
            
            <el-table-column label="操作" width="80" align="center">
              <template #default="{ row }">
                <el-button
                  type="danger"
                  size="small"
                  @click="handleDeleteRecord(row)"
                >
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
          
          <div v-if="filteredRecords.length === 0" class="empty-state">
            <el-empty description="暂无使用记录~" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useMedicineStore } from '@/stores/medicine'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Document, Search } from '@element-plus/icons-vue'

// 状态管理
const medicineStore = useMedicineStore()
const recordFormRef = ref(null)

// 表单数据
const recordForm = ref({
  medicineId: '',
  useDate: new Date(),
  useNum: '',
  usePerson: '',
  symptom: '',
  useRemark: ''
})

// 验证规则
const rules = {
  medicineId: [
    { required: true, message: '请选择药品', trigger: 'change' }
  ],
  useDate: [
    { required: true, message: '请选择使用日期', trigger: 'change' }
  ],
  useNum: [
    { required: true, message: '请输入使用数量', trigger: 'blur' }
  ]
}

// 状态
const loading = ref(false)
const searchKeyword = ref('')

// 药品列表
const medicines = computed(() => medicineStore.medicines)

/**
 * 过滤后的使用记录
 */
const filteredRecords = computed(() => {
  let records = [...medicineStore.useRecords]
  
  // 搜索过滤
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase().trim()
    records = records.filter(record => {
      if (record.medicine_name && record.medicine_name.toLowerCase().includes(keyword)) {
        return true
      }
      if (record.use_person && record.use_person.toLowerCase().includes(keyword)) {
        return true
      }
      return false
    })
  }
  
  // 按使用日期排序
  records = records.sort((a, b) => new Date(b.use_date) - new Date(a.use_date))
  
  return records.map(record => {
    return {
      ...record,
      medicineName: record.medicine_name || '已删除药品',
      type: record.medicine_type || 'human',
      useDate: record.use_date,
      useNum: record.use_num,
      usePerson: record.use_person,
      symptom: record.symptom,
      useRemark: record.use_remark,
      createdAt: record.created_at
    }
  })
})

/**
 * 提交表单
 */
const submitForm = async () => {
  if (!recordFormRef.value) return
  
  try {
    await recordFormRef.value.validate()
    loading.value = true
    
    // 构建记录数据
    const recordData = {
      medicineId: recordForm.value.medicineId,
      useDate: recordForm.value.useDate,
      useNum: recordForm.value.useNum,
      usePerson: recordForm.value.usePerson,
      symptom: recordForm.value.symptom,
      useRemark: recordForm.value.useRemark
    }
    
    // 添加记录
    await medicineStore.addUseRecord(recordData)
    ElMessage.success('使用记录添加成功！')
    resetForm()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('添加失败:', error)
      ElMessage.error('添加失败，请重试！')
    }
  } finally {
    loading.value = false
  }
}

/**
 * 重置表单
 */
const resetForm = () => {
  recordFormRef.value?.resetFields()
  recordForm.value = {
    medicineId: '',
    useDate: new Date(),
    useNum: '',
    usePerson: '',
    symptom: '',
    useRemark: ''
  }
}

/**
 * 处理搜索
 */
const handleSearch = () => {
  // 搜索逻辑
}

/**
 * 处理删除使用记录
 * @param {Object} record - 使用记录数据
 */
const handleDeleteRecord = async (record) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除这条使用记录吗？`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await medicineStore.deleteUseRecord(record.id)
    ElMessage.success('使用记录删除成功！')
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
onMounted(async () => {
  // 初始化数据
  await medicineStore.getMedicines()
  await medicineStore.getUseRecords()
})

// 监听记录列表变化，显示加载动画
watch(() => medicineStore.useRecords, () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
  }, 300)
}, { immediate: true })
</script>

<style scoped>
.record-management-container {
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

.option-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.option-tag {
  margin-left: 8px;
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

.empty-state {
  padding: 40px 20px;
  text-align: center;
}

:deep(.el-empty__description) {
  color: #94a3b8;
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
  .record-management-container {
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
  
  .table-container {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
  
  :deep(.el-table) {
    min-width: 800px;
  }
}

@media (max-width: 480px) {
  .record-management-container {
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