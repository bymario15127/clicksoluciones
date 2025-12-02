import express from 'express'
import * as usersController from '../controllers/usersController.js'
import { authMiddleware, requireRole } from '../middleware/auth.js'

const router = express.Router()

router.use(authMiddleware)
router.use(requireRole('admin'))

router.get('/', usersController.getAll)
router.get('/:id', usersController.getById)
router.post('/', usersController.create)
router.put('/:id', usersController.update)
router.delete('/:id', usersController.remove)

export default router
