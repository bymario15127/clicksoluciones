import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ticketsService } from '../services/tickets'
import { companiesService } from '../services/companies'
import './Tickets.css'

const Tickets = () => {
  const [tickets, setTickets] = useState([])
  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [companyFilter, setCompanyFilter] = useState('all')

  useEffect(() => {
    loadCompanies()
    loadTickets()
  }, [filter, companyFilter])

  const loadCompanies = async () => {
    try {
      const data = await companiesService.getAll()
      setCompanies(data)
    } catch (error) {
      console.error('Error loading companies:', error)
    }
  }

  const loadTickets = async () => {
    try {
      const filters = {}
      if (filter !== 'all') filters.status = filter
      if (companyFilter !== 'all') filters.company_id = companyFilter
      
      const data = await ticketsService.getAll(filters)
      setTickets(data)
    } catch (error) {
      console.error('Error loading tickets:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status) => {
    const badges = {
      'nuevo': 'badge-info',
      'en proceso': 'badge-warning',
      'resuelto': 'badge-success',
      'cerrado': 'badge-secondary'
    }
    return badges[status] || 'badge-info'
  }

  const getPriorityBadge = (priority) => {
    const badges = {
      'alta': 'badge-danger',
      'media': 'badge-warning',
      'baja': 'badge-info'
    }
    return badges[priority] || 'badge-info'
  }

  if (loading) {
    return <div>Cargando...</div>
  }

  return (
    <div className="tickets-page">
      <div className="page-header">
        <h1>Tickets</h1>
        <Link to="/tickets/new" className="btn btn-primary">
          Crear Ticket
        </Link>
      </div>

      <div className="filters">
        <button 
          className={filter === 'all' ? 'btn btn-primary' : 'btn btn-secondary'}
          onClick={() => setFilter('all')}
        >
          Todos
        </button>
        <button 
          className={filter === 'nuevo' ? 'btn btn-primary' : 'btn btn-secondary'}
          onClick={() => setFilter('nuevo')}
        >
          Nuevos
        </button>
        <button 
          className={filter === 'en proceso' ? 'btn btn-primary' : 'btn btn-secondary'}
          onClick={() => setFilter('en proceso')}
        >
          En Proceso
        </button>
        <button 
          className={filter === 'resuelto' ? 'btn btn-primary' : 'btn btn-secondary'}
          onClick={() => setFilter('resuelto')}
        >
          Resueltos
        </button>
      </div>

      <div className="card" style={{ marginBottom: '20px', padding: '15px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <label style={{ fontWeight: '600', minWidth: 'fit-content' }}>Filtrar por Empresa:</label>
          <select 
            value={companyFilter} 
            onChange={(e) => setCompanyFilter(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: '6px', border: '2px solid #dee2e6', minWidth: '250px' }}
          >
            <option value="all">Todas las empresas</option>
            {companies.map(company => (
              <option key={company.id} value={company.id}>
                {company.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="card">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Título</th>
              <th>Empresa</th>
              <th>Prioridad</th>
              <th>Estado</th>
              <th>Categoría</th>
              <th>Técnico</th>
              <th>Fecha</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map(ticket => (
              <tr key={ticket.id}>
                <td>#{ticket.id}</td>
                <td>{ticket.title}</td>
                <td>
                  {ticket.company ? (
                    <span className="badge badge-info">{ticket.company.name}</span>
                  ) : (
                    <span style={{ color: '#999' }}>Sin empresa</span>
                  )}
                </td>
                <td>
                  <span className={`badge ${getPriorityBadge(ticket.priority)}`}>
                    {ticket.priority}
                  </span>
                </td>
                <td>
                  <span className={`badge ${getStatusBadge(ticket.status)}`}>
                    {ticket.status}
                  </span>
                </td>
                <td>{ticket.category}</td>
                <td>{ticket.technician?.name || 'Sin asignar'}</td>
                <td>{new Date(ticket.created_at).toLocaleDateString()}</td>
                <td>
                  <Link to={`/tickets/${ticket.id}`} className="btn btn-sm btn-primary">
                    Ver
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Tickets
