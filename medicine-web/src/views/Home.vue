<template>
  <div class="home-container">
    <!-- 左侧菜单栏 -->
    <Sidebar :open="sidebarOpen" />
    
    <!-- 右侧内容区域 -->
    <div class="content-area">
      <!-- 顶部导航栏 -->
      <div class="top-nav">
        <div class="nav-content">
          <div class="nav-left">
            <el-button type="text" class="menu-toggle" @click="toggleSidebar" v-if="isMobile">
              <el-icon :size="24"><Menu /></el-icon>
            </el-button>
            <h1 class="page-title">{{ currentPageTitle }}</h1>
          </div>
          <div class="nav-right">
            <el-button type="primary" :icon="Refresh" @click="handleRefresh" circle />
          </div>
        </div>
      </div>
      
      <!-- 主内容 -->
      <div class="main-content">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Menu, Refresh } from '@element-plus/icons-vue'
import Sidebar from '@/components/Sidebar.vue'
import { useMedicineStore } from '@/stores/medicine'

// 路由实例
const route = useRoute()
const router = useRouter()

// 状态管理
const medicineStore = useMedicineStore()

// 状态
const isMobile = ref(window.innerWidth < 768)
const sidebarOpen = ref(false)

// 监听窗口大小变化
const handleResize = () => {
  isMobile.value = window.innerWidth < 768
  if (!isMobile.value) {
    sidebarOpen.value = false
  }
}

// 切换侧边栏
const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
}

// 当前页面标题
const currentPageTitle = computed(() => {
  const path = route.path
  if (path === '/dashboard') return '数据汇总'
  if (path === '/medicines') return '药品管理'
  if (path === '/records') return '使用记录'
  if (path === '/excel') return 'Excel管理'
  return '家庭药品库存预警系统'
})

// 刷新数据
const handleRefresh = async () => {
  await medicineStore.initData()
  ElMessage.success('数据已刷新')
}

// 页面挂载
onMounted(async () => {
  await medicineStore.initData()
  window.addEventListener('resize', handleResize)
})

// 页面卸载
onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

// 监听路由变化
watch(() => route.path, () => {
  if (isMobile.value) {
    sidebarOpen.value = false
  }
})
</script>

<style scoped>
.home-container {
  display: flex;
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
}

.content-area {
  flex: 1;
  margin-left: 250px;
  min-height: 100vh;
  transition: all 0.3s ease;
}

.top-nav {
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 99;
}

.nav-content {
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.menu-toggle {
  color: #3b82f6;
  font-size: 20px;
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.main-content {
  min-height: calc(100vh - 72px);
  overflow-x: hidden;
}

@media (max-width: 768px) {
  .content-area {
    margin-left: 0;
  }
  .nav-content {
    padding: 12px 16px;
  }
  .page-title {
    font-size: 18px;
  }
  :deep(.sidebar.open) {
    transform: translateX(0);
  }
}

@media (max-width: 480px) {
  .nav-content {
    padding: 10px 12px;
  }
  .page-title {
    font-size: 16px;
  }
}
</style>