<template>
  <div class="dashboard-container">
    <div class="page-header">
      <h1>数据汇总</h1>
      <p>药品管理数据概览</p>
    </div>
    
    <!-- 统计卡片 -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon health">
          <el-icon :size="32"><FirstAidKit /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ totalMedicines }}</div>
          <div class="stat-label">药品总数</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon user">
          <el-icon :size="32"><User /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ humanMedicines }}</div>
          <div class="stat-label">人用药数量</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon pet">
          <el-icon :size="32"><Box /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ petMedicines }}</div>
          <div class="stat-label">宠物药数量</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon warning">
          <el-icon :size="32"><Warning /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ expiredMedicines }}</div>
          <div class="stat-label">过期药品</div>
        </div>
      </div>
    </div>
    
    <!-- 图表区域 -->
    <div class="charts-grid">
      <!-- 药品分类饼图 -->
      <div class="chart-card">
        <div class="chart-title">
          <el-icon :size="18" color="#3b82f6"><PieChart /></el-icon>
          <span>药品分类分布</span>
        </div>
        <div ref="pieChartRef" class="chart-container"></div>
      </div>
      
      <!-- 药品状态柱状图 -->
      <div class="chart-card">
        <div class="chart-title">
          <el-icon :size="18" color="#3b82f6"><DataAnalysis /></el-icon>
          <span>药品状态分析</span>
        </div>
        <div ref="barChartRef" class="chart-container"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useMedicineStore } from '@/stores/medicine'
import { FirstAidKit, User, Box, Warning, PieChart, DataAnalysis } from '@element-plus/icons-vue'
import * as echarts from 'echarts'

// 状态管理
const medicineStore = useMedicineStore()

// 图表引用
const pieChartRef = ref(null)
const barChartRef = ref(null)

// 图表实例
let pieChart = null
let barChart = null

// 计算属性
const totalMedicines = computed(() => medicineStore.medicines.length)

const humanMedicines = computed(() => {
  return medicineStore.medicines.filter(med => med.type === 'human').length
})

const petMedicines = computed(() => {
  return medicineStore.medicines.filter(med => med.type === 'pet').length
})

const expiredMedicines = computed(() => {
  return medicineStore.medicines.filter(med => {
    const status = medicineStore.getExpireStatus(med.expiry_date)
    return status.class === 'expired'
  }).length
})

const validMedicines = computed(() => {
  return medicineStore.medicines.filter(med => {
    const status = medicineStore.getExpireStatus(med.expiry_date)
    return status.class !== 'expired'
  }).length
})

/**
 * 初始化饼图
 */
const initPieChart = () => {
  if (!pieChartRef.value) return
  
  pieChart = echarts.init(pieChartRef.value)
  
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      data: ['人用药', '宠物药']
    },
    series: [
      {
        name: '药品分类',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '18',
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: [
          { value: humanMedicines.value, name: '人用药', itemStyle: { color: '#3b82f6' } },
          { value: petMedicines.value, name: '宠物药', itemStyle: { color: '#10b981' } }
        ]
      }
    ]
  }
  
  pieChart.setOption(option)
}

/**
 * 初始化柱状图
 */
const initBarChart = () => {
  if (!barChartRef.value) return
  
  barChart = echarts.init(barChartRef.value)
  
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['有效药品', '过期药品'],
      axisTick: {
        alignWithLabel: true
      }
    },
    yAxis: {
      type: 'value',
      minInterval: 1
    },
    series: [
      {
        name: '药品数量',
        type: 'bar',
        barWidth: '60%',
        data: [
          {
            value: validMedicines.value,
            itemStyle: { color: '#10b981' }
          },
          {
            value: expiredMedicines.value,
            itemStyle: { color: '#ef4444' }
          }
        ]
      }
    ]
  }
  
  barChart.setOption(option)
}

/**
 * 监听窗口大小变化
 */
const handleResize = () => {
  pieChart?.resize()
  barChart?.resize()
}

/**
 * 页面挂载
 */
onMounted(async () => {
  // 初始化数据
  if (medicineStore.medicines.length === 0) {
    await medicineStore.initData()
  }
  
  // 初始化图表
  setTimeout(() => {
    initPieChart()
    initBarChart()
  }, 100)
  
  // 监听窗口大小变化
  window.addEventListener('resize', handleResize)
})

/**
 * 监听数据变化
 */
watch([humanMedicines, petMedicines, expiredMedicines], () => {
  initPieChart()
  initBarChart()
})
</script>

<style scoped>
.dashboard-container {
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

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
}

.stat-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 20px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.15);
}

.stat-icon {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-icon.health {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  color: #3b82f6;
}

.stat-icon.user {
  background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
  color: #10b981;
}

.stat-icon.pet {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  color: #f59e0b;
}

.stat-icon.warning {
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
  color: #ef4444;
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 32px;
  font-weight: 700;
  color: #1e293b;
  line-height: 1;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: #64748b;
  font-weight: 500;
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 24px;
}

.chart-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
}

.chart-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.15);
}

.chart-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 18px;
  font-weight: 600;
  color: #2563eb;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 2px solid #eff6ff;
}

.chart-container {
  width: 100%;
  height: 300px;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .charts-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .dashboard-container {
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
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
  
  .stat-card {
    padding: 20px;
  }
  
  .stat-icon {
    width: 56px;
    height: 56px;
  }
  
  .stat-icon :deep(.el-icon) {
    font-size: 24px !important;
  }
  
  .stat-number {
    font-size: 28px;
  }
  
  .chart-card {
    padding: 20px;
  }
  
  .chart-container {
    height: 250px;
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
  .dashboard-container {
    padding: 12px;
  }
  
  .stat-card {
    flex-direction: column;
    text-align: center;
    gap: 16px;
  }
  
  .chart-container {
    height: 200px;
  }
  
  :deep(.el-table) {
    font-size: 11px;
  }
}
</style>