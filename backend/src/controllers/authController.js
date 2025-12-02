import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { query } from '../config/database.js'

export const login = async (req, res) => {
  try {
    const { email, username, identifier, password } = req.body
    const idf = (username || identifier || email || '').trim()
    console.log('🔵 Login attempt:', { identifier: idf ? idf : '(empty)' })

    // Buscar por email o por usuario generado a partir del nombre: apellido.nombre (case-insensitive)
    let users = []
    if (idf.includes('.')) {
      const [lastIdf, firstIdf] = idf.split('.')
      users = await query(
        `SELECT u.*, r.name as role_name 
         FROM users u 
         JOIN roles r ON u.role_id = r.id 
         WHERE u.email = ? 
            OR (
              LOWER(SUBSTRING_INDEX(TRIM(u.name), ' ', -1)) = LOWER(?)
              AND LOWER(SUBSTRING_INDEX(TRIM(u.name), ' ', 1)) = LOWER(?)
            )
            OR LOWER(CONCAT(
                SUBSTRING_INDEX(TRIM(u.name), ' ', -1),
                '.',
                SUBSTRING_INDEX(TRIM(u.name), ' ', 1)
            )) = LOWER(?)
         LIMIT 1`,
        [idf, lastIdf, firstIdf, idf]
      )
    } else {
      users = await query(
        `SELECT u.*, r.name as role_name 
         FROM users u 
         JOIN roles r ON u.role_id = r.id 
         WHERE u.email = ? 
            OR LOWER(CONCAT(
                SUBSTRING_INDEX(TRIM(u.name), ' ', -1),
                '.',
                SUBSTRING_INDEX(TRIM(u.name), ' ', 1)
            )) = LOWER(?)
         LIMIT 1`,
        [idf, idf]
      )
    }
    console.log('🔵 Users found:', users.length, users)

    if (users.length === 0) {
      console.log('❌ No user found with identifier:', idf)
      return res.status(401).json({ message: 'Credenciales inválidas - usuario no encontrado' })
    }

    const user = users[0]
    console.log('🔵 Comparing password with hash:', { password, hash: user.password })
    const isValidPassword = await bcrypt.compare(password, user.password)
    console.log('🔵 Password valid?', isValidPassword)

    if (!isValidPassword) {
      console.log('❌ Invalid password for user:', email)
      return res.status(401).json({ message: 'Credenciales inválidas - contraseña incorrecta' })
    }

    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role_name,
        role_id: user.role_id,
        company_id: user.company_id
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    )

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role_id: user.role_id,
        company_id: user.company_id,
        role: { name: user.role_name }
      }
    })
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor', error: error.message })
  }
}

export const getMe = async (req, res) => {
  try {
    const users = await query(
      'SELECT u.id, u.name, u.email, u.role_id, u.company_id, r.name as role_name FROM users u JOIN roles r ON u.role_id = r.id WHERE u.id = ?',
      [req.user.id]
    )

    if (users.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' })
    }

    const user = users[0]
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role_id: user.role_id,
      company_id: user.company_id,
      role: { name: user.role_name }
    })
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor', error: error.message })
  }
}
