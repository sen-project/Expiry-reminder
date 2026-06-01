<template>
  <div class="excel-management-container">
    <div class="page-header">
      <h1>数据导入导出</h1>
      <p>导入和导出药品数据</p>
    </div>
    
    <div class="card">
      <div class="card-title">
        <el-icon :size="18" color="#3b82f6"><FolderOpened /></el-icon>
        <span>数据操作</span>
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
            <el-table-column label="分类" width="100">
              <template #default="{ row }">
                <el-tag :type="row.type === 'human' ? 'primary' : 'warning'" size="small">
                  {{ row.type === 'human' ? '人用药' : '宠物用药' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="expiryDate" label="有效期" width="120" />
            <el-table-column prop="location" label="存放位置" width="120" />
            <el-table-column label="数量" width="100">
              <template #default="{ row }">
                {{ row.remainNum }}{{ row.unit || '' }}
              </template>
            </el-table-column>
            <el-table-column prop="note" label="备注" show-overflow-tooltip />
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
    
    <!-- 导入历史 -->
    <div class="card" style="margin-top: 24px">
      <div class="card-title">
        <el-icon :size="18" color="#3b82f6"><Clock /></el-icon>
        <span style="min-width: 40px;">操作历史</span>
        <div class="history-actions">
          <el-select
            v-model="operationFilter"
            placeholder="操作类型"
            size="small"
            @change="handleOperationFilterChange"
            style="width: 120px; margin-right: 12px"
          >
            <el-option label="全部" value="" />
            <el-option label="导入" value="import" />
            <el-option label="导出" value="export" />
          </el-select>
          <el-button
            type="info"
            size="small"
            :icon="Refresh"
            @click="handleRefreshLogs"
            :loading="loading"
          >
            刷新
          </el-button>
          <el-button
            type="danger"
            size="small"
            :icon="Delete"
            @click="handleClearLogs"
            :disabled="importHistory.length === 0"
          >
            清除
          </el-button>
        </div>
      </div>
      <div class="history-list">
        <div v-for="(history, index) in importHistory" :key="history.id || index" class="history-item">
          <el-icon :size="16" :color="history.type === 'import' ? '#10b981' : '#3b82f6'">
            <component :is="history.type === 'import' ? Upload : DocumentCopy" />
          </el-icon>
          <div class="history-content">
            <div class="history-title">{{ history.title }}</div>
            <div class="history-meta">
              <span class="history-time">{{ formatTime(history.time) }}</span>
              <span v-if="history.ip" class="history-ip">{{ history.ip }}</span>
            </div>
          </div>
        </div>
        <div v-if="importHistory.length === 0" class="empty-history">
          <el-empty description="暂无操作历史" />
        </div>
      </div>
      <div v-if="totalLogs > 0" class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="totalLogs"
          @size-change="(size) => { pageSize.value = size; fetchLogs() }"
          @current-change="handlePageChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useMedicineStore } from '@/stores/medicine'
import { ElMessage, ElPagination, ElSelect, ElOption, ElButton, ElMessageBox } from 'element-plus'
import { importMedicines, exportMedicines as exportMedicinesAPI, getLogList, clearLogs } from '@/api/index.js'
import * as XLSX from 'xlsx'
import { 
  FolderOpened, 
  Download, 
  Upload, 
  DocumentCopy, 
  InfoFilled, 
  Clock, 
  Delete, 
  Refresh 
} from '@element-plus/icons-vue'

// 状态管理
const medicineStore = useMedicineStore()
const fileInput = ref(null)
const previewVisible = ref(false)
const previewData = ref([])
const importing = ref(false)
const selectedFile = ref(null)

// 操作历史
const importHistory = ref([])
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const totalLogs = ref(0)
const operationFilter = ref('')

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

// 页面加载时获取日志列表
onMounted(() => {
  fetchLogs()
})

/**
 * 下载导入模板
 */
const handleDownloadTemplate = () => {
  const templateData = [
    {
      药品名称: '依巴斯汀片',
      类型: 'human',
      购买日期: '2021-02-05',
      保质期: '2024-01-04',
      位置: '药箱A',
      剩余数量: '10',
      单位: '粒',
      备注: '抗过敏药',
      图片: ''
    },
    {
      药品名称: '泰国青草膏',
      类型: 'human',
      购买日期: '2020-01-01',
      保质期: '2026-01-03',
      位置: '药箱B',
      剩余数量: '3',
      单位: '瓶',
      备注: '外用药',
      图片: 'https://example.com/image.jpg'
    }
  ]
  const worksheet = XLSX.utils.json_to_sheet(templateData)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, '药品数据')
  XLSX.writeFile(workbook, '药品导入模板.xlsx')
  ElMessage.success('模板下载成功！')
  
  // 添加到操作历史
  addToHistory('下载导入模板', 'export')
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
  
  // 保存文件对象
  selectedFile.value = file
  
  // 验证文件格式
  const validExtensions = ['.xlsx', '.xls']
  const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase()
  if (!validExtensions.includes(fileExtension)) {
    ElMessage.error('请上传.xlsx或.xls格式的Excel文件！')
    return
  }
  
  const reader = new FileReader()
  reader.onload = (event) => {
    try {
      const data = new Uint8Array(event.target.result)
      const workbook = XLSX.read(data, { type: 'array' })
      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]
      const excelData = XLSX.utils.sheet_to_json(worksheet)
      
      // 过滤有效数据
      const validData = excelData.filter(item => {
        const name = item.药品名称 || item.name
        return name && name !== '药品名称' && name !== 'name'
      })
      
      if (validData.length === 0) {
        ElMessage.error('Excel中无有效药品数据，请检查模板格式！')
        return
      }
      
      // 转换数据格式
      previewData.value = validData.map(item => ({
        name: item.药品名称 || item.name || '',
        type: normalizeType(item.类型 || item.type || '人药'),
        purchaseDate: normalizeDate(item.购买日期 || item.purchaseDate),
        expiryDate: normalizeDate(item.保质期 || item.expiryDate),
        location: item.位置 || item.location || '',
        remainNum: item.剩余数量 || item.remainNum || '',
        unit: item.单位 || item.unit || '',
        note: item.备注 || item.note || '',
        image: item.图片 || item.image || ''
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
 * 标准化类型
 * @param {string} type - 类型值
 * @returns {string} - 标准化后的类型
 */
const normalizeType = (type) => {
  if (!type) return 'human'
  const typeStr = String(type).toLowerCase()
  if (typeStr.includes('pet') || typeStr.includes('宠物')) {
    return 'pet'
  }
  return 'human'
}

/**
 * 标准化日期
 * @param {string} dateStr - 日期字符串
 * @returns {string} - 标准化后的日期
 */
const normalizeDate = (dateStr) => {
  if (!dateStr) return ''
  
  // 尝试解析各种日期格式
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) {
    return dateStr
  }
  
  // 格式化为 YYYY-MM-DD
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * 确认导入
 */
const confirmImport = async () => {
  importing.value = true
  try {
    // 获取保存的文件
    const file = selectedFile.value
    if (!file) {
      ElMessage.error('请重新选择文件！')
      return
    }
    
    // 创建FormData
    const formData = new FormData()
    formData.append('file', file)
    
    // 调用导入接口
    const result = await importMedicines(formData)
    
    if (result.code === 200) {
      ElMessage.success(result.msg || `成功导入${result.data.count}条药品数据！`)
      previewVisible.value = false
      previewData.value = []
      selectedFile.value = null
      
      // 刷新药品列表
      await medicineStore.getMedicines()
      
      // 添加到操作历史
      addToHistory(`导入${result.data.count}条药品数据`, 'import')
    } else {
      ElMessage.error(result.msg || '导入失败，请重试！')
    }
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
const handleExport = async () => {
  try {
    const token = localStorage.getItem('token')
    const baseURL = import.meta.env.VITE_API_BASE_URL || 'https://api.yaos.top'
    
    // 使用fetch API进行导出，解决跨域问题
    const response = await fetch(`${baseURL}/api/medicine/export`, {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + token
      },
      credentials: 'include'
    })
    
    if (!response.ok) {
      throw new Error('导出失败')
    }
    
    // 获取文件名
    const contentDisposition = response.headers.get('Content-Disposition')
    let fileName = '药品列表.xlsx'
    if (contentDisposition) {
      const matches = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/)
      if (matches && matches[1]) {
        fileName = matches[1].replace(/['"]/g, '')
      }
    }
    
    // 获取blob数据
    const blob = await response.blob()
    
    // 创建下载链接
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', fileName)
    
    document.body.appendChild(link)
    link.click()
    link.remove()
    
    // 释放URL对象
    window.URL.revokeObjectURL(url)
    
    ElMessage.success('数据导出成功！')
    
    // 添加到操作历史
    addToHistory('导出药品数据', 'export')
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error('导出失败，请稍后重试！')
  }
}

/**
 * 添加到操作历史
 * @param {string} title - 操作标题
 * @param {string} type - 操作类型
 */
const addToHistory = (title, type) => {
  importHistory.value.unshift({
    title,
    type,
    time: new Date().toISOString()
  })
  
  // 只保留最近10条历史
  if (importHistory.value.length > 10) {
    importHistory.value = importHistory.value.slice(0, 10)
  }
  
  // 重新获取日志列表
  fetchLogs()
}

/**
 * 获取操作日志列表
 */
const fetchLogs = async () => {
  loading.value = true
  try {
    const params = {
      page: currentPage.value,
      pageSize: pageSize.value
    }
    
    if (operationFilter.value) {
      params.operation = operationFilter.value
    }
    
    const result = await getLogList(params)
    
    if (result.code === 200) {
      importHistory.value = result.data.list.map(log => ({
        id: log.id,
        title: log.description,
        type: log.operation,
        time: log.created_at,
        ip: log.ip
      }))
      totalLogs.value = result.data.total
    } else {
      ElMessage.error(result.msg || '获取日志失败')
    }
  } catch (error) {
    console.error('获取日志失败:', error)
    ElMessage.error('获取日志失败，请重试')
  } finally {
    loading.value = false
  }
}

/**
 * 清除操作日志
 */
const handleClearLogs = async () => {
  try {
    await ElMessageBox.confirm('确定要清除所有操作日志吗？', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    const result = await clearLogs()
    
    if (result.code === 200) {
      ElMessage.success(result.msg || '清除日志成功')
      fetchLogs()
    } else {
      ElMessage.error(result.msg || '清除日志失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('清除日志失败:', error)
      ElMessage.error('清除日志失败，请重试')
    }
  }
}

/**
 * 页面变化
 */
const handlePageChange = (page) => {
  currentPage.value = page
  fetchLogs()
}

/**
 * 操作类型过滤变化
 */
const handleOperationFilterChange = () => {
  currentPage.value = 1
  fetchLogs()
}

/**
 * 刷新日志列表
 */
const handleRefreshLogs = () => {
  fetchLogs()
}
</script>

<style scoped>
.excel-management-container {
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
  justify-content: space-between;
}

.history-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.excel-actions {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.action-btn {
  height: 48px;
  font-size: 14px;
  font-weight: 500;
  border-radius: 8px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  margin-left: 0;
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
}

.excel-tip {
  display: flex;
  gap: 16px;
  padding: 20px;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border-radius: 12px;
  border-left: 4px solid #3b82f6;
  margin-bottom: 24px;
}

.tip-content {
  flex: 1;
}

.tip-content p {
  margin: 6px 0;
  font-size: 14px;
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
  padding: 24px;
  background-color: #f8fafc;
}

:deep(.el-dialog__header) {
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  padding: 16px 24px;
  border-bottom: 1px solid #e2e8f0;
}

:deep(.el-dialog__title) {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.history-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 8px;
  transition: all 0.3s ease;
  border: 1px solid #e2e8f0;
}

.history-item:hover {
  background: #eff6ff;
  transform: translateX(4px);
}

.history-content {
  flex: 1;
  min-width: 0;
}

.history-title {
  font-size: 14px;
  font-weight: 500;
  color: #334155;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.history-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.history-time {
  font-size: 12px;
  color: #94a3b8;
}

.history-ip {
  font-size: 12px;
  color: #64748b;
  background: #f1f5f9;
  padding: 2px 8px;
  border-radius: 4px;
}

.empty-history {
  padding: 40px 20px;
  text-align: center;
}

.pagination-container {
  margin-top: 24px;
  display: flex;
  justify-content: flex-end;
}

:deep(.el-empty__description) {
  color: #94a3b8;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .excel-management-container {
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
  
  .excel-actions {
    grid-template-columns: 1fr;
  }
  
  .action-btn {
    height: 44px;
  }
  
  .excel-tip {
    padding: 16px;
  }
  
  .tip-content p {
    font-size: 13px;
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
  .excel-management-container {
    padding: 12px;
  }
  
  .card {
    padding: 12px;
  }
  
  .excel-actions {
    gap: 12px;
  }
  
  .history-item {
    padding: 12px;
  }
}
</style>
