import express from 'express'
import multer from 'multer'
import path from 'path'
import * as exportController from '../controllers/exportController.js'
import { authMiddleware } from '../middleware/auth.js'

const router = express.Router()

// Configurar multer para subida de archivos Excel
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/')
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
  }
})

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    // Solo permitir archivos Excel
    const allowedExtensions = ['.xlsx', '.xls']
    const fileExtension = path.extname(file.originalname).toLowerCase()
    
    if (allowedExtensions.includes(fileExtension)) {
      cb(null, true)
    } else {
      cb(new Error('Solo se permiten archivos Excel (.xlsx, .xls)'))
    }
  }
})

// Subir template Excel personalizado
router.post('/template', authMiddleware, upload.single('template'), exportController.uploadTemplate)

// Descargar cotización en Excel
router.get('/quote/:id', authMiddleware, exportController.generateQuoteExcel)

// Descargar template en blanco
router.get('/quote-template', authMiddleware, exportController.downloadQuoteTemplate)

export default router
