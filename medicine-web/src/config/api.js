export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

export const API_CONFIG = {
  baseURL: API_BASE_URL,
  timeout: 30000
}

export const API_PATHS = {
  AUTH: {
    REGISTER: '/register',
    LOGIN: '/login'
  },
  USER: {
    REGISTER: '/api/register',
    LOGIN: '/login',
    INFO: '/api/user/info'
  },
  MEDICINE: {
    ADD: '/api/medicine/add',
    LIST: '/api/medicine/list',
    UPDATE: '/api/medicine/update',
    DELETE: (id) => `/api/medicine/delete/${id}`,
    IMPORT: '/api/medicine/import',
    EXPORT: '/api/medicine/export',
    INFO: '/api/medicine/info'
  },
  MEDICINE_USE_RECORD: {
    ADD: '/api/medicine-use-record/add',
    LIST: '/api/medicine-use-record/list',
    DELETE: (id) => `/api/medicine-use-record/delete/${id}`
  },
  CONTACTS: {
    ADD: '/api/user/contact/add',
    DELETE: '/api/user/contact/delete',
    UPDATE: '/api/user/contact/update',
    LIST: '/api/user/contacts'
  },
  NOTIFY: {
    LIST: '/api/notify/list',
    READ: '/api/notify/read',
    BATCH_READ: '/api/notify/batch-read',
    CHECK: '/api/notify/check'
  },
  LOG: {
    LIST: '/api/log/list',
    CLEAR: '/api/log/clear'
  },
  HEALTH: '/health'
}
