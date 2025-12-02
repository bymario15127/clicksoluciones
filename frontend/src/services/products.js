import api from './api'

export const productsService = {
  getAll: async (filters = {}) => {
    const response = await api.get('/products', { params: filters })
    return response.data
  },

  getById: async (id) => {
    const response = await api.get(`/products/${id}`)
    return response.data
  },

  create: async (productData) => {
    const response = await api.post('/products', productData)
    return response.data
  },

  update: async (id, productData) => {
    const response = await api.put(`/products/${id}`, productData)
    return response.data
  },

  delete: async (id) => {
    const response = await api.delete(`/products/${id}`)
    return response.data
  },

  getLowStock: async (threshold = 10) => {
    const response = await api.get('/products', { 
      params: { lowStock: threshold } 
    })
    return response.data
  }
}
