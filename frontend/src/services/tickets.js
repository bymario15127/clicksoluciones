import api from './api'

export const ticketsService = {
  getAll: async (filters = {}) => {
    const response = await api.get('/tickets', { params: filters })
    return response.data
  },

  getById: async (id) => {
    const response = await api.get(`/tickets/${id}`)
    return response.data
  },

  create: async (ticketData) => {
    const response = await api.post('/tickets', ticketData)
    return response.data
  },

  update: async (id, ticketData) => {
    const response = await api.put(`/tickets/${id}`, ticketData)
    return response.data
  },

  delete: async (id) => {
    const response = await api.delete(`/tickets/${id}`)
    return response.data
  },

  addComment: async (id, comment) => {
    const response = await api.post(`/tickets/${id}/comment`, { comment })
    return response.data
  },

  uploadFile: async (id, file) => {
    const formData = new FormData()
    formData.append('file', file)
    const response = await api.post(`/tickets/${id}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  },

  assignTechnician: async (id, technicianId) => {
    const response = await api.put(`/tickets/${id}`, { technician_id: technicianId })
    return response.data
  },

  updateStatus: async (id, status) => {
    const response = await api.put(`/tickets/${id}`, { status })
    return response.data
  }
}
