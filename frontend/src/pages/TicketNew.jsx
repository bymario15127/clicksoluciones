import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ticketsService } from '../services/tickets'
import { clientsService } from '../services/clients'
import { useAuth } from '../context/AuthContext'

const TicketNew = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [clients, setClients] = useState([])
  const [formData, setFormData] = useState({
    client_id: '',
    subject: '',
    description: '',
    priority: 'media',
    status: 'abierto',
    type: 'incidencia' // nuevo campo
  })

  const isClient = user?.role?.name === 'client' || user?.role?.name === 'cliente'

  useEffect(() => {
    console.log('👤 Usuario actual:', user)
    console.log('🔍 ¿Es cliente?:', isClient)
    console.log('📝 Rol:', user?.role?.name)
    
    if (!isClient) {
      loadClients()
    }
  }, [isClient])

  const loadClients = async () => {
    try {
      const data = await clientsService.getAll()
      setClients(data)
    } catch (error) {
      console.error('Error loading clients:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      // Mapear los campos del frontend a lo que espera el backend
      const dataToSend = {
        title: formData.subject,        // backend espera 'title'
        description: formData.description,
        priority: formData.priority,
        status: formData.status,
        category: formData.type,         // backend espera 'category'
        client_id: !isClient ? formData.client_id : undefined
      }
      
      console.log('📤 Enviando ticket:', dataToSend)
      await ticketsService.create(dataToSend)
      navigate('/tickets')
    } catch (error) {
      console.error('Error creating ticket:', error)
      alert('Error al crear el ticket: ' + (error.response?.data?.message || error.message))
    }
  }

  return (
    <div className="ticket-new-page">
      <div className="page-header">
        <h1>Nuevo Ticket</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="card">
          {!isClient && (
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
          )}

          <div className="form-group">
            <label>Tipo *</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              required
            >
              <option value="incidencia">Incidencia</option>
              <option value="requerimiento">Requerimiento</option>
            </select>
          </div>

          <div className="form-group">
            <label>Asunto *</label>
            <input
              type="text"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Descripción *</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows="5"
              required
            />
          </div>

          {!isClient && (
            <>
              <div className="form-group">
                <label>Prioridad</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                >
                  <option value="baja">Baja</option>
                  <option value="media">Media</option>
                  <option value="alta">Alta</option>
                  <option value="urgente">Urgente</option>
                </select>
              </div>

              <div className="form-group">
                <label>Estado</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="abierto">Abierto</option>
                  <option value="en_progreso">En Progreso</option>
                  <option value="cerrado">Cerrado</option>
                </select>
              </div>
            </>
          )}

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button type="button" onClick={() => navigate('/tickets')} className="btn btn-secondary">
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              Crear Ticket
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

export default TicketNew
