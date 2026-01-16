import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { quotesService } from '../services/quotes'
import { clientsService } from '../services/clients'
import { productsService } from '../services/products'

const QuoteNew = () => {
  const navigate = useNavigate()
  const [clients, setClients] = useState([])
  const [products, setProducts] = useState([])
  const [formData, setFormData] = useState({
    client_id: '',
    notes: '',
    status: 'borrador'
  })
  const [items, setItems] = useState([])
  const [currentItem, setCurrentItem] = useState({
    product_id: '',
    quantity: 1,
    unit_price: 0,
    iva_percentage: 19
  })

  useEffect(() => {
    loadClients()
    loadProducts()
  }, [])

  const loadClients = async () => {
    try {
      const data = await clientsService.getAll()
      setClients(data)
    } catch (error) {
      console.error('Error loading clients:', error)
    }
  }

  const loadProducts = async () => {
    try {
      const data = await productsService.getAll()
      console.log('Productos cargados:', data)
      setProducts(data)
    } catch (error) {
      console.error('Error loading products:', error)
    }
  }

  const handleProductSelect = (productId) => {
    const product = products.find(p => p.id === parseInt(productId))
    if (product) {
      setCurrentItem({
        ...currentItem,
        product_id: productId,
        unit_price: parseFloat(product.price_sell) || 0
      })
    } else {
      setCurrentItem({
        ...currentItem,
        product_id: productId,
        unit_price: 0
      })
    }
  }

  const addItem = () => {
    if (!currentItem.product_id || currentItem.quantity <= 0) {
      alert('Seleccione un producto y cantidad válida')
      return
    }

    const product = products.find(p => p.id === parseInt(currentItem.product_id))
    const subtotal = currentItem.quantity * currentItem.unit_price
    const iva = (subtotal * currentItem.iva_percentage) / 100
    const total = subtotal + iva

    setItems([...items, {
      ...currentItem,
      product_name: product.name,
      subtotal,
      iva,
      total
    }])

    // Reset current item
    setCurrentItem({
      product_id: '',
      quantity: 1,
      unit_price: 0,
      iva_percentage: 19
    })
  }

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0)
    const iva = items.reduce((sum, item) => sum + item.iva, 0)
    const total = subtotal + iva
    return { subtotal, iva, total }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (items.length === 0) {
      alert('Agregue al menos un producto')
      return
    }

    try {
      const totals = calculateTotals()
      const quoteData = {
        ...formData,
        subtotal: totals.subtotal,
        iva_total: totals.iva,
        total: totals.total,
        items: items.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          iva_percentage: item.iva_percentage
        }))
      }

      await quotesService.create(quoteData)
      navigate('/cotizaciones')
    } catch (error) {
      console.error('Error creating quote:', error)
      alert('Error al crear la cotización')
    }
  }

  const totals = calculateTotals()

  return (
    <div className="quote-new-page">
      <div className="page-header">
        <h1>Nueva Cotización</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="card" style={{ marginBottom: '20px' }}>
          <h3>Información General</h3>
          
          <div className="form-group">
            <label>Cliente *</label>
            <select
              value={formData.client_id}
              onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
              required
            >
              <option value="">Seleccione un cliente</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>
                  {client.name} - {client.email}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Notas</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows="3"
            />
          </div>

          <div className="form-group">
            <label>Estado</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <option value="borrador">Borrador</option>
              <option value="enviada">Enviada</option>
              <option value="aprobada">Aprobada</option>
              <option value="rechazada">Rechazada</option>
            </select>
          </div>
        </div>

        <div className="card" style={{ marginBottom: '20px' }}>
          <h3>Agregar Productos</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', gap: '10px', alignItems: 'end' }}>
            <div className="form-group">
              <label>Producto</label>
              <select
                value={currentItem.product_id}
                onChange={(e) => handleProductSelect(e.target.value)}
              >
                <option value="">Seleccione un producto</option>
                {products.map(product => (
                  <option key={product.id} value={product.id}>
                    {product.name} - ${parseFloat(product.price_sell).toLocaleString()}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Cantidad</label>
              <input
                type="number"
                min="1"
                value={currentItem.quantity}
                onChange={(e) => setCurrentItem({ ...currentItem, quantity: parseInt(e.target.value) })}
              />
            </div>

            <div className="form-group">
              <label>Precio Unit.</label>
              <input
                type="number"
                step="0.01"
                value={currentItem.unit_price}
                onChange={(e) => setCurrentItem({ ...currentItem, unit_price: parseFloat(e.target.value) })}
              />
            </div>

            <div className="form-group">
              <label>IVA %</label>
              <input
                type="number"
                min="0"
                max="100"
                value={currentItem.iva_percentage}
                onChange={(e) => setCurrentItem({ ...currentItem, iva_percentage: parseFloat(e.target.value) })}
              />
            </div>

            <button type="button" onClick={addItem} className="btn btn-secondary">
              Agregar
            </button>
          </div>
        </div>

        <div className="card" style={{ marginBottom: '20px' }}>
          <h3>Productos Agregados</h3>
          
          {items.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#666', padding: '20px' }}>
              No hay productos agregados
            </p>
          ) : (
            <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Cantidad</th>
                  <th>Precio Unit.</th>
                  <th>IVA %</th>
                  <th>Subtotal</th>
                  <th>IVA</th>
                  <th>Total</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={index}>
                    <td>{item.product_name}</td>
                    <td>{item.quantity}</td>
                    <td>${item.unit_price.toFixed(2)}</td>
                    <td>{item.iva_percentage}%</td>
                    <td>${item.subtotal.toFixed(2)}</td>
                    <td>${item.iva.toFixed(2)}</td>
                    <td>${item.total.toFixed(2)}</td>
                    <td>
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="btn btn-sm btn-danger"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
                <tr style={{ fontWeight: 'bold', borderTop: '2px solid #ddd' }}>
                  <td colSpan="4" style={{ textAlign: 'right' }}>TOTALES:</td>
                  <td>${totals.subtotal.toFixed(2)}</td>
                  <td>${totals.iva.toFixed(2)}</td>
                  <td>${totals.total.toFixed(2)}</td>
                  <td></td>
                </tr>
              </tbody>
            </table>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button type="button" onClick={() => navigate('/cotizaciones')} className="btn btn-secondary">
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary">
            Crear Cotización
          </button>
        </div>
      </form>
    </div>
  )
}

export default QuoteNew
