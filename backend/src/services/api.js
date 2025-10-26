const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`
    const token = localStorage.getItem('token')

    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    }

    // Remove Content-Type for FormData
    if (options.body instanceof FormData) {
      delete config.headers['Content-Type']
    }

    try {
      const response = await fetch(url, config)
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || `HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('API Request Error:', error)
      throw error
    }
  }

  // Authentication
  async login(email, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    })
  }

  async register(name, email, password) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password })
    })
  }

  async getProfile() {
    return this.request('/auth/me')
  }

  // Upload
  async uploadFile(formData) {
    return this.request('/upload', {
      method: 'POST',
      body: formData
    })
  }

  async getUserUploads() {
    return this.request('/upload')
  }

  async getUploadById(id) {
    return this.request(`/upload/${id}`)
  }

  async deleteUpload(id) {
    return this.request(`/upload/${id}`, {
      method: 'DELETE'
    })
  }

  // Progress
  async getProgress() {
    return this.request('/progress')
  }
}

export default new ApiService()
