import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/entry',
      name: 'Login',
      component: () => import('@/views/Login.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/',
      name: 'Home',
      component: () => import('@/views/Home.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          redirect: '/dashboard'
        },
        {
          path: 'dashboard',
          name: 'Dashboard',
          component: () => import('@/views/Dashboard.vue')
        },
        {
          path: 'medicines',
          name: 'Medicines',
          component: () => import('@/views/MedicineManagement.vue')
        },
        {
          path: 'records',
          name: 'Records',
          component: () => import('@/views/RecordManagement.vue')
        },
        {
          path: 'excel',
          name: 'Excel',
          component: () => import('@/views/ExcelManagement.vue')
        },
        {
          path: 'contacts',
          name: 'Contacts',
          component: () => import('@/views/ContactsManagement.vue')
        }
      ]
    },
    {
      path: '/medicine',
      redirect: '/medicines',
      meta: { requiresAuth: true }
    },
    {
      path: '/settings',
      redirect: '/',
      meta: { requiresAuth: true }
    },
    {
      path: '/log',
      redirect: '/',
      meta: { requiresAuth: true }
    }
  ]
})

router.beforeEach(async (to, from, next) => {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'
  
  console.log('路由守卫:', to.path, 'isLoggedIn:', isLoggedIn)
  
  // 移除了自动登录功能，避免敏感信息泄露
  if (to.meta.requiresAuth && !isLoggedIn) {
    next('/entry')
  } else if (to.path === '/entry' && isLoggedIn) {
    next('/')
  } else {
    next()
  }
})

export default router
