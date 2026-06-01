<template>
  <div class="card use-record">
    <div class="card-title">
      <el-icon :size="18" color="#3b82f6"><Edit /></el-icon>
      <span>记录药品使用</span>
    </div>
    
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="100px"
      @submit.prevent="handleSubmit"
    >
      <el-form-item label="选择药品" prop="medicineId">
        <el-select
          v-model="form.medicineId"
          placeholder="请选择药品"
          filterable
          style="width: 100%"
        >
          <el-option
            v-for="medicine in medicineOptions"
            :key="medicine.id"
            :label="medicine.name"
            :value="medicine.id"
          >
            <div class="medicine-option">
              <span>{{ medicine.name }}</span>
              <el-tag
                :type="medicine.type === 'human' ? 'primary' : 'warning'"
                size="small"
              >
                {{ medicine.type === 'human' ? '人用药' : '宠物用药' }}
              </el-tag>
            </div>
          </el-option>
        </el-select>
      </el-form-item>
      
      <el-form-item label="使用日期" prop="useDate">
        <el-date-picker
          v-model="form.useDate"
          type="date"
          placeholder="选择日期"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          style="width: 100%"
        />
      </el-form-item>
      
      <el-form-item label="使用数量" prop="useNum">
        <div class="quantity-input">
          <el-input-number
            v-model="form.useQty"
            :min="1"
            :step="1"
            placeholder="数量"
            style="flex: 1"
          />
          <el-input
            v-model="form.useUnit"
            placeholder="单位，如：粒、袋、片"
            style="flex: 1"
            clearable
          />
        </div>
      </el-form-item>
      
      <el-form-item label="使用备注" prop="useRemark">
        <el-input
          v-model="form.useRemark"
          type="textarea"
          :rows="3"
          placeholder="如：发烧吃1粒 / 宠物感冒喂半片"
          clearable
        />
      </el-form-item>
      
      <el-form-item>
        <el-button
          type="primary"
          :loading="submitting"
          @click="handleSubmit"
          class="submit-btn"
        >
          <el-icon v-if="!submitting"><Check /></el-icon>
          保存使用记录
        </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useMedicineStore } from '@/stores/medicine'
import { ElMessage } from 'element-plus'
import { Edit, Check } from '@element-plus/icons-vue'

// 定义事件
const emit = defineEmits(['refresh'])

// 状态管理
const medicineStore = useMedicineStore()
const formRef = ref(null) // 表单引用
const submitting = ref(false) // 提交状态

// 表单数据
const form = reactive({
  medicineId: '',
  useDate: new Date().toISOString().split('T')[0],
  useQty: 1,
  useUnit: '',
  useRemark: ''
})

// 表单验证规则
const rules = {
  medicineId: [
    { required: true, message: '请选择药品', trigger: 'change' }
  ],
  useDate: [
    { required: true, message: '请选择使用日期', trigger: 'change' }
  ]
}

/**
 * 药品选项
 */
const medicineOptions = computed(() => {
  return medicineStore.medicines
})

/**
 * 处理表单提交
 */
const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    // 表单验证
    await formRef.value.validate()
    submitting.value = true
    
    // 构建使用记录数据
    const useRecordData = {
      medicineId: form.medicineId,
      useDate: form.useDate,
      useNum: form.useQty,
      unit: form.useUnit,
      useRemark: form.useRemark
    }
    
    // 保存使用记录
    await medicineStore.addUseRecord(useRecordData)
    
    ElMessage.success('使用记录保存成功！')
    
    // 重置表单并刷新数据
    handleReset()
    emit('refresh')
  } catch (error) {
    console.error('保存失败:', error)
    if (error !== false) {
      ElMessage.error('保存失败，请重试！')
    }
  } finally {
    submitting.value = false
  }
}

/**
 * 重置表单
 */
const handleReset = () => {
  formRef.value?.resetFields()
  form.useDate = new Date().toISOString().split('T')[0]
  form.useQty = 1
  form.useUnit = ''
  form.useRemark = ''
}

/**
 * 页面挂载
 */
onMounted(async () => {
  form.useDate = new Date().toISOString().split('T')[0]
  // 请求药品列表，用于选择药品
  await medicineStore.getMedicines()
})
</script>

<style scoped>
.use-record {
  animation: slideIn 0.5s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.card-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 16px;
  font-weight: 600;
  color: #2563eb;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 2px solid #eff6ff;
}

.quantity-input {
  display: flex;
  gap: 10px;
  width: 100%;
}

.submit-btn {
  width: 100%;
  height: 40px;
  font-size: 14px;
  font-weight: 500;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  border: none;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  transition: all 0.3s ease;
}

.submit-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
}

.medicine-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

:deep(.el-form-item__label) {
  font-weight: 500;
  color: #475569;
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
  cursor: pointer;
}

:deep(.el-select:hover .el-input__wrapper) {
  box-shadow: 0 0 0 1px #3b82f6 inset;
}

:deep(.el-textarea__inner) {
  border-radius: 8px;
  transition: all 0.3s ease;
}

:deep(.el-textarea__inner:hover) {
  border-color: #3b82f6;
}

:deep(.el-textarea__inner:focus) {
  border-color: #3b82f6;
  box-shadow: 0 0 0 1px #3b82f6 inset;
}
</style>
