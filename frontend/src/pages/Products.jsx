import { useState, useEffect } from 'react'
import { productsService } from '../services/products'

const Products = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    brand: '',
    model: '',
    serial: '',
    price_buy: '',
    price_sell: '',
    iva: 19,
    stock: '',
    status: 'disponible'
  })

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      const data = await productsService.getAll()
      setProducts(data)
    } catch (error) {
      console.error('Error loading products:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await productsService.create(formData)
      setShowModal(false)
      setFormData({
        name: '',
        category: '',
        brand: '',
        model: '',
        serial: '',
        price_buy: '',
        price_sell: '',
        iva: 19,
        stock: '',
        status: 'disponible'
      })
      loadProducts()
    } catch (error) {
      console.error('Error creating product:', error)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este producto?')) {
      try {
        await productsService.delete(id)
        loadProducts()
      } catch (error) {
        console.error('Error deleting product:', error)
      }
    }
  }

  if (loading) {
    return <div>Cargando...</div>
  }

  return (
    <div className="products-page">
      <div className="page-header">
        <h1>Inventario / Productos</h1>
        <button onClick={() => setShowModal(true)} className="btn btn-primary">
          Crear Producto
        </button>
      </div>

      <div className="card">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Categoría</th>
              <th>Marca</th>
              <th>Modelo</th>
              <th>Stock</th>
              <th>Precio Venta</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product.id}>
                <td>{product.id}</td>
                <td>{product.name}</td>
                <td>{product.category}</td>
                <td>{product.brand}</td>
                <td>{product.model}</td>
                <td className={product.stock < 10 ? 'text-danger' : ''}>
                  {product.stock}
                </td>
                <td>${product.price_sell}</td>
                <td>
                  <span className={`badge ${product.status === 'disponible' ? 'badge-success' : 'badge-warning'}`}>
                    {product.status}
                  </span>
                </td>
                <td>
                  <button 
                    onClick={() => handleDelete(product.id)} 
                    className="btn btn-sm btn-danger"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>Crear Producto</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nombre</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Categoría</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  required
                >
                  <option value="">Seleccionar</option>
                  <option value="Portátiles">Portátiles</option>
                  <option value="PCs">PCs</option>
                  <option value="RAM">RAM</option>
                  <option value="Discos">Discos</option>
                  <option value="Monitores">Monitores</option>
                  <option value="Otros">Otros</option>
                </select>
              </div>
              <div className="form-group">
                <label>Marca</label>
                <input
                  type="text"
                  value={formData.brand}
                  onChange={(e) => setFormData({...formData, brand: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Modelo</label>
                <input
                  type="text"
                  value={formData.model}
                  onChange={(e) => setFormData({...formData, model: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Serial</label>
                <input
                  type="text"
                  value={formData.serial}
                  onChange={(e) => setFormData({...formData, serial: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Precio Compra</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price_buy}
                  onChange={(e) => setFormData({...formData, price_buy: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Precio Venta</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price_sell}
                  onChange={(e) => setFormData({...formData, price_sell: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>IVA (%)</label>
                <input
                  type="number"
                  value={formData.iva}
                  onChange={(e) => setFormData({...formData, iva: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Stock</label>
                <input
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({...formData, stock: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Estado</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  required
                >
                  <option value="disponible">Disponible</option>
                  <option value="reservado">Reservado</option>
                  <option value="vendido">Vendido</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="submit" className="btn btn-primary">Guardar</button>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Products
