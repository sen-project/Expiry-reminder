<template>
  <div class="photo-upload-container">
    <div
      class="photo-upload"
      :class="{ 'dragover': isDragover, 'has-photo': modelValue }"
      @click="handleClick"
      @dragover.prevent="handleDragOver"
      @dragleave.prevent="handleDragLeave"
      @drop.prevent="handleDrop"
    >
      <input
        ref="fileInput"
        type="file"
        accept="image/*"
        style="display: none"
        @change="handleFileChange"
      />
      
      <div v-if="!modelValue" class="upload-placeholder">
        <el-icon :size="48" color="#cbd5e1"><UploadFilled /></el-icon>
        <p class="placeholder-text">点击或拖拽上传照片</p>
        <p class="placeholder-hint">支持 JPG、PNG 等格式</p>
      </div>
      
      <div v-else class="photo-preview">
        <img :src="modelValue" alt="药品照片" />
        <div class="photo-overlay">
          <el-icon :size="24" color="white"><ZoomIn /></el-icon>
        </div>
      </div>
      
      <div v-if="uploading" class="uploading-overlay">
        <el-icon :size="32" class="is-loading"><Loading /></el-icon>
        <p>上传中...</p>
      </div>
    </div>
    
    <div v-if="modelValue" class="photo-actions">
      <el-button
        type="danger"
        size="small"
        @click="handleDelete"
        class="delete-btn"
      >
        <el-icon><Delete /></el-icon>
        删除照片
      </el-button>
    </div>
    
    <el-dialog
      v-model="previewVisible"
      title="照片预览"
      width="80%"
      :append-to-body="true"
    >
      <img :src="modelValue" alt="药品照片大图" style="width: 100%; border-radius: 8px;" />
    </el-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useMedicineStore } from '@/stores/medicine'
import { ElMessage } from 'element-plus'
import { UploadFilled, ZoomIn, Delete, Loading } from '@element-plus/icons-vue'

// 定义属性
const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  }
})

// 定义事件
const emit = defineEmits(['update:modelValue'])

// 状态管理
const medicineStore = useMedicineStore()
const fileInput = ref(null) // 文件输入框引用
const isDragover = ref(false) // 拖拽状态
const uploading = ref(false) // 上传状态
const previewVisible = ref(false) // 预览对话框显示状态

/**
 * 处理点击事件
 */
const handleClick = () => {
  if (!uploading.value && !props.modelValue) {
    // 没有上传中且没有照片时，触发文件选择
    fileInput.value?.click()
  } else if (props.modelValue) {
    // 有照片时，显示预览
    previewVisible.value = true
  }
}

/**
 * 处理拖拽进入
 */
const handleDragOver = () => {
  isDragover.value = true
}

/**
 * 处理拖拽离开
 */
const handleDragLeave = () => {
  isDragover.value = false
}

/**
 * 处理拖拽放下
 * @param {Event} e - 拖拽事件
 */
const handleDrop = (e) => {
  isDragover.value = false
  const files = e.dataTransfer.files
  if (files.length > 0) {
    handleFile(files[0])
  }
}

/**
 * 处理文件选择
 * @param {Event} e - 文件选择事件
 */
const handleFileChange = (e) => {
  const files = e.target.files
  if (files.length > 0) {
    handleFile(files[0])
  }
}

/**
 * 处理文件上传
 * @param {File} file - 选中的文件
 */
const handleFile = async (file) => {
  // 验证文件类型
  if (!file.type.startsWith('image/')) {
    ElMessage.error('请选择图片文件！')
    return
  }
  
  // 验证文件大小
  if (file.size > 5 * 1024 * 1024) {
    ElMessage.error('图片大小不能超过 5MB！')
    return
  }
  
  uploading.value = true
  
  try {
    // 上传照片
    const photoUrl = await medicineStore.uploadPhoto(file)
    // 更新模型值
    emit('update:modelValue', photoUrl)
    ElMessage.success('照片上传成功！')
  } catch (error) {
    console.error('上传失败:', error)
    ElMessage.error('照片上传失败，请重试！')
  } finally {
    uploading.value = false
    // 重置文件输入
    if (fileInput.value) {
      fileInput.value.value = ''
    }
  }
}

/**
 * 处理删除照片
 */
const handleDelete = () => {
  emit('update:modelValue', '')
  ElMessage.success('照片已删除')
}
</script>

<style scoped>
.photo-upload-container {
  width: 100%;
}

.photo-upload {
  width: 100%;
  min-height: 200px;
  border: 2px dashed #e2e8f0;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: #f8fafc;
  position: relative;
  overflow: hidden;
}

.photo-upload:hover {
  border-color: #3b82f6;
  background-color: #eff6ff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1);
}

.photo-upload.dragover {
  border-color: #3b82f6;
  background-color: #dbeafe;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.photo-upload.has-photo {
  border-style: solid;
  border-color: #e2e8f0;
  background-color: white;
  cursor: pointer;
}

.photo-upload.has-photo:hover {
  border-color: #3b82f6;
}

.upload-placeholder {
  text-align: center;
  padding: 32px;
}

.placeholder-text {
  margin-top: 16px;
  font-size: 14px;
  font-weight: 500;
  color: #64748b;
}

.placeholder-hint {
  margin-top: 8px;
  font-size: 12px;
  color: #94a3b8;
}

.photo-preview {
  width: 100%;
  height: 100%;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.photo-preview img {
  max-width: 100%;
  max-height: 300px;
  object-fit: contain;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.photo-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  border-radius: 8px;
}

.photo-upload.has-photo:hover .photo-overlay {
  opacity: 1;
}

.uploading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  z-index: 10;
}

.uploading-overlay p {
  font-size: 14px;
  color: #64748b;
  font-weight: 500;
}

.photo-actions {
  margin-top: 12px;
  display: flex;
  gap: 8px;
}

.delete-btn {
  font-size: 13px;
  font-weight: 500;
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  border: none;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.delete-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
}

:deep(.el-dialog__body) {
  padding: 20px;
  background-color: #f8fafc;
}

:deep(.el-dialog__header) {
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  padding: 16px 20px;
  border-bottom: 1px solid #e2e8f0;
}

:deep(.el-dialog__title) {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
}
</style>
