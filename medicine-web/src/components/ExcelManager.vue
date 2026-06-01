<template>
  <div class="card excel-manager">
    <div class="card-title">
      <el-icon :size="18" color="#3b82f6"><FolderOpened /></el-icon>
      <span>Excel数据管理</span>
    </div>
    
    <div class="excel-actions">
      <el-button
        type="success"
        :icon="Download"
        @click="handleDownloadTemplate"
        class="action-btn"
      >
        下载导入模板
      </el-button>
      
      <el-button
        type="warning"
        :icon="Upload"
        @click="handleImport"
        class="action-btn"
      >
        导入Excel数据
      </el-button>
      
      <el-button
        type="primary"
        :icon="DocumentCopy"
        @click="handleExport"
        class="action-btn"
      >
        导出Excel备份
      </el-button>
    </div>
    
    <input
      ref="fileInput"
      type="file"
      accept=".xlsx,.xls"
      style="display: none"
      @change="handleFileChange"
    />
    
    <div class="excel-tip">
      <el-icon color="#3b82f6"><InfoFilled /></el-icon>
      <div class="tip-content">
        <p>1. 导入请先下载模板，按模板整理原有Excel数据</p>
        <p>2. 支持.xlsx/.xls格式，表头需与模板一致</p>
        <p>3. 照片数据以URL格式存储在Excel中，导出后可再次导入查看</p>
      </div>
    </div>
    
    <el-dialog
      v-model="previewVisible"
      title="导入数据预览"
      width="80%"
      :append-to-body="true"
    >
      <div v-if="previewData.length > 0" class="preview-content">
        <el-alert
          :title="`共 ${previewData.length} 条数据，确认导入？`"
          type="info"
          :closable="false"
          style="margin-bottom: 16px"
        />
        <el-table
          :data="previewData.slice(0, 10)"
          border
          max-height="400"
          style="width: 100%"
        >
          <el-table-column prop="name" label="药品名称" width="150" />
          <el-table-column prop="drugType" label="分类" width="100">
            <template #default="{ row }">
              <el-tag :type="row.type === 'human' ? 'primary' : 'warning'" size="small">
                {{ row.type === 'human' ? '人用药' : '宠物用药' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="expireDate" label="有效期" width="120" />
          <el-table-column prop="location" label="存放位置" width="120" />
          <el-table-column prop="remainNum" label="数量" width="100" />
          <el-table-column prop="remark" label="备注" show-overflow-tooltip />
        </el-table>
        <p v-if="previewData.length > 10" class="preview-more">
          还有 {{ previewData.length - 10 }} 条数据未显示...
        </p>
      </div>
      <template #footer>
        <el-button @click="previewVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmImport" :loading="importing">
          确认导入
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useMedicineStore } from '@/stores/medicine'
import { ElMessage } from 'element-plus'
import * as XLSX from 'xlsx'
import { FolderOpened, Download, Upload, DocumentCopy, InfoFilled } from '@element-plus/icons-vue'

// 定义事件
const emit = defineEmits(['refresh'])

// 状态管理
const medicineStore = useMedicineStore()
const fileInput = ref(null) // 文件输入框引用
const previewVisible = ref(false) // 预览对话框显示状态
const previewData = ref([]) // 预览数据
const importing = ref(false) // 导入状态

/**
 * 下载导入模板
 */
const handleDownloadTemplate = () => {
  const templateData = [
    {
      药品名称: '示例：头孢羟氨苄片',
      药品分类: '人用药/宠物药',
      生产日期: '2025.9.9',
      有效期至: '2027.9.8',
      存放位置: '客厅药箱',
      剩余数量: '2粒',
      备注: '消炎用',
      照片: ''
    }
  ]
  const worksheet = XLSX.utils.json_to_sheet(templateData, {
    header: ['药品名称', '药品分类', '生产日期', '有效期至', '存放位置', '剩余数量', '备注', '照片']
  })
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, '药品数据')
  XLSX.writeFile(workbook, '药品导入模板.xlsx')
  ElMessage.success('模板下载成功！')
}

/**
 * 处理导入
 */
const handleImport = () => {
  fileInput.value?.click()
}

/**
 * 处理文件选择
 * @param {Event} e - 文件选择事件
 */
const handleFileChange = (e) => {
  const file = e.target.files[0]
  if (!file) return
  
  const reader = new FileReader()
  reader.onload = (event) => {
    try {
      const data = new Uint8Array(event.target.result)
      const workbook = XLSX.read(data, { type: 'array' })
      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]
      const excelData = XLSX.utils.sheet_to_json(worksheet, {
        header: ['药品名称', '药品分类', '生产日期', '有效期至', '存放位置', '剩余数量', '备注', '照片']
      })
      
      // 过滤有效数据
      const validData = excelData.filter(item => item.药品名称 && item.药品名称 !== '药品名称')
      
      if (validData.length === 0) {
        ElMessage.error('Excel中无有效药品数据，请检查模板格式！')
        return
      }
      
      // 转换数据格式
      previewData.value = validData.map(item => ({
        name: item.药品名称 || '',
        drugType: item.药品分类 && item.药品分类.includes('宠物') ? 'pet' : 'human',
        produceDate: item.生产日期 || '',
        expireDate: item.有效期至 || '',
        location: item.存放位置 || '',
        remainNum: item.剩余数量 || '',
        remark: item.备注 || '',
        photoUrl: item.照片 || ''
      }))
      
      // 显示预览
      previewVisible.value = true
    } catch (error) {
      console.error('Excel解析失败:', error)
      ElMessage.error('Excel导入失败，请检查文件是否为模板格式！')
    }
  }
  reader.readAsArrayBuffer(file)
  
  // 重置文件输入
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

/**
 * 确认导入
 */
const confirmImport = async () => {
  importing.value = true
  try {
    for (const item of previewData.value) {
      const medicineData = {
        name: item.name,
        drugType: item.drugType,
        produceDate: item.produceDate,
        expireDate: item.expireDate,
        location: item.location,
        remainNum: item.remainNum,
        remark: item.remark,
        photoUrl: item.photoUrl
      }
      console.log('导入药品220:', medicineData)
      await medicineStore.addMedicine(medicineData)
    }
    
    ElMessage.success(`成功导入${previewData.value.length}条药品数据！`)
    previewVisible.value = false
    previewData.value = []
    emit('refresh')
  } catch (error) {
    console.error('导入失败:', error)
    ElMessage.error('导入失败，请重试！')
  } finally {
    importing.value = false
  }
}

/**
 * 处理导出
 */
const handleExport = () => {
  const medicines = medicineStore.medicines
  if (medicines.length === 0) {
    ElMessage.warning('暂无药品数据可导出！')
    return
  }
  
  // 转换导出数据格式
  const exportData = medicines.map(item => ({
    药品名称: item.name,
    药品分类: item.type === 'human' ? '人用药' : '宠物药',
    生产日期: item.produceDate || '-',
    有效期至: item.expireDate || '-',
    存放位置: item.location || '-',
    剩余数量: item.remainNum || '-',
    备注: item.remark || '-',
    照片: item.photoUrl || ''
  }))
  
  const worksheet = XLSX.utils.json_to_sheet(exportData)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, '家庭药品数据')
  
  // 生成文件名
  const now = new Date()
  const dateStr = now.toLocaleDateString().replace(/\//g, '-')
  const timeStr = now.toLocaleTimeString().replace(/:/g, '-')
  XLSX.writeFile(workbook, `家庭药品数据_${dateStr}_${timeStr}.xlsx`)
  
  ElMessage.success('数据导出成功！')
}
</script>

<style scoped>
.excel-manager {
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

.excel-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}

.action-btn {
  width: 100%;
  height: 40px;
  font-size: 14px;
  font-weight: 500;
  border-radius: 8px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-left: 0;
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.excel-tip {
  display: flex;
  gap: 12px;
  padding: 16px;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border-radius: 8px;
  border-left: 4px solid #3b82f6;
}

.tip-content {
  flex: 1;
}

.tip-content p {
  margin: 4px 0;
  font-size: 13px;
  color: #64748b;
  line-height: 1.6;
}

.preview-content {
  max-height: 500px;
  overflow-y: auto;
}

.preview-more {
  text-align: center;
  color: #64748b;
  font-size: 13px;
  margin-top: 12px;
  padding: 8px;
  background: #f8fafc;
  border-radius: 6px;
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
