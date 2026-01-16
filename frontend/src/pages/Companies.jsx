import { useState, useEffect } from 'react'
import { companiesService } from '../services/companies'
import { useNavigate } from 'react-router-dom'

const Companies = () => {
  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    contact_person: '',
    notes: ''
  })
  const navigate = useNavigate()

  useEffect(() => {
    loadCompanies()
  }, [])

  const loadCompanies = async () => {
    try {
      const data = await companiesService.getAll()
      setCompanies(data)
    } catch (error) {
      console.error('Error loading companies:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await companiesService.create(formData)
      setShowModal(false)
      setFormData({
        name: '',
        email: '',
        phone: '',
        address: '',
        contact_person: '',
        notes: ''
      })
      loadCompanies()
      alert('Empresa creada exitosamente')
    } catch (error) {
      console.error('Error creating company:', error)
      alert('Error al crear empresa')
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar esta empresa?')) {
      try {
        await companiesService.delete(id)
        loadCompanies()
        alert('Empresa eliminada exitosamente')
      } catch (error) {
        console.error('Error deleting company:', error)
        alert(error.response?.data?.message || 'Error al eliminar empresa')
      }
    }
  }

  const handleViewDetails = (id) => {
    navigate(`/companies/${id}`)
  }

  if (loading) {
    return <div>Cargando...</div>
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>Empresas (HelpDesk)</h1>
        <button onClick={() => setShowModal(true)} className="btn btn-primary">
          Nueva Empresa
        </button>
      </div>

      <div className="card">
        <div className="table-responsive">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Persona de Contacto</th>
              <th>Email</th>
              <th>Teléfono</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {companies.map(company => (
              <tr key={company.id}>
                <td>{company.id}</td>
                <td>{company.name}</td>
                <td>{company.contact_person || 'N/A'}</td>
                <td>{company.email || 'N/A'}</td>
                <td>{company.phone || 'N/A'}</td>
                <td>
                  <button 
                    onClick={() => handleViewDetails(company.id)} 
                    className="btn btn-sm btn-primary"
                    style={{ marginRight: '5px' }}
                  >
                    Ver Detalles
                  </button>
                  <button 
                    onClick={() => handleDelete(company.id)} 
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
      </div>

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>Nueva Empresa</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nombre de la Empresa *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label>Persona de Contacto</label>
                <input
                  type="text"
                  value={formData.contact_person}
                  onChange={(e) => setFormData({...formData, contact_person: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label>Teléfono</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label>Dirección</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  rows="2"
                />
              </div>

              <div className="form-group">
                <label>Notas</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  rows="3"
                />
              </div>

              <div className="modal-actions">
                <button type="submit" className="btn btn-primary">Crear</button>
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)} 
                  className="btn btn-secondary"
                >
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

export default Companies
