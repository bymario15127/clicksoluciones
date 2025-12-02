import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import authRoutes from './routes/auth.js'
import usersRoutes from './routes/users.js'
import ticketsRoutes from './routes/tickets.js'
import clientsRoutes from './routes/clients.js'
import productsRoutes from './routes/products.js'
import quotesRoutes from './routes/quotes.js'
import salesRoutes from './routes/sales.js'
import companiesRoutes from './routes/companies.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/users', usersRoutes)
app.use('/api/tickets', ticketsRoutes)
app.use('/api/clients', clientsRoutes)
app.use('/api/products', productsRoutes)
app.use('/api/quotes', quotesRoutes)
app.use('/api/sales', salesRoutes)
app.use('/api/companies', companiesRoutes)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'CLICK API funcionando correctamente' })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ 
    message: 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  })
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Ruta no encontrada' })
})

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`)
})
