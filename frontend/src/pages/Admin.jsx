import { useState, useEffect } from 'react'
import { usersService } from '../services/users'

const Admin = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role_id: ''
  })

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      const data = await usersService.getAll()
      // Filtrar: solo admin (1), técnico (2) y comercial (3)
      // Excluir clientes (4) que pertenecen al HelpDesk
      const filteredUsers = data.filter(user => 
        user.role_id === 1 || user.role_id === 2 || user.role_id === 3
      )
      setUsers(filteredUsers)
    } catch (error) {
      console.error('Error loading users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const userData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role_id: formData.role_id
      }

      await usersService.create(userData)
      setShowModal(false)
      setFormData({
        name: '',
        email: '',
        password: '',
        role_id: ''
      })
      loadUsers()
      alert('Usuario creado exitosamente')
    } catch (error) {
      console.error('Error creating user:', error)
      alert('Error al crear usuario')
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este usuario?')) {
      try {
        await usersService.delete(id)
        loadUsers()
      } catch (error) {
        console.error('Error deleting user:', error)
      }
    }
  }

  if (loading) {
    return <div>Cargando...</div>
  }

  return (
    <div className="admin-page">
      <div className="page-header">
        <h1>Administración de Usuarios</h1>
        <button onClick={() => setShowModal(true)} className="btn btn-primary">
          Crear Usuario
        </button>
      </div>

      <div className="card">
        <h2>Usuarios del Sistema</h2>
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
            {users.map(user => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>
                  <span className="badge badge-info">
                    {user.role?.name}
                  </span>
                </td>
                <td>
                  <button 
                    onClick={() => handleDelete(user.id)} 
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
            <h2>Crear Usuario</h2>
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
                <label>Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Contraseña</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Rol *</label>
                <select
                  value={formData.role_id}
                  onChange={(e) => setFormData({...formData, role_id: e.target.value})}
                  required
                >
                  <option value="">Seleccionar rol</option>
                  <option value="1">Administrador</option>
                  <option value="2">Técnico</option>
                  <option value="3">Comercial</option>
                </select>
                <small style={{ color: '#666', display: 'block', marginTop: '5px' }}>
                  Para usuarios Cliente, créalos desde Empresas en el módulo HelpDesk
                </small>
              </div>

              <div className="modal-actions">
                <button type="submit" className="btn btn-primary">Crear Usuario</button>
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

export default Admin
