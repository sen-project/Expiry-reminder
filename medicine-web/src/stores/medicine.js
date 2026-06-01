import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import COS from 'cos-js-sdk-v5'
import {
  getMedicineList,
  addMedicine,
  updateMedicine,
  deleteMedicine,
  importMedicines,
  exportMedicines,
  addMedicineUseRecord,
  getMedicineUseRecordList,
  deleteMedicineUseRecord
} from '../api/index.js'

export const useMedicineStore = defineStore('medicine', () => {
  // 状态管理
  const medicines = ref([])
  const useRecords = ref([])
  const loading = ref(false)
  const total = ref(0)

  // COS 配置 - 从环境变量读取
  const cosConfig = {
    Bucket: import.meta.env.VITE_COS_BUCKET || '',
    Region: import.meta.env.VITE_COS_REGION || '',
    SecretId: import.meta.env.VITE_COS_SECRET_ID || '',
    SecretKey: import.meta.env.VITE_COS_SECRET_KEY || ''
  }

  // 创建 COS 实例
  const cos = new COS({
    SecretId: cosConfig.SecretId,
    SecretKey: cosConfig.SecretKey
  })

  /**
   * 统计数据计算
   * @returns {Object} 统计数据
   */
  const stats = computed(() => {
    const total = medicines.value.length
    const human = medicines.value.filter(m => m.type === 'human').length
    const pet = medicines.value.filter(m => m.type === 'pet').length
    let expireSoon = 0
    let expired = 0
    
    medicines.value.forEach(m => {
      const status = getExpireStatus(m.expiry_date)
      if (status.class === 'expire-soon') expireSoon++
      if (status.class === 'expired') expired++
    })
    
    return {
      total,
      human,
      pet,
      expireSoon,
      expired,
      records: useRecords.value.length
    }
  })

  /**
   * 获取药品过期状态
   * @param {string} expireDateStr - 过期日期字符串
   * @returns {Object} 状态信息
   */
  const getExpireStatus = (expireDateStr) => {
    if (!expireDateStr) return { text: '未填写', class: '' }
    
    const now = new Date()
    const expireDate = new Date(expireDateStr)
    const diffTime = expireDate - now
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    if (diffDays < 0) {
      return { text: `已过期${Math.abs(diffDays)}天`, class: 'expired' }
    } else if (diffDays <= 30) {
      return { text: `仅剩${diffDays}天到期`, class: 'expire-soon' }
    } else {
      return { text: `正常（剩余${diffDays}天）`, class: '' }
    }
  }

  /**
   * 上传图片到 OSS
   * @param {string} photoUrl - 本地图片的 Base64 或 Blob URL
   * @returns {Promise<string>} 上传后的 OSS 图片路径
   */
  const uploadImageToOSS = async (photoUrl) => {
    if (!photoUrl) return ''
    
    // 如果已经是 OSS 路径，直接返回
    if (photoUrl.startsWith('http')) {
      return photoUrl
    }
    
    return new Promise((resolve, reject) => {
      // 将 Base64 转换为 Blob
      fetch(photoUrl)
        .then(response => response.blob())
        .then(blob => {
          const fileName = `photos/${Date.now()}_${Math.floor(Math.random() * 10000)}.${blob.type.split('/')[1] || 'jpg'}`
          
          cos.putObject({
            Bucket: cosConfig.Bucket,
            Region: cosConfig.Region,
            Key: fileName,
            Body: blob,
            ContentType: blob.type
          }, (err, data) => {
            if (err) {
              console.error('OSS 上传失败:', err)
              reject(new Error('图片上传失败'))
            } else {
              // 构建完整的 OSS 访问路径
              const ossUrl = `https://${cosConfig.Bucket}.cos.${cosConfig.Region}.myqcloud.com/${fileName}`
              resolve(ossUrl)
            }
          })
        })
        .catch(error => {
          console.error('图片处理失败:', error)
          reject(new Error('图片处理失败'))
        })
    })
  }

  /**
   * 构建药品数据
   * @param {Object} medicine - 药品数据
   * @param {string} [id] - 药品ID（更新时需要）
   * @returns {Object} 构建好的数据
   */
  /**
   * 格式化日期为YYYY-MM-DD格式
   * @param {string|Date} date - 日期
   * @returns {string} 格式化后的日期字符串
   */
  const formatDate = (date) => {
    if (!date) return ''
    const d = new Date(date)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  /**
   * 构建药品数据
   * @param {Object} medicine - 药品数据
   * @param {string} [id] - 药品ID（更新时需要）
   * @returns {Object} 构建好的数据
   */
  const buildMedicineData = (medicine, id = '') => {
    const data = {
      name: medicine.name,
      type: medicine.type,
      purchaseDate: formatDate(medicine.produceDate),
      expiryDate: formatDate(medicine.expireDate),
      note: medicine.remark || '',
      location: medicine.location || '',
      remainNum: medicine.remainNum || '',
      unit: medicine.unit || '',
      image: medicine.photoUrl || ''
    }
    
    if (id) {
      data.id = id
    }
    
    return data
  }

  /**
   * 获取药品列表
   * @param {Object} params - 查询参数
   * @returns {Promise<Array>} 药品列表
   */
  const getMedicines = async (params = {}) => {
    loading.value = true
    
    try {
      const defaultParams = {
        userId: localStorage.getItem('userId') || '',
        type: params.type || '',
        expiryStatus: params.expiryStatus || ''
      }
      
      const res = await getMedicineList(defaultParams)
      
      if (res.code === 200) {
        // API 已改为全量返回模式，直接返回数组
        medicines.value = res.data || []
        total.value = medicines.value.length
        return medicines.value
      }
      
      return []
    } catch (error) {
      console.error('获取药品列表失败:', error)
      return []
    } finally {
      loading.value = false
    }
  }

  /**
   * 添加药品
   * @param {Object} medicine - 药品数据
   * @returns {Promise<Object>} 添加结果
   */
  const addMedicineRecord = async (medicine) => {
    loading.value = true
    
    try {
      // 上传图片到 OSS
      if (medicine.photoUrl) {
        medicine.photoUrl = await uploadImageToOSS(medicine.photoUrl)
      }
      
      // 构建药品数据
      const data = buildMedicineData(medicine)
      
      // 调用 API
      const res = await addMedicine(data)
      
      if (res.code === 200) {
        await getMedicines()
        return res.data
      }
      
      throw new Error(res.msg || '添加失败')
    } catch (error) {
      console.error('添加药品失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  /**
   * 更新药品
   * @param {string} id - 药品ID
   * @param {Object} medicine - 药品数据
   * @returns {Promise<Object>} 更新结果
   */
  const updateMedicineRecord = async (id, medicine) => {
    loading.value = true
    
    try {
      // 上传图片到 OSS
      if (medicine.photoUrl) {
        medicine.photoUrl = await uploadImageToOSS(medicine.photoUrl)
      }
      
      // 构建药品数据
      const data = buildMedicineData(medicine, id)
      
      // 调用 API
      const res = await updateMedicine(data)
      
      if (res.code === 200) {
        await getMedicines()
        return res.data
      }
      
      throw new Error(res.msg || '更新失败')
    } catch (error) {
      console.error('更新药品失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  /**
   * 删除药品
   * @param {string} id - 药品ID
   * @returns {Promise<Object>} 删除结果
   */
  const deleteMedicineRecord = async (id) => {
    loading.value = true
    
    try {
      const res = await deleteMedicine(id)
      
      if (res.code === 200) {
        await getMedicines()
        return res.data
      }
      
      throw new Error(res.msg || '删除失败')
    } catch (error) {
      console.error('删除药品失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  /**
   * 导入药品数据
   * @param {File} file - 导入文件
   * @returns {Promise<Object>} 导入结果
   */
  const importMedicineData = async (file) => {
    loading.value = true
    
    try {
      const formData = new FormData()
      formData.append('file', file)
      
      const res = await importMedicines(formData)
      
      if (res.code === 200) {
        await getMedicines()
        return res.data
      }
      
      throw new Error(res.msg || '导入失败')
    } catch (error) {
      console.error('导入药品失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  /**
   * 导出药品数据
   */
  const exportMedicineData = async () => {
    loading.value = true
    
    try {
      const blob = await exportMedicines()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      
      a.href = url
      a.download = `药品清单_${new Date().toISOString().split('T')[0]}.xlsx`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('导出药品失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  /**
   * 获取药品使用记录列表
   * @param {Object} params - 查询参数
   * @returns {Promise<Array>} 使用记录列表
   */
  const getUseRecords = async (params = {}) => {
    loading.value = true
    
    try {
      const defaultParams = {
        page: params.page || 1,
        pageSize: params.pageSize || 30,
        medicineName: params.medicineName || '',
        medicineType: params.medicineType || '',
        useDate: params.useDate || ''
      }
      
      const res = await getMedicineUseRecordList(defaultParams)
      
      if (res.code === 200) {
        useRecords.value = res.data.list || []
        return useRecords.value
      }
      
      return []
    } catch (error) {
      console.error('获取使用记录失败:', error)
      return []
    } finally {
      loading.value = false
    }
  }

  /**
   * 添加药品使用记录
   * @param {Object} record - 使用记录数据
   * @returns {Promise<Object>} 添加结果
   */
  const addUseRecord = async (record) => {
    loading.value = true
    
    try {
      // 格式化日期为YYYY-MM-DD格式
      const formattedRecord = {
        ...record,
        useDate: formatDate(record.useDate)
      }
      
      const res = await addMedicineUseRecord(formattedRecord)
      
      if (res.code === 200) {
        await getUseRecords()
        await getMedicines()
        return res.data
      }
      
      throw new Error(res.msg || '添加失败')
    } catch (error) {
      console.error('添加使用记录失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  /**
   * 删除药品使用记录
   * @param {string} id - 记录ID
   * @returns {Promise<Object>} 删除结果
   */
  const deleteUseRecord = async (id) => {
    loading.value = true
    
    try {
      const res = await deleteMedicineUseRecord(id)
      
      if (res.code === 200) {
        await getUseRecords()
        return res.data
      }
      
      throw new Error(res.msg || '删除失败')
    } catch (error) {
      console.error('删除使用记录失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  /**
   * 上传照片（本地预览）
   * @param {File} file - 照片文件
   * @returns {Promise<string>} 照片的 Base64 编码
   */
  const uploadPhoto = async (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        resolve(e.target.result)
      }
      reader.readAsDataURL(file)
    })
  }

  /**
   * 初始化数据
   */
  const initData = async () => {
    await getMedicines()
    await getUseRecords()
  }

  return {
    // 状态
    medicines,
    useRecords,
    loading,
    total,
    
    // 计算属性
    stats,
    
    // 方法
    getExpireStatus,
    getMedicines,
    addMedicine: addMedicineRecord,
    updateMedicine: updateMedicineRecord,
    deleteMedicine: deleteMedicineRecord,
    importMedicines: importMedicineData,
    exportMedicines: exportMedicineData,
    getUseRecords,
    addUseRecord,
    deleteUseRecord,
    uploadPhoto,
    initData
  }
})
