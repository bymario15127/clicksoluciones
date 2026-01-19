import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'

// Pages
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Tickets from './pages/Tickets'
import TicketNew from './pages/TicketNew'
import TicketDetail from './pages/TicketDetail'
import Clients from './pages/Clients'
import ClientDetail from './pages/ClientDetail'
import Products from './pages/Products'
import Quotes from './pages/Quotes'
import QuoteNew from './pages/QuoteNew'
import QuoteDetail from './pages/QuoteDetail'
import QuoteEdit from './pages/QuoteEdit'
import Sales from './pages/Sales'
import Admin from './pages/Admin'
import AdminSettings from './pages/AdminSettings'
import Companies from './pages/Companies'
import CompanyDetail from './pages/CompanyDetail'

// Helpers de redirección para rutas antiguas con parámetros
const RedirectClientId = () => {
  const { id } = useParams()
  return <Navigate to={`/clientes/${id}`} replace />
}

const RedirectQuoteId = () => {
  const { id } = useParams()
  return <Navigate to={`/cotizaciones/${id}`} replace />
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="tickets" element={<Tickets />} />
            <Route path="tickets/new" element={<TicketNew />} />
            <Route path="tickets/:id" element={<TicketDetail />} />
            <Route path="clientes" element={<Clients />} />
            <Route path="clientes/:id" element={<ClientDetail />} />
            <Route path="companies" element={<Companies />} />
            <Route path="companies/:id" element={<CompanyDetail />} />
            <Route path="inventario" element={<Products />} />
            <Route path="cotizaciones" element={<Quotes />} />
            <Route path="cotizaciones/new" element={<QuoteNew />} />
            <Route path="cotizaciones/:id" element={<QuoteDetail />} />
            <Route path="cotizaciones/:id/editar" element={<QuoteEdit />} />
            <Route path="ventas" element={<Sales />} />
            <Route path="administracion" element={<ProtectedRoute roles={['admin']}><Admin /></ProtectedRoute>} />
            <Route path="configuracion" element={<ProtectedRoute roles={['admin']}><AdminSettings /></ProtectedRoute>} />

            {/* Redirecciones de rutas antiguas en inglés para compatibilidad */}
            <Route path="clients" element={<Navigate to="/clientes" replace />} />
            <Route path="clients/:id" element={<RedirectClientId />} />
            <Route path="products" element={<Navigate to="/inventario" replace />} />
            <Route path="quotes" element={<Navigate to="/cotizaciones" replace />} />
            <Route path="quotes/new" element={<Navigate to="/cotizaciones/new" replace />} />
            <Route path="quotes/:id" element={<RedirectQuoteId />} />
            <Route path="sales" element={<Navigate to="/ventas" replace />} />
            <Route path="admin" element={<Navigate to="/administracion" replace />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
