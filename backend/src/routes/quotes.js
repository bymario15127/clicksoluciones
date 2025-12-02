import express from 'express'
import * as quotesController from '../controllers/quotesController.js'
import { authMiddleware, requireRole } from '../middleware/auth.js'

const router = express.Router()

router.use(authMiddleware)

router.get('/', quotesController.getAll)
router.get('/:id', quotesController.getById)
router.post('/', requireRole('admin', 'comercial'), quotesController.create)
router.put('/:id', requireRole('admin', 'comercial'), quotesController.update)
router.delete('/:id', requireRole('admin'), quotesController.remove)
router.post('/:id/send', requireRole('admin', 'comercial'), quotesController.send)
router.post('/:id/approve', quotesController.approve)
router.post('/:id/convert-to-sale', requireRole('admin', 'comercial'), quotesController.convertToSale)

export default router
