import axios from 'axios'
import { API_CONFIG, API_PATHS } from '../config/api.js'
import { ElMessage } from 'element-plus'

// 创建 axios 实例
const request = axios.create({
  baseURL: API_CONFIG.baseURL,
  timeout: API_CONFIG.timeout
})

// 请求拦截器 - 添加 token
request.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器 - 统一处理错误
request.interceptors.response.use(
  response => {
    return response.data
  },
  error => {
    if (error.response) {
      const { status, data } = error.response
      if (status === 401) {
        ElMessage.error('登录已过期，请重新登录')
        localStorage.removeItem('token')
        localStorage.removeItem('isLoggedIn')
        window.location.href = '/entry'
      } else if (data && data.msg) {
        ElMessage.error(data.msg)
      } else {
        ElMessage.error('请求失败')
      }
    } else {
      ElMessage.error('网络错误，请检查网络连接')
    }
    return Promise.reject(error)
  }
)

/**
 * 注册接口
 * @param {Object} data - 注册数据
 * @returns {Promise} - 注册结果
 */
export function register(data) {
  return request({
    url: API_PATHS.AUTH.REGISTER,
    method: 'post',
    data
  })
}

/**
 * 登录接口
 * @param {Object} data - 登录数据
 * @returns {Promise} - 登录结果
 */
export function login(data) {
  return request({
    url: API_PATHS.AUTH.LOGIN,
    method: 'post',
    data
  })
}

/**
 * 用户注册接口
 * @param {Object} data - 注册数据
 * @returns {Promise} - 注册结果
 */
export function userRegister(data) {
  return request({
    url: API_PATHS.USER.REGISTER,
    method: 'post',
    data
  })
}

/**
 * 用户登录接口
 * @param {Object} data - 登录数据
 * @returns {Promise} - 登录结果
 */
export function userLogin(data) {
  return request({
    url: API_PATHS.USER.LOGIN,
    method: 'post',
    data
  })
}

/**
 * 获取用户信息接口
 * @returns {Promise} - 用户信息
 */
export function getUserInfo() {
  return request({
    url: API_PATHS.USER.INFO,
    method: 'get'
  })
}

/**
 * 添加药品接口
 * @param {Object} data - 药品数据
 * @returns {Promise} - 添加结果
 */
export function addMedicine(data) {
  return request({
    url: API_PATHS.MEDICINE.ADD,
    method: 'post',
    data
  })
}

/**
 * 获取药品列表接口
 * @param {Object} params - 查询参数
 * @returns {Promise} - 药品列表
 */
export function getMedicineList(params) {
  return request({
    url: API_PATHS.MEDICINE.LIST,
    method: 'get',
    params
  })
}

/**
 * 更新药品接口
 * @param {Object} data - 药品数据
 * @returns {Promise} - 更新结果
 */
export function updateMedicine(data) {
  return request({
    url: API_PATHS.MEDICINE.UPDATE,
    method: 'put',
    data
  })
}

/**
 * 删除药品接口
 * @param {string} id - 药品ID
 * @returns {Promise} - 删除结果
 */
export function deleteMedicine(id) {
  return request({
    url: API_PATHS.MEDICINE.DELETE(id),
    method: 'delete'
  })
}

/**
 * 导入药品接口
 * @param {FormData} formData - 导入数据（FormData 格式）
 * @returns {Promise} - 导入结果
 */
export function importMedicines(formData) {
  return request({
    url: API_PATHS.MEDICINE.IMPORT,
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

/**
 * 导出药品接口
 * @returns {Promise} - 导出的文件 blob
 */
export function exportMedicines() {
  return request({
    url: API_PATHS.MEDICINE.EXPORT,
    method: 'get',
    responseType: 'blob'
  })
}

/**
 * 获取药品信息接口
 * @param {string} name - 药品名称
 * @returns {Promise} - 药品信息
 */
export function getMedicineInfo(name) {
  return request({
    url: API_PATHS.MEDICINE.INFO,
    method: 'get',
    params: { name }
  })
}

/**
 * 获取通知列表接口
 * @param {Object} params - 查询参数
 * @returns {Promise} - 通知列表
 */
export function getNotifyList(params) {
  return request({
    url: API_PATHS.NOTIFY.LIST,
    method: 'get',
    params
  })
}

/**
 * 标记通知已读接口
 * @param {Object} data - 通知数据
 * @returns {Promise} - 标记结果
 */
export function markNotifyRead(data) {
  return request({
    url: API_PATHS.NOTIFY.READ,
    method: 'put',
    data
  })
}

/**
 * 批量标记通知已读接口
 * @param {Object} data - 通知数据
 * @returns {Promise} - 标记结果
 */
export function batchMarkRead(data) {
  return request({
    url: API_PATHS.NOTIFY.BATCH_READ,
    method: 'put',
    data
  })
}

/**
 * 检查通知接口
 * @returns {Promise} - 检查结果
 */
export function checkNotify() {
  return request({
    url: API_PATHS.NOTIFY.CHECK,
    method: 'post'
  })
}

/**
 * 健康检查接口
 * @returns {Promise} - 检查结果
 */
export function healthCheck() {
  return request({
    url: API_PATHS.HEALTH,
    method: 'get'
  })
}

/**
 * 添加亲友接口
 * @param {Object} data - 亲友数据
 * @returns {Promise} - 添加结果
 */
export function addContact(data) {
  return request({
    url: API_PATHS.CONTACTS.ADD,
    method: 'post',
    data
  })
}

/**
 * 删除亲友接口
 * @param {Object} data - 亲友数据
 * @returns {Promise} - 删除结果
 */
export function deleteContact(data) {
  return request({
    url: API_PATHS.CONTACTS.DELETE,
    method: 'delete',
    data
  })
}

/**
 * 更新亲友接口
 * @param {Object} data - 亲友数据
 * @returns {Promise} - 更新结果
 */
export function updateContact(data) {
  return request({
    url: API_PATHS.CONTACTS.UPDATE,
    method: 'put',
    data
  })
}

/**
 * 获取亲友列表接口
 * @returns {Promise} - 亲友列表
 */
export function getContacts() {
  return request({
    url: API_PATHS.CONTACTS.LIST,
    method: 'get'
  })
}

/**
 * 新增药品使用记录接口
 * @param {Object} data - 使用记录数据
 * @returns {Promise} - 添加结果
 */
export function addMedicineUseRecord(data) {
  return request({
    url: API_PATHS.MEDICINE_USE_RECORD.ADD,
    method: 'post',
    data
  })
}

/**
 * 获取药品使用记录列表接口
 * @param {Object} params - 查询参数
 * @returns {Promise} - 使用记录列表
 */
export function getMedicineUseRecordList(params) {
  return request({
    url: API_PATHS.MEDICINE_USE_RECORD.LIST,
    method: 'get',
    params
  })
}

/**
 * 删除药品使用记录接口
 * @param {string} id - 记录ID
 * @returns {Promise} - 删除结果
 */
export function deleteMedicineUseRecord(id) {
  return request({
    url: API_PATHS.MEDICINE_USE_RECORD.DELETE(id),
    method: 'delete'
  })
}

/**
 * 获取操作日志列表接口
 * @param {Object} params - 查询参数
 * @returns {Promise} - 日志列表
 */
export function getLogList(params) {
  return request({
    url: API_PATHS.LOG.LIST,
    method: 'get',
    params
  })
}

/**
 * 清除操作日志接口
 * @returns {Promise} - 清除结果
 */
export function clearLogs() {
  return request({
    url: API_PATHS.LOG.CLEAR,
    method: 'delete'
  })
}

export default request
