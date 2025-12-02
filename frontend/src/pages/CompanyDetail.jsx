import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { companiesService } from '../services/companies'
import { usersService } from '../services/users'

const CompanyDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [company, setCompany] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showUserModal, setShowUserModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [userFormData, setUserFormData] = useState({
    name: '',
    email: '',
    password: '',
    role_id: '4', // Cliente por defecto
    company_id: id
  })
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    password: '',
    role_id: ''
  })

  useEffect(() => {
    loadCompany()
  }, [id])

  const loadCompany = async () => {
    try {
      const data = await companiesService.getById(id)
      setCompany(data)
    } catch (error) {
      console.error('Error loading company:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateUser = async (e) => {
    e.preventDefault()
    try {
      await usersService.create({
        ...userFormData,
        company_id: parseInt(id)
      })
      setShowUserModal(false)
      setUserFormData({
        name: '',
        email: '',
        password: '',
        role_id: '4',
        company_id: id
      })
      loadCompany()
      alert('Usuario creado exitosamente')
    } catch (error) {
      console.error('Error creating user:', error)
      alert('Error al crear usuario')
    }
  }

  const handleDeleteUser = async (userId) => {
    if (window.confirm('¿Estás seguro de eliminar este usuario?')) {
      try {
        await usersService.delete(userId)
        loadCompany()
        alert('Usuario eliminado exitosamente')
      } catch (error) {
        console.error('Error deleting user:', error)
        alert('Error al eliminar usuario')
      }
    }
  }

  const handleEditUser = (user) => {
    setEditingUser(user)
    setEditFormData({
      name: user.name,
      email: user.email,
      password: '',
      role_id: user.role_id || '4'
    })
    setShowEditModal(true)
  }

  const handleUpdateUser = async (e) => {
    e.preventDefault()
    try {
      const updateData = {
        name: editFormData.name,
        email: editFormData.email,
        role_id: editFormData.role_id,
        company_id: parseInt(id)
      }
      
      // Solo incluir password si se ingresó uno nuevo
      if (editFormData.password) {
        updateData.password = editFormData.password
      }

      await usersService.update(editingUser.id, updateData)
      setShowEditModal(false)
      setEditingUser(null)
      setEditFormData({ name: '', email: '', password: '', role_id: '' })
      loadCompany()
      alert('Usuario actualizado exitosamente')
    } catch (error) {
      console.error('Error updating user:', error)
      alert('Error al actualizar usuario')
    }
  }

  if (loading) {
    return <div>Cargando...</div>
  }

  if (!company) {
    return <div>Empresa no encontrada</div>
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>{company.name}</h1>
        <button onClick={() => navigate('/companies')} className="btn btn-secondary">
          Volver
        </button>
      </div>

      <div className="card">
        <h2>Información de la Empresa</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div>
            <p><strong>Persona de Contacto:</strong> {company.contact_person || 'N/A'}</p>
            <p><strong>Email:</strong> {company.email || 'N/A'}</p>
            <p><strong>Teléfono:</strong> {company.phone || 'N/A'}</p>
          </div>
          <div>
            <p><strong>Dirección:</strong> {company.address || 'N/A'}</p>
            <p><strong>Notas:</strong> {company.notes || 'N/A'}</p>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2>Usuarios de la Empresa</h2>
          <button onClick={() => setShowUserModal(true)} className="btn btn-primary">
            Agregar Usuario
          </button>
        </div>

        {company.users && company.users.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {company.users.map(user => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>
                    <span className="badge badge-info">{user.role_name}</span>
                  </td>
                  <td>
                    <button 
                      onClick={() => handleEditUser(user)} 
                      className="btn btn-sm btn-info"
                      style={{ marginRight: '8px' }}
                    >
                      Editar
                    </button>
                    <button 
                      onClick={() => handleDeleteUser(user.id)} 
                      className="btn btn-sm btn-danger"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No hay usuarios registrados en esta empresa.</p>
        )}
      </div>

      {showUserModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>Agregar Usuario a {company.name}</h2>
            <form onSubmit={handleCreateUser}>
              <div className="form-group">
                <label>Nombre *</label>
                <input
                  type="text"
                  value={userFormData.name}
                  onChange={(e) => setUserFormData({...userFormData, name: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label>Email (opcional)</label>
                <input
                  type="email"
                  value={userFormData.email}
                  onChange={(e) => setUserFormData({...userFormData, email: e.target.value})}
                  placeholder="ej: usuario@empresa.com (opcional)"
                />
              </div>

              <div className="form-group">
                <label>Usuario (auto)</label>
                <input
                  type="text"
                  value={(function(){
                    const raw = (userFormData.name || '').trim()
                    if (!raw) return ''
                    const parts = raw
                      .normalize('NFD').replace(/\p{Diacritic}/gu, '')
                      .toLowerCase()
                      .split(/\s+/)
                    if (parts.length === 1) return parts[0]
                    const first = parts[0]
                    const last = parts[parts.length - 1]
                    return `${last}.${first}`
                  })()}
                  readOnly
                />
              </div>

              <div className="form-group">
                <label>Contraseña *</label>
                <input
                  type="password"
                  value={userFormData.password}
                  onChange={(e) => setUserFormData({...userFormData, password: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label>Rol *</label>
                <select
                  value={userFormData.role_id}
                  onChange={(e) => setUserFormData({...userFormData, role_id: e.target.value})}
                  required
                >
                  <option value="4">Cliente</option>
                  <option value="2">Técnico</option>
                  <option value="1">Administrador</option>
                </select>
              </div>

              <div className="modal-actions">
                <button type="submit" className="btn btn-primary">Crear Usuario</button>
                <button 
                  type="button" 
                  onClick={() => setShowUserModal(false)} 
                  className="btn btn-secondary"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditModal && editingUser && (
        <div className="modal">
          <div className="modal-content">
            <h2>Editar Usuario: {editingUser.name}</h2>
            <form onSubmit={handleUpdateUser}>
              <div className="form-group">
                <label>Nombre *</label>
                <input
                  type="text"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label>Email (opcional)</label>
                <input
                  type="email"
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({...editFormData, email: e.target.value})}
                  placeholder="ej: usuario@empresa.com (opcional)"
                />
              </div>

              <div className="form-group">
                <label>Usuario (auto)</label>
                <input
                  type="text"
                  value={(function(){
                    const raw = (editFormData.name || '').trim()
                    if (!raw) return ''
                    const parts = raw
                      .normalize('NFD').replace(/\p{Diacritic}/gu, '')
                      .toLowerCase()
                      .split(/\s+/)
                    if (parts.length === 1) return parts[0]
                    const first = parts[0]
                    const last = parts[parts.length - 1]
                    return `${last}.${first}`
                  })()}
                  readOnly
                />
              </div>

              <div className="form-group">
                <label>Nueva Contraseña (dejar vacío para no cambiar)</label>
                <input
                  type="password"
                  value={editFormData.password}
                  onChange={(e) => setEditFormData({...editFormData, password: e.target.value})}
                  placeholder="Dejar vacío si no desea cambiar"
                />
              </div>

              <div className="form-group">
                <label>Rol *</label>
                <select
                  value={editFormData.role_id}
                  onChange={(e) => setEditFormData({...editFormData, role_id: e.target.value})}
                  required
                >
                  <option value="4">Cliente</option>
                  <option value="2">Técnico</option>
                  <option value="1">Administrador</option>
                </select>
              </div>

              <div className="modal-actions">
                <button type="submit" className="btn btn-primary">Guardar Cambios</button>
                <button 
                  type="button" 
                  onClick={() => {
                    setShowEditModal(false)
                    setEditingUser(null)
                    setEditFormData({ name: '', email: '', password: '', role_id: '' })
                  }} 
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

export default CompanyDetail
