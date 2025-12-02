import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import './Navbar.css'

const Navbar = ({ onMenuClick }) => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <button className="menu-toggle" onClick={onMenuClick}>
          <span></span>
          <span></span>
          <span></span>
        </button>
        <div className="navbar-brand">
          <img src="/LOGO FONO NEGRO.png" alt="CLICK Soluciones" className="navbar-logo" />
        </div>
      </div>
      <div className="navbar-user">
        <span>
          👤 {user?.name}
          <span className="user-role">{user?.role?.name}</span>
        </span>
        <button onClick={handleLogout} className="btn btn-danger">
          Cerrar Sesión
        </button>
      </div>
    </nav>
  )
}

export default Navbar
