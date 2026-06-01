<template>
  <div class="login-container">
    <div class="login-background">
      <div class="background-pattern"></div>
    </div>
    <div class="login-content">
      <div class="login-card">
        <div class="login-header">
          <div class="logo">
            <el-icon :size="40" color="white"><FirstAidKit /></el-icon>
          </div>
          <h1 class="login-title">药品管理工具</h1>
          <p class="login-subtitle">家庭药品库存预警系统 | 智能提醒 | 安全便捷</p>
        </div>
        
        <div class="form-tabs">
          <div 
            class="tab-item" 
            :class="{ active: activeTab === 'login' }"
            @click="activeTab = 'login'"
          >
            登录
          </div>
          <div 
            class="tab-item" 
            :class="{ active: activeTab === 'register' }"
            @click="activeTab = 'register'"
          >
            注册
          </div>
        </div>
        
        <el-form
          v-if="activeTab === 'login'"
          ref="loginFormRef"
          :model="loginForm"
          :rules="loginRules"
          class="login-form"
        >
          <el-form-item prop="username">
            <el-input
              v-model="loginForm.username"
              placeholder="请输入邮箱"
              size="large"
              clearable
            >
              <template #prefix>
                <el-icon><Message /></el-icon>
              </template>
            </el-input>
          </el-form-item>
          
          <el-form-item prop="password">
            <el-input
              v-model="loginForm.password"
              type="password"
              placeholder="请输入密码"
              size="large"
              show-password
            >
              <template #prefix>
                <el-icon><Lock /></el-icon>
              </template>
            </el-input>
          </el-form-item>
          
          <el-form-item>
            <div class="login-options">
              <el-checkbox v-model="loginForm.rememberMe">记住我</el-checkbox>
              <a href="#" class="forgot-password">忘记密码？</a>
            </div>
          </el-form-item>
          
          <el-form-item>
            <el-button
              type="primary"
              size="large"
              :loading="loading"
              @click="handleLogin"
              class="login-button"
            >
              <el-icon v-if="!loading" class="button-icon"><Right /></el-icon>
              <span v-if="!loading">登录</span>
              <span v-else>登录中...</span>
            </el-button>
          </el-form-item>
        </el-form>
        
        <el-form
          v-else
          ref="registerFormRef"
          :model="registerForm"
          :rules="registerRules"
          class="login-form"
        >
          <el-form-item prop="username">
            <el-input
              v-model="registerForm.username"
              placeholder="请输入邮箱"
              size="large"
              clearable
            >
              <template #prefix>
                <el-icon><Message /></el-icon>
              </template>
            </el-input>
          </el-form-item>
          
          <el-form-item prop="phone">
            <el-input
              v-model="registerForm.phone"
              placeholder="请输入手机号"
              size="large"
              clearable
            >
              <template #prefix>
                <el-icon><Phone /></el-icon>
              </template>
            </el-input>
          </el-form-item>
          
          <el-form-item prop="password">
            <el-input
              v-model="registerForm.password"
              type="password"
              placeholder="请输入密码"
              size="large"
              show-password
            >
              <template #prefix>
                <el-icon><Lock /></el-icon>
              </template>
            </el-input>
          </el-form-item>
          
          <el-form-item>
            <el-button
              type="primary"
              size="large"
              :loading="loading"
              @click="handleRegister"
              class="login-button"
            >
              <el-icon v-if="!loading" class="button-icon"><Check /></el-icon>
              <span v-if="!loading">注册</span>
              <span v-else>注册中...</span>
            </el-button>
          </el-form-item>
        </el-form>
        
        <div class="login-footer">
          <p v-if="activeTab === 'login'" class="footer-text">默认账号：admin@example.com / 密码：123456</p>
          <p class="copyright">© 2026 药品管理工具 | 专业的家庭药品库存预警系统解决方案</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock, Right, FirstAidKit, Phone, Check } from '@element-plus/icons-vue'
import { userLogin, userRegister } from '../api/index.js'

// 路由实例
const router = useRouter()

// 状态管理
const activeTab = ref('login') // 当前激活的标签页
const loginFormRef = ref(null) // 登录表单引用
const registerFormRef = ref(null) // 注册表单引用
const loading = ref(false) // 加载状态

// 登录表单数据
const loginForm = reactive({
  username: '',
  password: '',
  rememberMe: false
})

// 注册表单数据
const registerForm = reactive({
  username: '',
  phone: '',
  password: ''
})

// 登录表单验证规则
const loginRules = {
  username: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 4, max: 20, message: '密码长度在 4 到 20 个字符', trigger: 'blur' }
  ]
}

// 注册表单验证规则
const registerRules = {
  username: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 4, max: 20, message: '密码长度在 4 到 20 个字符', trigger: 'blur' }
  ]
}

/**
 * 处理登录
 */
const handleLogin = async () => {
  // 表单验证
  if (!loginFormRef.value) return
  
  try {
    await loginFormRef.value.validate()
    loading.value = true
    
    // 调用登录接口
    const res = await userLogin({
      username: loginForm.username,
      password: loginForm.password
    })
    
    if (res.code === 200) {
      // 保存登录状态
      localStorage.setItem('isLoggedIn', 'true')
      localStorage.setItem('token', res.data?.token || '')
      localStorage.setItem('userId', res.data?.id || '')
      localStorage.setItem('username', loginForm.username)
      
      ElMessage.success('登录成功！')
      router.push('/')
    } else {
      ElMessage.error(res.msg || '登录失败')
    }
  } catch (error) {
    console.error('登录失败:', error)
    if (error !== false) {
      ElMessage.error('登录失败，请重试')
    }
  } finally {
    loading.value = false
  }
}

/**
 * 处理注册
 */
const handleRegister = async () => {
  // 表单验证
  if (!registerFormRef.value) return
  
  try {
    await registerFormRef.value.validate()
    loading.value = true
    
    // 调用注册接口
    const res = await userRegister({
      username: registerForm.username,
      phone: registerForm.phone,
      password: registerForm.password
    })
    
    if (res.code === 200) {
      ElMessage.success('注册成功！请登录')
      activeTab.value = 'login'
    } else {
      ElMessage.error(res.msg || '注册失败')
    }
  } catch (error) {
    console.error('注册失败:', error)
    if (error !== false) {
      ElMessage.error('注册失败，请重试')
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.login-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #dbeafe 100%);
  z-index: 0;
}

.background-pattern {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: 
    radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 50%, rgba(16, 185, 129, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 50% 80%, rgba(245, 158, 11, 0.05) 0%, transparent 50%);
  animation: patternMove 20s ease-in-out infinite;
}

@keyframes patternMove {
  0%, 100% {
    transform: translateX(0) translateY(0);
  }
  50% {
    transform: translateX(20px) translateY(-20px);
  }
}

.login-content {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 420px;
  padding: 20px;
}

.login-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  padding: 48px 40px;
  box-shadow: 0 8px 32px rgba(59, 130, 246, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.8);
  animation: cardSlideUp 0.6s ease-out;
}

@keyframes cardSlideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.login-header {
  text-align: center;
  margin-bottom: 40px;
}

.logo {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  border-radius: 20px;
  margin-bottom: 20px;
  box-shadow: 0 8px 24px rgba(59, 130, 246, 0.3);
  animation: logoPulse 2s ease-in-out infinite;
}

@keyframes logoPulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.login-title {
  font-size: 28px;
  font-weight: 700;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 8px;
}

.login-subtitle {
  font-size: 14px;
  color: #64748b;
  font-weight: 500;
}

.form-tabs {
  display: flex;
  margin-bottom: 32px;
  border-bottom: 1px solid #e2e8f0;
}

.tab-item {
  flex: 1;
  text-align: center;
  padding: 12px 0;
  font-size: 16px;
  font-weight: 500;
  color: #64748b;
  cursor: pointer;
  transition: all 0.3s ease;
  border-bottom: 2px solid transparent;
}

.tab-item:hover {
  color: #3b82f6;
}

.tab-item.active {
  color: #3b82f6;
  border-bottom-color: #3b82f6;
  font-weight: 600;
}

.login-form {
  margin-bottom: 24px;
}

.login-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.forgot-password {
  color: #3b82f6;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: color 0.3s ease;
}

.forgot-password:hover {
  color: #2563eb;
  text-decoration: underline;
}

.login-button {
  width: 100%;
  height: 48px;
  font-size: 16px;
  font-weight: 600;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  border: none;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  transition: all 0.3s ease;
}

.login-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
}

.button-icon {
  margin-right: 8px;
}

.login-footer {
  text-align: center;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #e2e8f0;
}

.footer-text {
  font-size: 13px;
  color: #64748b;
  margin-bottom: 8px;
}

.copyright {
  font-size: 12px;
  color: #94a3b8;
}

@media (max-width: 768px) {
  .login-card {
    padding: 32px 24px;
  }
  
  .login-title {
    font-size: 24px;
  }
  
  .logo {
    width: 64px;
    height: 64px;
  }
  
  .form-tabs {
    margin-bottom: 24px;
  }
  
  .tab-item {
    font-size: 14px;
    padding: 10px 0;
  }
}
</style>
