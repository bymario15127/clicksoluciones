import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { quotesService } from '../services/quotes'

const Quotes = () => {
  const [quotes, setQuotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('') // 'success' o 'error'

  useEffect(() => {
    loadQuotes()
  }, [])

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage('')
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [message])

  const loadQuotes = async () => {
    try {
      const data = await quotesService.getAll()
      console.log('Cotizaciones cargadas:', data)
      setQuotes(data)
    } catch (error) {
      console.error('Error loading quotes:', error)
    } finally {
      setLoading(false)
    }
  }

  const deleteQuote = async (id) => {
    try {
      await quotesService.delete(id)
      setMessageType('success')
      setMessage('✅ Cotización eliminada exitosamente')
      loadQuotes()
    } catch (error) {
      console.error('Error deleting quote:', error)
      setMessageType('error')
      setMessage('❌ Error al eliminar la cotización')
    }
  }

  const getStatusBadge = (status) => {
    const badges = {
      'borrador': 'badge-secondary',
      'enviada': 'badge-info',
      'aprobada': 'badge-success',
      'rechazada': 'badge-danger'
    }
    return badges[status] || 'badge-secondary'
  }

  if (loading) {
    return <div>Cargando...</div>
  }

  return (
    <div className="quotes-page">
      {message && (
        <div style={{
          padding: '15px 20px',
          marginBottom: '20px',
          borderRadius: '8px',
          backgroundColor: messageType === 'success' ? '#d4edda' : '#f8d7da',
          borderLeft: `4px solid ${messageType === 'success' ? '#28a745' : '#dc3545'}`,
          color: messageType === 'success' ? '#155724' : '#721c24',
          fontSize: '16px',
          fontWeight: '500',
          animation: 'slideDown 0.3s ease-in-out'
        }}>
          {message}
        </div>
      )}

      <div className="page-header">
        <h1>Cotizaciones</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Link to="/cotizaciones/new" className="btn btn-primary">
            ➕ Crear Cotización
          </Link>
        </div>
      </div>

      <div className="card">
        {quotes.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
            <p>No hay cotizaciones registradas</p>
            <Link to="/cotizaciones/new" className="btn btn-primary" style={{ marginTop: '20px' }}>
              Crear Primera Cotización
            </Link>
          </div>
        ) : (
          <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Cliente</th>
                <th>Comercial</th>
                <th>Subtotal</th>
                <th>IVA</th>
                <th>Total</th>
                <th>Estado</th>
                <th>Fecha</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {quotes.map(quote => (
                <tr key={quote.id}>
                  <td>#{quote.id}</td>
                  <td>{quote.client?.name}</td>
                  <td>{quote.sales?.name}</td>
                  <td>${quote.subtotal}</td>
                  <td>${quote.iva_total}</td>
                  <td>${quote.total}</td>
                  <td>
                    <span className={`badge ${getStatusBadge(quote.status)}`}>
                      {quote.status}
                    </span>
                  </td>
                  <td>{new Date(quote.created_at).toLocaleDateString()}</td>
                  <td>
                    <Link to={`/cotizaciones/${quote.id}`} className="btn btn-sm btn-primary">
                      Ver
                    </Link>
                    <button 
                      onClick={() => deleteQuote(quote.id)}
                      className="btn btn-sm btn-danger"
                      style={{ marginLeft: '5px' }}
                      title="Eliminar cotización"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default Quotes
