import api from './api'

export const authService = {
  login: async (username, password) => {
    console.log('🔵 authService.login llamado')
    console.log('🔵 URL base de API:', api.defaults.baseURL)
    const response = await api.post('/auth/login', { username, password })
    console.log('🔵 Respuesta recibida:', response)
    if (response.data.token) {
      localStorage.setItem('token', response.data.token)
      localStorage.setItem('user', JSON.stringify(response.data.user))
    }
    return response.data
  },

  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('user')
    return user ? JSON.parse(user) : null
  },

  getMe: async () => {
    const response = await api.get('/auth/me')
    return response.data
  }
}
