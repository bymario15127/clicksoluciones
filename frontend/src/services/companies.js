import axios from 'axios'

const API_URL = 'http://localhost:5000/api'

const getAuthHeader = () => {
  const token = localStorage.getItem('token')
  return { Authorization: `Bearer ${token}` }
}

export const companiesService = {
  async getAll() {
    const response = await axios.get(`${API_URL}/companies`, {
      headers: getAuthHeader()
    })
    return response.data
  },

  async getById(id) {
    const response = await axios.get(`${API_URL}/companies/${id}`, {
      headers: getAuthHeader()
    })
    return response.data
  },

  async create(data) {
    const response = await axios.post(`${API_URL}/companies`, data, {
      headers: getAuthHeader()
    })
    return response.data
  },

  async update(id, data) {
    const response = await axios.put(`${API_URL}/companies/${id}`, data, {
      headers: getAuthHeader()
    })
    return response.data
  },

  async delete(id) {
    const response = await axios.delete(`${API_URL}/companies/${id}`, {
      headers: getAuthHeader()
    })
    return response.data
  }
}
