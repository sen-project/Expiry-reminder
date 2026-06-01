<template>
  <div class="card medicine-form">
    <div class="card-title">
      <el-icon :size="18" color="#3b82f6"><Plus /></el-icon>
      <span>药品信息录入</span>
    </div>
    
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="100px"
      @submit.prevent="handleSubmit"
    >
      <el-form-item label="药品名称" prop="name">
        <el-input
          v-model="form.name"
          placeholder="如：头孢羟氨苄片"
          clearable
          @blur="handleNameBlur"
          :loading="loading"
        />
      </el-form-item>
      
      <el-form-item label="药品分类" prop="type">
        <el-select v-model="form.type" placeholder="请选择分类" style="width: 100%">
          <el-option label="人用药" value="human" />
          <el-option label="宠物药（猫/狗）" value="pet" />
        </el-select>
      </el-form-item>
      
      <el-form-item label="购买日期" prop="produceDate">
        <el-date-picker
          v-model="form.produceDate"
          type="date"
          placeholder="选择日期"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          style="width: 100%"
        />
      </el-form-item>
      
      <el-form-item label="保质期" prop="expireDate">
        <el-date-picker
          v-model="form.expireDate"
          type="date"
          placeholder="选择日期"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          style="width: 100%"
        />
      </el-form-item>
      
      <el-form-item label="存放位置" prop="location">
        <el-input
          v-model="form.location"
          placeholder="如：客厅药箱/卧室抽屉/阳台收纳盒"
          clearable
        />
      </el-form-item>
      
      <el-form-item label="剩余数量" prop="remainNum">
        <div class="quantity-input">
          <el-input-number
            v-model="form.remainQty"
            :min="0"
            :step="1"
            placeholder="数量"
            style="flex: 1"
          />
          <el-input
            v-model="form.remainUnit"
            placeholder="单位，如：粒、袋、片"
            style="flex: 1"
            clearable
          />
        </div>
      </el-form-item>
      
      <el-form-item label="备注" prop="remark">
        <el-input
          v-model="form.remark"
          placeholder="如：退烧用/宠物消炎/饭后吃"
          clearable
        />
      </el-form-item>
      
      <el-form-item label="药品照片" prop="photoUrl">
        <PhotoUpload v-model="form.photoUrl" />
      </el-form-item>
      
      <el-form-item>
        <el-button
          type="primary"
          :loading="submitting"
          @click="handleSubmit"
          class="submit-btn"
        >
          <el-icon v-if="!submitting"><Check /></el-icon>
          {{ editingId ? '更新药品信息' : '保存药品信息' }}
        </el-button>
        <el-button
          v-if="editingId"
          @click="handleReset"
          class="reset-btn"
        >
          取消编辑
        </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useMedicineStore } from '@/stores/medicine'
import { ElMessage } from 'element-plus'
import { Plus, Check } from '@element-plus/icons-vue'
import PhotoUpload from './PhotoUpload.vue'
import { getMedicineInfo } from '@/api'

// 定义事件
const emit = defineEmits(['refresh'])

// 状态管理
const medicineStore = useMedicineStore()
const formRef = ref(null) // 表单引用
const submitting = ref(false) // 提交状态
const editingId = ref('') // 编辑中的药品ID
const loading = ref(false) // 加载状态

// 表单数据
const form = reactive({
  name: '',
  type: '',
  produceDate: '',
  expireDate: '',
  location: '',
  remainQty: 0,
  remainUnit: '',
  remark: '',
  photoUrl: ''
})

// 表单验证规则
const rules = {
  name: [
    { required: true, message: '请输入药品名称', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择药品分类', trigger: 'change' }
  ],
  produceDate: [
    { required: true, message: '请输入购买日期', trigger: 'blur' }
  ],
  expireDate: [
    { required: true, message: '请输入保质期', trigger: 'blur' }
  ]
}

/**
 * 处理表单提交
 */
const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    // 表单验证
    await formRef.value.validate()
    submitting.value = true
    
    // 构建药品数据
    const medicineData = {
      name: form.name,
      type: form.type,
      produceDate: form.produceDate,
      expireDate: form.expireDate,
      location: form.location,
      remainNum: form.remainQty,
      unit: form.remainUnit,
      remark: form.remark,
      photoUrl: form.photoUrl
    }
    
    // 根据是否有编辑ID判断是更新还是添加
    if (editingId.value) {
      await medicineStore.updateMedicine(editingId.value, medicineData)
      ElMessage.success('药品信息更新成功！')
    } else {
      await medicineStore.addMedicine(medicineData)
      ElMessage.success('药品信息保存成功！')
    }
    
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
  editingId.value = ''
  form.name = ''
  form.type = ''
  form.produceDate = ''
  form.expireDate = ''
  form.location = ''
  form.remainQty = 0
  form.remainUnit = ''
  form.remark = ''
  form.photoUrl = ''
}

/**
 * 处理药品名称输入完成
 */
const handleNameBlur = async () => {
  if (!form.name.trim()) return
  
  try {
    loading.value = true
    const response = await getMedicineInfo(form.name)
    if (response.code === 200 && response.data.symptoms) {
      form.remark = response.data.symptoms
    }
  } catch (error) {
    console.error('查询药品信息失败:', error)
  } finally {
    loading.value = false
  }
}

/**
 * 编辑药品
 * @param {Object} medicine - 药品数据
 */
const editMedicine = (medicine) => {
  editingId.value = medicine.id
  form.name = medicine.name
  form.type = medicine.type 
  form.produceDate = medicine.purchase_date || ''
  form.expireDate = medicine.expiry_date || ''
  form.location = medicine.location || ''
  form.remark = medicine.use_remark || ''
  form.photoUrl = medicine.image || ''
  
  // 解析剩余数量
  if (medicine.remain_num) {
    const match = medicine.remain_num.match(/^(\d+)(.+)$/)
    if (match) {
      form.remainQty = parseInt(match[1])
      form.remainUnit = match[2]
    }
  }
}

// 暴露方法
defineExpose({
  editMedicine,
  handleReset
})
</script>

<style scoped>
.medicine-form {
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
  font-size: 18px;
  font-weight: 600;
  color: #2563eb;
  margin-bottom: 24px;
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

.reset-btn {
  margin-left: 12px;
  height: 40px;
  font-size: 14px;
  font-weight: 500;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.reset-btn:hover {
  transform: translateY(-1px);
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
</style>
