import type { ControlCatchData, MainFormData, SalesData, FishStockingData, DeathReportData } from '../types/form.types'

// Get API base URL from environment variable or use relative path
const getApiBaseUrl = (): string => {
  const apiUrl = import.meta.env.VITE_API_URL
  if (!apiUrl) return ''
  
  // Remove quotes and trim whitespace
  return String(apiUrl).replace(/^['"]|['"]$/g, '').trim()
}

// Manual Telegram ID for testing (set to null to use automatic detection)
const MANUAL_TELEGRAM_ID: number | null = 791430493

// Helper function to get init data from Telegram WebApp
const getInitData = (): string => {
  if (MANUAL_TELEGRAM_ID !== null) {
    const userData = encodeURIComponent(JSON.stringify({ id: MANUAL_TELEGRAM_ID }))
    return `user=${userData}`
  }
  
  if (window.Telegram?.WebApp) {
    return window.Telegram.WebApp.initData
  }
  return ''
}

// Helper function to create headers with Telegram init data
const createHeaders = (includeContentType = false): HeadersInit => {
  const headers: HeadersInit = {}
  
  if (includeContentType) {
    headers['Content-Type'] = 'application/json'
  }
  
  const initData = getInitData()
  if (initData) {
    headers['X-Telegram-Init-Data'] = initData
  }
  
  return headers
}

// API Functions

export const api = {
  // Get current user
  getUser: async () => {
    const response = await fetch(`${getApiBaseUrl()}/users/getUser`, {
      headers: createHeaders(),
    })
    return response.json()
  },

  // Get all users
  getUsers: async () => {
    const response = await fetch(`${getApiBaseUrl()}/users/getUsers`, {
      headers: createHeaders(),
    })
    
    if (!response.ok) {
      throw new Error('Failed to load users')
    }
    
    return response.json()
  },

  // Update user
  updateUser: async (data: {
    editorId: number
    userId: number
    role?: 'ADMIN' | 'USER'
    status?: 'ACCEPTED' | 'DECLINED'
  }) => {
    const response = await fetch(`${getApiBaseUrl()}/users/update`, {
      method: 'POST',
      headers: createHeaders(true),
      body: JSON.stringify(data),
    })
    return response.json()
  },

  // Delete user
  deleteUser: async (data: { editorId: number; userId: number }) => {
    const response = await fetch(`${getApiBaseUrl()}/users/delete`, {
      method: 'POST',
      headers: createHeaders(true),
      body: JSON.stringify(data),
    })
    return response.json()
  },

  // Get locations
  getLocations: async () => {
    const response = await fetch(`${getApiBaseUrl()}/miniapp/locations`)
    return response.json()
  },

  //get fishTypes
  getFishTypes: async () => {
    const response = await fetch(`${getApiBaseUrl()}/miniapp/fishTypes`)
    return response.json()
  },

  // submit main form data
  submitMainForm: async (data: MainFormData) => {
    const response = await fetch(`${getApiBaseUrl()}/miniapp/submitMainForm`, {
      method: 'POST',
      headers: createHeaders(true),
      body: JSON.stringify(data),
    })
    return response.json()
  },

  //submit контрольный отлов
  submitControlCatch: async (data: ControlCatchData) => {
    const response = await fetch(`${getApiBaseUrl()}/miniapp/submitControlCatch`, {
      method: 'POST',
      headers: createHeaders(true),
      body: JSON.stringify(data),
    })
    return response.json()
  },

  // submit sales
  submitSales: async (data: SalesData) => {
    const response = await fetch(`${getApiBaseUrl()}/miniapp/submitSales`, {
      method: 'POST',
      headers: createHeaders(true),
      body: JSON.stringify(data),
    })
    return response.json()
  },

  // submit fish stocking
  submitFishStocking: async (data: FishStockingData) => {
    const response = await fetch(`${getApiBaseUrl()}/miniapp/submitFishStocking`, {
      method: 'POST',
      headers: createHeaders(true),
      body: JSON.stringify(data),
    })
    return response.json()
  },

  // death report
  submitDeathReport: async (data: DeathReportData) => {
    const response = await fetch(`${getApiBaseUrl()}/miniapp/submitDeathReport`, {
      method: 'POST',
      headers: createHeaders(true),
      body: JSON.stringify(data),
    })
    return response.json()
  },
}
