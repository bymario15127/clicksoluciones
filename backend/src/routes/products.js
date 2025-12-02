import express from 'express'
import * as productsController from '../controllers/productsController.js'
import { authMiddleware, requireRole } from '../middleware/auth.js'

const router = express.Router()

router.use(authMiddleware)

router.get('/', productsController.getAll)
router.get('/:id', productsController.getById)
router.post('/', requireRole('admin', 'comercial'), productsController.create)
router.put('/:id', requireRole('admin', 'comercial'), productsController.update)
router.delete('/:id', requireRole('admin'), productsController.remove)

export default router
