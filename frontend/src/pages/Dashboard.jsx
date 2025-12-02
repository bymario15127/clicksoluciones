import { useState, useEffect } from 'react'
import { ticketsService } from '../services/tickets'
import { quotesService } from '../services/quotes'
import { productsService } from '../services/products'
import { useAuth } from '../context/AuthContext'
import './Dashboard.css'

const Dashboard = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    ticketsOpen: 0,
    ticketsInProgress: 0,
    ticketsResolved: 0,
    quotesSent: 0,
    quotesApproved: 0,
    lowStockProducts: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const roleName = user?.role?.name
      const isSales = roleName === 'sales' || roleName === 'comercial'
      const isAdmin = roleName === 'admin'
      const isTechnician = roleName === 'technician' || roleName === 'tecnico'
      const isClient = roleName === 'client' || roleName === 'cliente'

      const promises = []

      // Admin y técnicos y clientes ven tickets
      if (isAdmin || isTechnician || isClient) {
        promises.push(ticketsService.getAll())
      } else {
        promises.push(Promise.resolve([]))
      }

      // Admin y comerciales ven cotizaciones y productos
      if (isAdmin || isSales) {
        promises.push(quotesService.getAll())
        promises.push(productsService.getLowStock(10))
      } else {
        promises.push(Promise.resolve([]))
        promises.push(Promise.resolve([]))
      }

      const [tickets, quotes, products] = await Promise.all(promises)

      setStats({
        ticketsOpen: tickets.filter(t => t.status === 'nuevo').length,
        ticketsInProgress: tickets.filter(t => t.status === 'en proceso').length,
        ticketsResolved: tickets.filter(t => t.status === 'resuelto').length,
        quotesSent: quotes.filter(q => q.status === 'enviada').length,
        quotesApproved: quotes.filter(q => q.status === 'aprobada').length,
        lowStockProducts: products.length
      })
    } catch (error) {
      console.error('Error loading stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div>Cargando...</div>
  }

  const roleName = user?.role?.name
  const isSales = roleName === 'sales' || roleName === 'comercial'
  const isAdmin = roleName === 'admin'
  const isTechnician = roleName === 'technician' || roleName === 'tecnico'
  const isClient = roleName === 'client' || roleName === 'cliente'

  const showTickets = isAdmin || isTechnician || isClient
  const showQuotes = isAdmin || isSales

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      
      <div className="stats-grid">
        {showTickets && (
          <>
            <div className="stat-card">
              <h3>Tickets Abiertos</h3>
              <p className="stat-number">{stats.ticketsOpen}</p>
            </div>
            
            <div className="stat-card">
              <h3>Tickets en Proceso</h3>
              <p className="stat-number">{stats.ticketsInProgress}</p>
            </div>
            
            <div className="stat-card">
              <h3>Tickets Resueltos</h3>
              <p className="stat-number">{stats.ticketsResolved}</p>
            </div>
          </>
        )}
        
        {showQuotes && (
          <>
            <div className="stat-card">
              <h3>Cotizaciones Enviadas</h3>
              <p className="stat-number">{stats.quotesSent}</p>
            </div>
            
            <div className="stat-card">
              <h3>Cotizaciones Aprobadas</h3>
              <p className="stat-number">{stats.quotesApproved}</p>
            </div>
            
            <div className="stat-card alert-card">
              <h3>Productos Bajo Stock</h3>
              <p className="stat-number">{stats.lowStockProducts}</p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default Dashboard
