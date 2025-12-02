import express from 'express'
import * as clientsController from '../controllers/clientsController.js'
import { authMiddleware } from '../middleware/auth.js'

const router = express.Router()

router.use(authMiddleware)

router.get('/', clientsController.getAll)
router.get('/:id', clientsController.getById)
router.post('/', clientsController.create)
router.put('/:id', clientsController.update)
router.delete('/:id', clientsController.remove)
router.get('/:id/history', clientsController.getHistory)

export default router
