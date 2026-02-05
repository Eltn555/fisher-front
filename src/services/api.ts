// Get API base URL from environment variable or use relative path
const getApiBaseUrl = (): string => {
  const apiUrl = import.meta.env.VITE_API_URL
  return apiUrl || ''
}

// Helper function to get init data from Telegram WebApp
const getInitData = (): string => {
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

  // Submit form data
  submitForm: async (data: {
    date: string
    location: string
    type: string
    value: string
  }) => {
    const response = await fetch(`${getApiBaseUrl()}/miniapp/submit`, {
      method: 'POST',
      headers: createHeaders(true),
      body: JSON.stringify(data),
    })
    return response.json()
  },
}
