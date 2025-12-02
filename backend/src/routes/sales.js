import express from 'express'
import * as salesController from '../controllers/salesController.js'
import { authMiddleware, requireRole } from '../middleware/auth.js'

const router = express.Router()

router.use(authMiddleware)

router.get('/', salesController.getAll)
router.get('/:id', salesController.getById)
router.post('/', requireRole('admin', 'comercial'), salesController.create)
router.get('/:id/pdf', salesController.downloadPDF)

export default router
