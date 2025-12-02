import api from './api'

export const salesService = {
  getAll: async (filters = {}) => {
    const response = await api.get('/sales', { params: filters })
    return response.data
  },

  getById: async (id) => {
    const response = await api.get(`/sales/${id}`)
    return response.data
  },

  create: async (saleData) => {
    const response = await api.post('/sales', saleData)
    return response.data
  },

  downloadPDF: async (id) => {
    const response = await api.get(`/sales/${id}/pdf`, {
      responseType: 'blob'
    })
    return response.data
  }
}
