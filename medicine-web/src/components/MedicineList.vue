<template>
  <div class="medicine-list-container">
    <div class="card">
      <div class="card-title">
        <el-icon :size="18" color="#3b82f6"><List /></el-icon>
        <span>药品列表（保质期近30天/已过期自动标红）</span>
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
          :data="filteredMedicines"
          stripe
          border
          style="width: 100%"
          :row-class-name="getRowClassName"
        >
          <el-table-column type="index" label="序号" width="60" align="center" />
          
          <el-table-column prop="name" label="药品名称" min-width="150" />
          
          <el-table-column label="分类" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="row.type === 'human' ? 'primary' : 'warning'" size="small">
                {{ row.type === 'human' ? '人用药' : '宠物药' }}
              </el-tag>
            </template>
          </el-table-column>
          
          <el-table-column prop="expiry_date" label="有效期至" width="120" />
          
          <el-table-column prop="location" label="存放位置" width="120" />
          
          <el-table-column label="剩余数量" width="100">
            <template #default="{ row }">
              {{ row.remain_num }}{{ row.unit || '' }}
            </template>
          </el-table-column>
          
          <el-table-column label="照片" width="80" align="center">
            <template #default="{ row }">
              <el-image
                v-if="row.image"
                :src="row.image"
                :preview-src-list="[row.image]"
                fit="cover"
                style="width: 40px; height: 40px; border-radius: 6px; cursor: pointer"
              >
                <template #error>
                  <div class="image-error">
                    <el-icon><Picture /></el-icon>
                  </div>
                </template>
              </el-image>
              <span v-else style="color: #cbd5e1; font-size: 12px">无照片</span>
            </template>
          </el-table-column>
          
          <el-table-column label="状态" width="140" align="center">
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
        
        <div class="pagination-container">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[10, 30, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>
    </div>
    
    <div class="card" style="margin-top: 24px">
      <div class="card-title">
        <el-icon :size="18" color="#3b82f6"><Document /></el-icon>
        <span>药品使用记录</span>
      </div>
      
      <div class="table-container">
        <el-table
          :data="sortedRecords"
          stripe
          border
          style="width: 100%"
        >
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
          
          <el-table-column prop="useRemark" label="使用备注" min-width="150" show-overflow-tooltip />
          
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
        
        <div v-if="sortedRecords.length === 0" class="empty-state">
          <el-empty description="暂无使用记录~" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useMedicineStore } from '@/stores/medicine'
import { ElMessage, ElMessageBox } from 'element-plus'
import { List, Search, Edit, Delete, Picture, Document } from '@element-plus/icons-vue'

// 定义事件
const emit = defineEmits(['refresh', 'edit'])

// 状态管理
const medicineStore = useMedicineStore()
const searchKeyword = ref('') // 搜索关键词
const loading = ref(false) // 加载状态
const currentPage = ref(1) // 当前页码
const pageSize = ref(30) // 每页数量

// 总记录数
const total = computed(() => medicineStore.total)

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
 * 排序后的使用记录
 */
const sortedRecords = computed(() => {
  return medicineStore.useRecords
    .map(record => {
      return {
        ...record,
        medicineName: record.medicine_name || '已删除药品',
        type: record.medicine_type || 'human',
        useDate: record.use_date,
        useNum: record.use_num,
        useRemark: record.use_remark,
        createdAt: record.created_at
      }
    })
    .sort((a, b) => new Date(b.useDate) - new Date(a.useDate))
})

/**
 * 获取行样式类名
 * @param {Object} row - 行数据
 * @returns {string} 样式类名
 */
const getRowClassName = ({ row }) => {
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

/**
 * 处理搜索
 */
const handleSearch = () => {
  // 搜索时重置页码
  currentPage.value = 1
}

/**
 * 处理页码大小变化
 * @param {number} size - 每页数量
 */
const handleSizeChange = async (size) => {
  pageSize.value = size
  currentPage.value = 1
  // 调用后端接口获取数据
  await medicineStore.getMedicines({
    page: currentPage.value,
    pageSize: pageSize.value
  })
}

/**
 * 处理页码变化
 * @param {number} current - 当前页码
 */
const handleCurrentChange = async (current) => {
  currentPage.value = current
  // 调用后端接口获取数据
  await medicineStore.getMedicines({
    page: currentPage.value,
    pageSize: pageSize.value
  })
}

/**
 * 处理编辑
 * @param {Object} medicine - 药品数据
 */
const handleEdit = (medicine) => {
  emit('edit', medicine)
}

/**
 * 处理删除
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
    emit('refresh')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
      ElMessage.error('删除失败，请重试！')
    }
  }
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

// 监听药品列表变化，显示加载动画
watch(() => medicineStore.medicines, () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
  }, 300)
}, { immediate: true })

// 组件挂载时请求数据
onMounted(async () => {
  // 请求药品列表
  await medicineStore.getMedicines({
    page: currentPage.value,
    pageSize: pageSize.value
  })
  // 请求使用记录列表
  await medicineStore.getUseRecords()
})
</script>

<style scoped>
.medicine-list-container {
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

.card-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 18px;
  font-weight: 600;
  color: #2563eb;
  margin-bottom: 20px;
  padding-bottom: 12px;
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

:deep(.el-table .expire-soon) {
  background-color: #fffbeb;
}

:deep(.el-table .expire-soon:hover > td) {
  background-color: #fef3c7;
}

:deep(.el-table .expired) {
  background-color: #fec2c2;
}

:deep(.el-table .expired:hover > td) {
  background-color: #fee2e2;
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

.empty-state {
  padding: 40px 20px;
  text-align: center;
}

:deep(.el-empty__description) {
  color: #94a3b8;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

:deep(.el-pagination) {
  margin-top: 0;
}

:deep(.el-pagination__sizes .el-input .el-input__inner) {
  border-radius: 6px;
}

:deep(.el-pagination button) {
  border-radius: 6px;
  transition: all 0.3s ease;
}

:deep(.el-pagination button:hover) {
  color: #3b82f6;
  border-color: #3b82f6;
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

@media (max-width: 768px) {
  .card-title {
    font-size: 16px;
  }
  
  :deep(.el-table) {
    font-size: 12px;
  }
  
  :deep(.el-button--small) {
    padding: 5px 8px;
    font-size: 12px;
  }
}
</style>
