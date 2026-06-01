<template>
  <div class="stats-container">
    <div class="stats-grid">
      <div
        v-for="(stat, index) in statsItems"
        :key="index"
        class="stat-card"
        :class="`stat-card-${index}`"
      >
        <div class="stat-icon" :style="{ background: stat.gradient }">
          <el-icon :size="24" color="white">
            <component :is="stat.icon" />
          </el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-number" :style="{ color: stat.color }">
            <CountUp :end-val="stat.value" :duration="1.5" />
          </div>
          <div class="stat-label">{{ stat.label }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Box, User, FirstAidKit, Warning, CircleClose, Document } from '@element-plus/icons-vue'

// 定义属性
const props = defineProps({
  stats: {
    type: Object,
    required: true
  }
})

/**
 * 统计数据项
 */
const statsItems = computed(() => [
  {
    label: '药品总数',
    value: props.stats.total || 0,
    icon: Box,
    color: '#3b82f6',
    gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
  },
  {
    label: '人用药数量',
    value: props.stats.human || 0,
    icon: User,
    color: '#10b981',
    gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
  },
  {
    label: '宠物药数量',
    value: props.stats.pet || 0,
    icon: FirstAidKit,
    color: '#f59e0b',
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
  },
  {
    label: '近30天到期',
    value: props.stats.expireSoon || 0,
    icon: Warning,
    color: '#f59e0b',
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
  },
  {
    label: '已过期药品',
    value: props.stats.expired || 0,
    icon: CircleClose,
    color: '#ef4444',
    gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
  },
  {
    label: '使用记录数',
    value: props.stats.records || 0,
    icon: Document,
    color: '#8b5cf6',
    gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)'
  }
])
</script>

<script>
import { defineComponent } from 'vue'

/**
 * 数字计数动画组件
 */
const CountUp = defineComponent({
  name: 'CountUp',
  props: {
    endVal: {
      type: Number,
      default: 0
    },
    duration: {
      type: Number,
      default: 1
    }
  },
  data() {
    return {
      displayValue: 0
    }
  },
  mounted() {
    this.animate()
  },
  methods: {
    /**
     * 执行数字动画
     */
    animate() {
      const startTime = performance.now()
      const animateValue = (currentTime) => {
        const elapsed = (currentTime - startTime) / 1000
        const progress = Math.min(elapsed / this.duration, 1)
        
        this.displayValue = Math.floor(progress * this.endVal)
        
        if (progress < 1) {
          requestAnimationFrame(animateValue)
        } else {
          this.displayValue = this.endVal
        }
      }
      requestAnimationFrame(animateValue)
    }
  },
  watch: {
    /**
     * 监听结束值变化，重新执行动画
     */
    endVal() {
      this.animate()
    }
  },
  template: `
    <span>{{ displayValue }}</span>
  `
})

export default {
  components: {
    CountUp
  }
}
</script>

<style scoped>
.stats-container {
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

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: linear-gradient(90deg, #3b82f6 0%, #2563eb 100%);
}

.stat-card-0::before {
  background: linear-gradient(90deg, #3b82f6 0%, #2563eb 100%);
}

.stat-card-1::before {
  background: linear-gradient(90deg, #10b981 0%, #059669 100%);
}

.stat-card-2::before {
  background: linear-gradient(90deg, #f59e0b 0%, #d97706 100%);
}

.stat-card-3::before {
  background: linear-gradient(90deg, #f59e0b 0%, #d97706 100%);
}

.stat-card-4::before {
  background: linear-gradient(90deg, #ef4444 0%, #dc2626 100%);
}

.stat-card-5::before {
  background: linear-gradient(90deg, #8b5cf6 0%, #7c3aed 100%);
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 20px -3px rgba(0, 0, 0, 0.15);
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
}

.stat-card:hover .stat-icon {
  transform: scale(1.1) rotate(5deg);
}

.stat-content {
  flex: 1;
  min-width: 0;
}

.stat-number {
  font-size: 28px;
  font-weight: 700;
  line-height: 1.2;
  margin-bottom: 4px;
  transition: all 0.3s ease;
}

.stat-card:hover .stat-number {
  transform: scale(1.05);
}

.stat-label {
  font-size: 13px;
  color: #64748b;
  font-weight: 500;
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
  
  .stat-card {
    padding: 16px;
  }
  
  .stat-icon {
    width: 48px;
    height: 48px;
  }
  
  .stat-number {
    font-size: 24px;
  }
  
  .stat-label {
    font-size: 12px;
  }
}

@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
