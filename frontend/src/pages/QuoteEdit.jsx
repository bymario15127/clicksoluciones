import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { quotesService } from '../services/quotes'
import { clientsService } from '../services/clients'
import { productsService } from '../services/products'

const QuoteEdit = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [clients, setClients] = useState([])
  const [products, setProducts] = useState([])
  const [formData, setFormData] = useState({ client_id: '', status: 'borrador' })
  const [items, setItems] = useState([])
  const [currentItem, setCurrentItem] = useState({
    product_id: '',
    custom_description: '',
    custom_marca: '',
    custom_referencia: '',
    custom_unidad: '',
    quantity: 1,
    unit_price: 0,
    iva_percentage: 19,
    is_custom: false
  })

  useEffect(() => {
    Promise.all([loadClients(), loadProducts()]).then(() => loadQuote()).finally(() => setLoading(false))
  }, [id])

  const loadClients = async () => {
    try { const data = await clientsService.getAll(); setClients(data) } catch (e) { console.error(e) }
  }
  const loadProducts = async () => {
    try { const data = await productsService.getAll(); setProducts(data) } catch (e) { console.error(e) }
  }

  const loadQuote = async () => {
    try {
      const q = await quotesService.getById(id)
      setFormData({ client_id: q.client_id, status: q.status })
      const mapped = (q.items || []).map(it => {
        const isCustom = !it.product_id
        const quantity = Number(it.quantity) || 0
        const unit = Number(it.price) || 0
        const subtotal = quantity * unit
        const ivaPct = Number(it.iva) || 0
        const iva = subtotal * (ivaPct / 100)
        const total = subtotal + iva
        return {
          product_id: isCustom ? '' : it.product_id,
          product_name: it.product_name || it.display_name || it.description || 'Producto',
          custom_description: isCustom ? (it.description || '') : '',
          custom_marca: isCustom ? (it.marca || '') : '',
          custom_referencia: isCustom ? (it.referencia || '') : '',
          custom_unidad: isCustom ? (it.unidad || '') : '',
          quantity,
          unit_price: unit,
          iva_percentage: ivaPct,
          subtotal,
          iva,
          total,
          is_custom: isCustom
        }
      })
      setItems(mapped)
    } catch (e) {
      console.error('Error loading quote for edit:', e)
      alert('No se pudo cargar la cotización')
      navigate('/cotizaciones')
    }
  }

  const handleProductSelect = (productId) => {
    const product = products.find(p => p.id === parseInt(productId))
    if (product) {
      setCurrentItem({
        ...currentItem,
        product_id: productId,
        unit_price: parseFloat(product.price_sell) || 0,
        is_custom: false,
        custom_description: ''
      })
    } else {
      setCurrentItem({ ...currentItem, product_id: productId, unit_price: 0, is_custom: false, custom_description: '' })
    }
  }

  const toggleCustomProduct = () => {
    setCurrentItem({
      ...currentItem,
      is_custom: !currentItem.is_custom,
      product_id: '',
      custom_description: '',
      custom_marca: '',
      custom_referencia: '',
      custom_unidad: '',
      unit_price: 0
    })
  }

  const addItem = () => {
    if (currentItem.is_custom) {
      if (!currentItem.custom_description || currentItem.quantity <= 0) {
        alert('Complete la descripción y cantidad del producto personalizado')
        return
      }
    } else {
      if (!currentItem.product_id || currentItem.quantity <= 0) {
        alert('Seleccione un producto y cantidad válida')
        return
      }
    }

    const product = currentItem.is_custom ? { name: currentItem.custom_description } : products.find(p => p.id === parseInt(currentItem.product_id))
    const subtotal = currentItem.quantity * currentItem.unit_price
    const iva = (subtotal * currentItem.iva_percentage) / 100
    const total = subtotal + iva

    setItems([...items, { ...currentItem, product_name: product.name, subtotal, iva, total }])

    setCurrentItem({
      product_id: '', custom_description: '', custom_marca: '', custom_referencia: '', custom_unidad: '', quantity: 1, unit_price: 0, iva_percentage: 19, is_custom: false
    })
  }

  const removeItem = (index) => setItems(items.filter((_, i) => i !== index))

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, it) => sum + (Number(it.subtotal) || (Number(it.quantity) * Number(it.unit_price))), 0)
    const iva = items.reduce((sum, it) => sum + (Number(it.iva) || ((Number(it.quantity) * Number(it.unit_price)) * (Number(it.iva_percentage)/100))), 0)
    const total = subtotal + iva
    return { subtotal, iva, total }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (items.length === 0) { alert('Agregue al menos un producto'); return }
    try {
      const totals = calculateTotals()
      const payload = {
        client_id: formData.client_id,
        status: formData.status,
        items: items.map(item => ({
          product_id: item.is_custom ? null : item.product_id,
          description: item.is_custom ? item.custom_description : null,
          marca: item.is_custom ? item.custom_marca : null,
          referencia: item.is_custom ? item.custom_referencia : null,
          unidad: item.is_custom ? item.custom_unidad : null,
          quantity: item.quantity,
          unit_price: item.unit_price,
          iva_percentage: item.iva_percentage
        }))
      }
      await quotesService.update(id, payload)
      navigate(`/cotizaciones/${id}`)
    } catch (e) {
      console.error('Error updating quote:', e)
      alert('Error al actualizar la cotización')
    }
  }

  const totals = calculateTotals()

  if (loading) return <div>Cargando...</div>

  return (
    <div className="quote-new-page">
      <div className="page-header">
        <h1>Editar Cotización #{id}</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="card" style={{ marginBottom: '20px' }}>
          <h3>Información General</h3>

          <div className="form-group">
            <label>Cliente *</label>
            <select value={formData.client_id} onChange={(e) => setFormData({ ...formData, client_id: e.target.value })} required>
              <option value="">Seleccione un cliente</option>
              {clients.map(c => (
                <option key={c.id} value={c.id}>{c.name} - {c.email}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Estado</label>
            <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
              <option value="borrador">Borrador</option>
              <option value="enviada">Enviada</option>
              <option value="aprobada">Aprobada</option>
              <option value="rechazada">Rechazada</option>
            </select>
          </div>
        </div>

        <div className="card" style={{ marginBottom: '20px' }}>
          <h3>Agregar Productos</h3>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <input type="checkbox" checked={currentItem.is_custom} onChange={toggleCustomProduct} />
              <span>Producto personalizado (sin inventario)</span>
            </label>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: currentItem.is_custom ? '2fr 1fr 1fr 1fr 1fr 1fr 1fr auto' : '2fr 1fr 1fr 1fr auto', gap: '10px', alignItems: 'end' }}>
            {currentItem.is_custom ? (
              <>
                <div className="form-group">
                  <label>Descripción/Característica *</label>
                  <input type="text" value={currentItem.custom_description} onChange={(e) => setCurrentItem({ ...currentItem, custom_description: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Marca</label>
                  <input type="text" value={currentItem.custom_marca} onChange={(e) => setCurrentItem({ ...currentItem, custom_marca: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Referencia</label>
                  <input type="text" value={currentItem.custom_referencia} onChange={(e) => setCurrentItem({ ...currentItem, custom_referencia: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Unidad</label>
                  <input type="text" value={currentItem.custom_unidad} onChange={(e) => setCurrentItem({ ...currentItem, custom_unidad: e.target.value })} />
                </div>
              </>
            ) : (
              <div className="form-group">
                <label>Producto</label>
                <select value={currentItem.product_id} onChange={(e) => handleProductSelect(e.target.value)}>
                  <option value="">Seleccione un producto</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name} - ${parseFloat(p.price_sell).toLocaleString()}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="form-group">
              <label>Cantidad</label>
              <input type="number" min="1" value={currentItem.quantity} onChange={(e) => setCurrentItem({ ...currentItem, quantity: parseInt(e.target.value) })} />
            </div>
            <div className="form-group">
              <label>Precio Unit.</label>
              <input type="number" step="0.01" value={currentItem.unit_price} onChange={(e) => setCurrentItem({ ...currentItem, unit_price: parseFloat(e.target.value) })} />
            </div>
            <div className="form-group">
              <label>IVA %</label>
              <input type="number" min="0" max="100" value={currentItem.iva_percentage} onChange={(e) => setCurrentItem({ ...currentItem, iva_percentage: parseFloat(e.target.value) })} />
            </div>
            <button type="button" onClick={addItem} className="btn btn-secondary">Agregar</button>
          </div>
        </div>

        <div className="card" style={{ marginBottom: '20px' }}>
          <h3>Productos</h3>
          {items.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#666', padding: '20px' }}>No hay productos agregados</p>
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
                      <td>${Number(item.unit_price).toFixed(2)}</td>
                      <td>{item.iva_percentage}%</td>
                      <td>${Number(item.subtotal).toFixed(2)}</td>
                      <td>${Number(item.iva).toFixed(2)}</td>
                      <td>${Number(item.total).toFixed(2)}</td>
                      <td>
                        <button type="button" onClick={() => removeItem(index)} className="btn btn-sm btn-danger">Eliminar</button>
                      </td>
                    </tr>
                  ))}
                  <tr style={{ fontWeight: 'bold', borderTop: '2px solid #ddd' }}>
                    <td colSpan="4" style={{ textAlign: 'right' }}>TOTALES:</td>
                    <td>${Number(totals.subtotal).toFixed(2)}</td>
                    <td>${Number(totals.iva).toFixed(2)}</td>
                    <td>${Number(totals.total).toFixed(2)}</td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button type="button" onClick={() => navigate(`/cotizaciones/${id}`)} className="btn btn-secondary">Cancelar</button>
          <button type="submit" className="btn btn-primary">Guardar Cambios</button>
        </div>
      </form>
    </div>
  )
}

export default QuoteEdit
