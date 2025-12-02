import api from './api'

export const quotesService = {
  getAll: async (filters = {}) => {
    const response = await api.get('/quotes', { params: filters })
    return response.data
  },

  getById: async (id) => {
    const response = await api.get(`/quotes/${id}`)
    return response.data
  },

  create: async (quoteData) => {
    const response = await api.post('/quotes', quoteData)
    return response.data
  },

  update: async (id, quoteData) => {
    const response = await api.put(`/quotes/${id}`, quoteData)
    return response.data
  },

  delete: async (id) => {
    const response = await api.delete(`/quotes/${id}`)
    return response.data
  },

  send: async (id) => {
    const response = await api.post(`/quotes/${id}/send`)
    return response.data
  },

  approve: async (id) => {
    const response = await api.post(`/quotes/${id}/approve`)
    return response.data
  },

  reject: async (id, reason) => {
    const response = await api.post(`/quotes/${id}/reject`, { reason })
    return response.data
  },

  convertToSale: async (id) => {
    const response = await api.post(`/quotes/${id}/convert-to-sale`)
    return response.data
  }
}
