import express from 'express'
import companiesController from '../controllers/companiesController.js'
import { authMiddleware } from '../middleware/auth.js'

const router = express.Router()

// Todas las rutas requieren autenticación
router.use(authMiddleware)

router.get('/', companiesController.getAll)
router.get('/:id', companiesController.getById)
router.post('/', companiesController.create)
router.put('/:id', companiesController.update)
router.delete('/:id', companiesController.delete)

export default router
