import express from 'express'
import * as ticketsController from '../controllers/ticketsController.js'
import { authMiddleware } from '../middleware/auth.js'
import { upload } from '../middleware/upload.js'

const router = express.Router()

router.use(authMiddleware)

router.get('/', ticketsController.getAll)
router.get('/:id', ticketsController.getById)
router.post('/', ticketsController.create)
router.put('/:id', ticketsController.update)
router.delete('/:id', ticketsController.remove)
router.post('/:id/comment', ticketsController.addComment)
router.post('/:id/upload', upload.single('file'), ticketsController.uploadFile)

export default router
