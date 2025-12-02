import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Sidebar.css'

const Sidebar = ({ isOpen, onClose }) => {
  const { user, hasRole } = useAuth()

  // Determinar el rol del usuario
  const roleName = user?.role?.name
  const isAdmin = roleName === 'admin'
  const isTechnician = roleName === 'technician' || roleName === 'tecnico'
  const isSales = roleName === 'sales' || roleName === 'comercial'
  const isClient = roleName === 'client' || roleName === 'cliente'

  const handleLinkClick = () => {
    // Cerrar sidebar en móvil al hacer click en un link
    if (window.innerWidth <= 768) {
      onClose()
    }
  }

  return (
    <>
      <div className={`sidebar-overlay ${isOpen ? 'open' : ''}`} onClick={onClose}></div>
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <nav className="sidebar-nav">
        {/* ADMIN - Ve todo con secciones separadas */}
        {isAdmin && (
          <>
            <NavLink to="/dashboard" className="sidebar-link" onClick={handleLinkClick}>
              Dashboard
            </NavLink>
            
            {/* Sección HelpDesk */}
            <div style={{ 
              padding: '10px 15px', 
              fontSize: '12px', 
              fontWeight: 'bold', 
              color: '#28a745',
              marginTop: '15px',
              borderTop: '2px solid #28a745'
            }}>
              🎫 HELPDESK
            </div>
            <NavLink to="/companies" className="sidebar-link" onClick={handleLinkClick}>
              Empresas
            </NavLink>
            <NavLink to="/tickets" className="sidebar-link" onClick={handleLinkClick}>
              Tickets
            </NavLink>
            
            {/* Sección Comercial */}
            <div style={{ 
              padding: '10px 15px', 
              fontSize: '12px', 
              fontWeight: 'bold', 
              color: '#007bff',
              marginTop: '15px',
              borderTop: '2px solid #007bff'
            }}>
              💼 COMERCIAL
            </div>
            <NavLink to="/clientes" className="sidebar-link">
              Clientes
            </NavLink>
            <NavLink to="/inventario" className="sidebar-link">
              Inventario
            </NavLink>
            <NavLink to="/cotizaciones" className="sidebar-link">
              Cotizaciones
            </NavLink>
            <NavLink to="/ventas" className="sidebar-link">
              Ventas
            </NavLink>
            
            {/* Administración */}
            <div style={{ 
              padding: '10px 15px', 
              fontSize: '12px', 
              fontWeight: 'bold', 
              color: '#6c757d',
              marginTop: '15px',
              borderTop: '2px solid #6c757d'
            }}>
              ⚙️ SISTEMA
            </div>
            <NavLink to="/administracion" className="sidebar-link" onClick={handleLinkClick}>
              Administración
            </NavLink>
          </>
        )}

        {/* TÉCNICO - Solo tickets */}
        {isTechnician && (
          <>
            <NavLink to="/dashboard" className="sidebar-link" onClick={handleLinkClick}>
              Dashboard
            </NavLink>
            <NavLink to="/tickets" className="sidebar-link" onClick={handleLinkClick}>
              Tickets
            </NavLink>
          </>
        )}

        {/* COMERCIAL - Cotizaciones, inventario y ventas */}
        {isSales && (
          <>
            <NavLink to="/dashboard" className="sidebar-link" onClick={handleLinkClick}>
              Dashboard
            </NavLink>
            <NavLink to="/clientes" className="sidebar-link" onClick={handleLinkClick}>
              Clientes
            </NavLink>
            <NavLink to="/inventario" className="sidebar-link" onClick={handleLinkClick}>
              Inventario
            </NavLink>
            <NavLink to="/cotizaciones" className="sidebar-link" onClick={handleLinkClick}>
              Cotizaciones
            </NavLink>
            <NavLink to="/ventas" className="sidebar-link" onClick={handleLinkClick}>
              Ventas
            </NavLink>
          </>
        )}

        {/* CLIENTE - Solo tickets */}
        {isClient && (
          <>
            <NavLink to="/dashboard" className="sidebar-link" onClick={handleLinkClick}>
              Dashboard
            </NavLink>
            <NavLink to="/tickets" className="sidebar-link" onClick={handleLinkClick}>
              Tickets
            </NavLink>
          </>
        )}
      </nav>
    </aside>
    </>
  )
}

export default Sidebar
