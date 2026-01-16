import api from './api'

export const exportService = {
  // Descargar cotización en Excel
  downloadQuote: async (quoteId) => {
    try {
      const response = await api.get(`/export/quote/${quoteId}`, {
        responseType: 'blob'
      })
      
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `Cotizacion_${quoteId}.xlsx`)
      document.body.appendChild(link)
      link.click()
      link.parentElement.removeChild(link)
      
      return true
    } catch (error) {
      console.error('Error descargando cotización:', error)
      throw error
    }
  },



  // Descargar template en blanco
  downloadTemplate: async () => {
    try {
      const response = await api.get('/export/quote-template', {
        responseType: 'blob'
      })
      
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `Cotizacion_Template.xlsx`)
      document.body.appendChild(link)
      link.click()
      link.parentElement.removeChild(link)
      
      return true
    } catch (error) {
      console.error('Error descargando template:', error)
      throw error
    }
  },

  // Subir template personalizado
  uploadTemplate: async (file) => {
    try {
      const formData = new FormData()
      formData.append('template', file)

      const response = await fetch('/api/export/template', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      })

      if (!response.ok) {
        throw new Error('Error al subir el template')
      }

      return await response.json()
    } catch (error) {
      console.error('Error subiendo template:', error)
      throw error
    }
  }
}

