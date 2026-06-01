<template>
  <div class="sidebar" :class="{ open: open }">
    <!-- 品牌标识 -->
    <div class="sidebar-header">
      <div class="logo">
        <el-icon :size="32" color="white"><FirstAidKit /></el-icon>
      </div>
      <div class="brand-text">
        <h2>家庭药品库存预警系统</h2>
        <p>智能管理工具</p>
      </div>
    </div>
    
    <!-- 导航菜单 -->
    <div class="sidebar-menu">
      <el-menu
        :default-active="activeMenu"
        class="sidebar-nav"
        @select="handleMenuSelect"
      >
        <el-menu-item index="/dashboard">
          <el-icon><DataAnalysis /></el-icon>
          <span>数据汇总</span>
        </el-menu-item>
        <el-menu-item index="/medicines">
          <el-icon><Box /></el-icon>
          <span>药品管理</span>
        </el-menu-item>
        <el-menu-item index="/records">
          <el-icon><Notebook /></el-icon>
          <span>使用记录</span>
        </el-menu-item>
        <el-menu-item index="/excel">
          <el-icon><DocumentCopy /></el-icon>
          <span>数据导入导出</span>
        </el-menu-item>
        <el-menu-item index="/contacts">
          <el-icon><Message /></el-icon>
          <span>通知人员设置</span>
        </el-menu-item>
      </el-menu>
    </div>
    
    <!-- 用户信息区域 -->
    <div class="sidebar-footer">
      <div class="user-profile">
        <div class="avatar">
          <el-icon :size="24" color="white"><User /></el-icon>
        </div>
        <div class="user-info">
          <div class="username">{{ username }}</div>
          <div class="user-role">管理员</div>
        </div>
      </div>
      <el-dropdown @command="handleCommand" trigger="click">
        <el-button type="text" class="settings-btn">
          <el-icon><Setting /></el-icon>
          <span>设置</span>
        </el-button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="logout">
              <el-icon><SwitchButton /></el-icon>
              退出登录
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  FirstAidKit, 
  DataAnalysis, 
  Box, 
  Notebook, 
  Document, 
  User, 
  Setting, 
  Message, 
  SwitchButton 
} from '@element-plus/icons-vue'

// 组件属性
const props = defineProps({
  open: {
    type: Boolean,
    default: false
  }
})

// 路由实例
const router = useRouter()
const route = useRoute()

// 用户名
const username = ref('')

// 计算当前激活的菜单
const activeMenu = computed(() => {
  return route.path || '/dashboard'
})

/**
 * 处理菜单选择
 * @param {string} key - 菜单索引
 */
const handleMenuSelect = (key) => {
  router.push(key)
}

/**
 * 处理下拉菜单命令
 * @param {string} command - 命令名称
 */
const handleCommand = async (command) => {
  if (command === 'logout') {
    try {
      await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      
      // 清除登录状态
      localStorage.removeItem('isLoggedIn')
      localStorage.removeItem('username')
      localStorage.removeItem('token')
      
      ElMessage.success('已退出登录')
      router.push('/entry')
    } catch (error) {
      console.log('取消退出登录')
    }
  }
}

/**
 * 页面挂载
 */
onMounted(() => {
  // 获取用户名
  username.value = localStorage.getItem('username') || '用户'
})
</script>

<style scoped>
.sidebar {
  width: 250px;
  height: 100vh;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  display: flex;
  flex-direction: column;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 1000;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.sidebar-header {
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.logo {
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
}

.brand-text h2 {
  font-size: 18px;
  font-weight: 700;
  margin: 0 0 4px 0;
  line-height: 1.2;
}

.brand-text p {
  font-size: 12px;
  opacity: 0.8;
  margin: 0;
}

.sidebar-menu {
  flex: 1;
  padding: 24px 0;
}

.sidebar-nav {
  background: transparent;
  border: none;
}

:deep(.el-menu) {
  background: transparent;
  border: none;
}

:deep(.el-menu-item) {
  height: 56px;
  line-height: 56px;
  margin: 8px 16px;
  border-radius: 12px;
  color: rgba(255, 255, 255, 0.8);
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  font-weight: 500;
}

:deep(.el-menu-item:hover) {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  transform: translateX(4px);
}

:deep(.el-menu-item.is-active) {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

:deep(.el-menu-item.is-active::before) {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 24px;
  background: white;
  border-radius: 0 4px 4px 0;
}

:deep(.el-menu-item .el-icon) {
  font-size: 18px;
}

.sidebar-footer {
  padding: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  transition: all 0.3s ease;
}

.user-profile:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
}

.avatar {
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.user-info {
  flex: 1;
  min-width: 0;
}

.username {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-role {
  font-size: 12px;
  opacity: 0.7;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.settings-btn {
  width: 100%;
  color: rgba(255, 255, 255, 0.8);
  justify-content: flex-start;
  gap: 10px;
  font-size: 14px;
  padding: 10px 12px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.settings-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

:deep(.el-dropdown-menu) {
  background: rgba(15, 23, 42, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

:deep(.el-dropdown-item) {
  color: rgba(255, 255, 255, 0.8);
  padding: 8px 16px;
  transition: all 0.3s ease;
  font-size: 13px;
}

:deep(.el-dropdown-item:hover) {
  background: rgba(59, 130, 246, 0.2);
  color: white;
}

:deep(.el-dropdown-item .el-icon) {
  margin-right: 8px;
  font-size: 14px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .sidebar {
    width: 200px;
  }
  
  .brand-text h2 {
    font-size: 16px;
  }
  
  .sidebar-header {
    padding: 16px;
    gap: 12px;
  }
  
  :deep(.el-menu-item) {
    height: 48px;
    line-height: 48px;
    font-size: 13px;
  }
  
  .logo {
    width: 40px;
    height: 40px;
  }
  
  .user-profile {
    padding: 10px;
  }
  
  .avatar {
    width: 36px;
    height: 36px;
  }
}

@media (max-width: 480px) {
  .sidebar {
    width: 100%;
    transform: translateX(-100%);
    z-index: 9999;
  }
  
  .sidebar.open {
    transform: translateX(0);
  }
}
</style>