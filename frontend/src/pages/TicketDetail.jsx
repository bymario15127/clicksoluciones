import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { ticketsService } from '../services/tickets'
import { usersService } from '../services/users'
import { useAuth } from '../context/AuthContext'

const TicketDetail = () => {
  const { id } = useParams()
  const { user } = useAuth()
  const [ticket, setTicket] = useState(null)
  const [message, setMessage] = useState('')
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [technicians, setTechnicians] = useState([])
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [selectedTechnician, setSelectedTechnician] = useState('')

  const isClient = user?.role?.name === 'client' || user?.role?.name === 'cliente'
  const isTechnician = user?.role?.name === 'technician' || user?.role?.name === 'tecnico' || user?.role?.name === 'admin'

  useEffect(() => {
    loadTicket()
    loadTechnicians()
    // Recargar cada 5 segundos para actualizar mensajes
    const interval = setInterval(loadTicket, 5000)
    return () => clearInterval(interval)
  }, [id])

  const loadTechnicians = async () => {
    try {
      const users = await usersService.getAll()
      // Filtrar solo técnicos (role_id 2) y admin (role_id 1)
      const techs = users.filter(u => u.role_id === 1 || u.role_id === 2)
      setTechnicians(techs)
    } catch (error) {
      console.error('Error loading technicians:', error)
    }
  }

  const loadTicket = async () => {
    try {
      const data = await ticketsService.getById(id)
      setTicket(data)
    } catch (error) {
      console.error('Error loading ticket:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    
    if (!message.trim() && !file) {
      return
    }

    try {
      const formData = new FormData()
      formData.append('comment', message)
      if (file) {
        formData.append('file', file)
      }

      await ticketsService.addComment(id, message, file)
      setMessage('')
      setFile(null)
      // Reset file input
      const fileInput = document.getElementById('file-input')
      if (fileInput) fileInput.value = ''
      
      loadTicket()
    } catch (error) {
      console.error('Error sending message:', error)
      alert('Error al enviar el mensaje')
    }
  }

  const handleStatusChange = async (newStatus) => {
    try {
      await ticketsService.update(id, { status: newStatus })
      loadTicket()
    } catch (error) {
      console.error('Error updating status:', error)
      alert('Error al cambiar el estado')
    }
  }

  const handleAssignTechnician = async () => {
    if (!selectedTechnician) {
      alert('Selecciona un técnico')
      return
    }
    try {
      await ticketsService.update(id, { technician_id: selectedTechnician })
      setShowAssignModal(false)
      setSelectedTechnician('')
      loadTicket()
      alert('Técnico asignado exitosamente')
    } catch (error) {
      console.error('Error assigning technician:', error)
      alert('Error al asignar técnico')
    }
  }

  const getStatusBadge = (status) => {
    const badges = {
      'nuevo': 'badge-info',
      'abierto': 'badge-info',
      'en_progreso': 'badge-warning',
      'resuelto': 'badge-success',
      'cerrado': 'badge-secondary'
    }
    return badges[status] || 'badge-secondary'
  }

  const getStatusLabel = (status) => {
    const labels = {
      'nuevo': 'Nuevo',
      'abierto': 'Abierto',
      'en_progreso': 'En Progreso',
      'resuelto': 'Resuelto',
      'cerrado': 'Cerrado'
    }
    return labels[status] || status
  }

  if (loading) {
    return <div>Cargando...</div>
  }

  if (!ticket) {
    return <div>Ticket no encontrado</div>
  }

  return (
    <div className="ticket-detail-page">
      <div className="card" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
          <div>
            <h1>Ticket #{ticket.id}</h1>
            <h2 style={{ marginTop: '10px', color: '#333' }}>{ticket.title}</h2>
          </div>
          <span className={`badge ${getStatusBadge(ticket.status)}`} style={{ fontSize: '1.1em', padding: '8px 16px' }}>
            {getStatusLabel(ticket.status)}
          </span>
        </div>
        
        <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '5px' }}>
          <p style={{ marginBottom: '15px', lineHeight: '1.6' }}>{ticket.description}</p>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', fontSize: '0.9em' }}>
            <div>
              <strong>Prioridad:</strong> 
              <span className={`badge badge-${ticket.priority === 'urgente' ? 'danger' : ticket.priority === 'alta' ? 'warning' : 'secondary'}`} style={{ marginLeft: '8px' }}>
                {ticket.priority}
              </span>
            </div>
            <div>
              <strong>Categoría:</strong> {ticket.category || 'N/A'}
            </div>
            <div>
              <strong>Técnico:</strong> {ticket.technician?.name || 'Sin asignar'}
            </div>
            <div>
              <strong>Fecha:</strong> {new Date(ticket.created_at).toLocaleDateString()}
            </div>
          </div>
        </div>

        {isTechnician && (
          <div style={{ marginTop: '20px', borderTop: '1px solid #ddd', paddingTop: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h4 style={{ margin: 0 }}>Gestión del Ticket</h4>
              <button 
                onClick={() => {
                  setSelectedTechnician(ticket.technician_id || '')
                  setShowAssignModal(true)
                }} 
                className="btn btn-info"
              >
                {ticket.technician_id ? 'Reasignar Técnico' : 'Asignar Técnico'}
              </button>
            </div>
            <h4 style={{ marginBottom: '10px', marginTop: '15px' }}>Cambiar Estado</h4>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button 
                onClick={() => handleStatusChange('en_progreso')} 
                className="btn btn-warning"
                disabled={ticket.status === 'en_progreso'}
              >
                En Proceso
              </button>
              <button 
                onClick={() => handleStatusChange('resuelto')} 
                className="btn btn-success"
                disabled={ticket.status === 'resuelto'}
              >
                Resuelto
              </button>
              <button 
                onClick={() => handleStatusChange('cerrado')} 
                className="btn btn-secondary"
                disabled={ticket.status === 'cerrado'}
              >
                Cerrado
              </button>
            </div>
          </div>
        )}
      </div>

      {showAssignModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>Asignar Técnico</h2>
            <div className="form-group">
              <label>Seleccionar Técnico</label>
              <select
                value={selectedTechnician}
                onChange={(e) => setSelectedTechnician(e.target.value)}
                className="form-control"
              >
                <option value="">Sin asignar</option>
                {technicians.map(tech => (
                  <option key={tech.id} value={tech.id}>
                    {tech.name} - {tech.role.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="modal-actions">
              <button onClick={handleAssignTechnician} className="btn btn-primary">
                Asignar
              </button>
              <button 
                onClick={() => {
                  setShowAssignModal(false)
                  setSelectedTechnician('')
                }} 
                className="btn btn-secondary"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="card" style={{ height: '500px', display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ marginBottom: '15px' }}>Chat</h3>
        
        <div style={{ 
          flex: 1, 
          overflowY: 'auto', 
          padding: '15px', 
          backgroundColor: '#f9f9f9',
          borderRadius: '5px',
          marginBottom: '15px'
        }}>
          {ticket.comments && ticket.comments.length > 0 ? (
            ticket.comments.map(c => {
              const isMyMessage = c.user_id === user.id
              return (
                <div 
                  key={c.id} 
                  style={{
                    display: 'flex',
                    justifyContent: isMyMessage ? 'flex-end' : 'flex-start',
                    marginBottom: '15px'
                  }}
                >
                  <div style={{
                    maxWidth: '70%',
                    padding: '10px 15px',
                    borderRadius: '10px',
                    backgroundColor: isMyMessage ? '#007bff' : '#fff',
                    color: isMyMessage ? '#fff' : '#333',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                  }}>
                    {!isMyMessage && (
                      <div style={{ fontWeight: 'bold', marginBottom: '5px', fontSize: '0.9em' }}>
                        {c.user_name || c.user?.name}
                      </div>
                    )}
                    <div style={{ marginBottom: '5px' }}>{c.comment}</div>
                    {c.file_url && (
                      <div style={{ marginTop: '8px' }}>
                        <a 
                          href={c.file_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          style={{ color: isMyMessage ? '#fff' : '#007bff', textDecoration: 'underline' }}
                        >
                          📎 Archivo adjunto
                        </a>
                      </div>
                    )}
                    <div style={{ 
                      fontSize: '0.75em', 
                      marginTop: '5px', 
                      opacity: 0.8,
                      textAlign: 'right'
                    }}>
                      {new Date(c.created_at).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              )
            })
          ) : (
            <div style={{ textAlign: 'center', color: '#666', padding: '40px' }}>
              No hay mensajes aún
            </div>
          )}
        </div>

        <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '10px', alignItems: 'end' }}>
          <div style={{ flex: 1 }}>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Escribe tu mensaje..."
              rows="2"
              style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ddd', resize: 'none' }}
            />
          </div>
          <div>
            <input
              type="file"
              id="file-input"
              onChange={(e) => setFile(e.target.files[0])}
              style={{ display: 'none' }}
            />
            <button 
              type="button" 
              onClick={() => document.getElementById('file-input').click()}
              className="btn btn-secondary"
              style={{ marginRight: '5px' }}
            >
              📎
            </button>
            <button type="submit" className="btn btn-primary">
              Enviar
            </button>
          </div>
        </form>
        {file && (
          <div style={{ marginTop: '10px', fontSize: '0.9em', color: '#666' }}>
            Archivo seleccionado: {file.name}
          </div>
        )}
      </div>
    </div>
  )
}

export default TicketDetail
