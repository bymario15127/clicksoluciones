import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { quotesService } from '../services/quotes'

const QuoteDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [quote, setQuote] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadQuote()
  }, [id])

  const loadQuote = async () => {
    try {
      const data = await quotesService.getById(id)
      console.log('Cotización cargada:', data)
      setQuote(data)
    } catch (error) {
      console.error('Error loading quote:', error)
      alert('Error al cargar la cotización')
    } finally {
      setLoading(false)
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

  const getStatusLabel = (status) => {
    const labels = {
      'borrador': 'Borrador',
      'enviada': 'Enviada',
      'aprobada': 'Aprobada',
      'rechazada': 'Rechazada'
    }
    return labels[status] || status
  }

  const handleStatusChange = async (newStatus) => {
    try {
      await quotesService.update(id, { status: newStatus })
      setQuote({ ...quote, status: newStatus })
      alert('Estado actualizado correctamente')
    } catch (error) {
      console.error('Error updating status:', error)
      alert('Error al actualizar el estado')
    }
  }

  const handleDelete = async () => {
    if (!confirm('¿Está seguro de eliminar esta cotización?')) return

    try {
      await quotesService.delete(id)
      navigate('/cotizaciones')
    } catch (error) {
      console.error('Error deleting quote:', error)
      alert('Error al eliminar la cotización')
    }
  }

  if (loading) {
    return <div>Cargando...</div>
  }

  if (!quote) {
    return <div>Cotización no encontrada</div>
  }

  return (
    <div className="quote-detail-page">
      <div className="page-header">
        <div>
          <h1>Cotización #{quote.id}</h1>
          <span className={`badge ${getStatusBadge(quote.status)}`}>
            {getStatusLabel(quote.status)}
          </span>
        </div>
        <button onClick={() => navigate('/cotizaciones')} className="btn btn-secondary">
          Volver
        </button>
      </div>

      <div className="card" style={{ marginBottom: '20px' }}>
        <h3>Información General</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div>
            <p><strong>Cliente:</strong> {quote.client_name || 'N/A'}</p>
            <p><strong>Comercial:</strong> {quote.sales_name || 'N/A'}</p>
          </div>
          <div>
            <p><strong>Fecha de creación:</strong> {new Date(quote.created_at).toLocaleDateString()}</p>
            <p><strong>Estado:</strong> {getStatusLabel(quote.status)}</p>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '20px' }}>
        <h3>Productos</h3>
        <table>
          <thead>
            <tr>
              <th>Producto</th>
              <th>Cantidad</th>
              <th>Precio Unitario</th>
              <th>IVA %</th>
              <th>Subtotal</th>
              <th>IVA</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {quote.items && quote.items.map((item, index) => {
              const subtotal = item.quantity * item.price
              const iva = subtotal * (item.iva / 100)
              const total = item.total || (subtotal + iva)
              
              return (
                <tr key={index}>
                  <td>{item.product_name || item.product?.name || 'N/A'}</td>
                  <td>{item.quantity}</td>
                  <td>${parseFloat(item.price).toLocaleString()}</td>
                  <td>{item.iva}%</td>
                  <td>${subtotal.toLocaleString()}</td>
                  <td>${iva.toLocaleString()}</td>
                  <td>${total.toLocaleString()}</td>
                </tr>
              )
            })}
            <tr style={{ fontWeight: 'bold', borderTop: '2px solid #ddd' }}>
              <td colSpan="4" style={{ textAlign: 'right' }}>TOTALES:</td>
              <td>${parseFloat(quote.subtotal).toLocaleString()}</td>
              <td>${parseFloat(quote.iva_total).toLocaleString()}</td>
              <td>${parseFloat(quote.total).toLocaleString()}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="card">
        <h3>Acciones</h3>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {quote.status === 'borrador' && (
            <button onClick={() => handleStatusChange('enviada')} className="btn btn-info">
              Marcar como Enviada
            </button>
          )}
          {quote.status === 'enviada' && (
            <>
              <button onClick={() => handleStatusChange('aprobada')} className="btn btn-success">
                Aprobar
              </button>
              <button onClick={() => handleStatusChange('rechazada')} className="btn btn-danger">
                Rechazar
              </button>
            </>
          )}
          <button onClick={handleDelete} className="btn btn-danger">
            Eliminar Cotización
          </button>
        </div>
      </div>
    </div>
  )
}

export default QuoteDetail
