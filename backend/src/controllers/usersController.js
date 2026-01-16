import bcrypt from 'bcrypt'
import { query } from '../config/database.js'

export const getAll = async (req, res) => {
  try {
    const users = await query(
      'SELECT u.id, u.name, u.email, u.role_id, u.company_id, r.name as role_name FROM users u JOIN roles r ON u.role_id = r.id'
    )

    res.json(users.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role_id: u.role_id,
      company_id: u.company_id,
      role: { name: u.role_name }
    })))
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor', error: error.message })
  }
}

export const getById = async (req, res) => {
  try {
    const users = await query(
      'SELECT u.id, u.name, u.email, u.role_id, r.name as role_name FROM users u JOIN roles r ON u.role_id = r.id WHERE u.id = ?',
      [req.params.id]
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
      role: { name: user.role_name }
    })
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor', error: error.message })
  }
}

export const create = async (req, res) => {
  try {
    const { name, email, password, role_id, company_id } = req.body

    // Validaciones
    if (!name || name.trim() === '') {
      return res.status(400).json({ message: 'El nombre es obligatorio' })
    }
    
    if (!password || password.trim() === '') {
      return res.status(400).json({ message: 'La contraseña es obligatoria' })
    }
    
    if (!role_id) {
      return res.status(400).json({ message: 'El rol es obligatorio' })
    }

    const normalizedEmail = email && email.trim() !== '' ? email.trim() : null

    if (normalizedEmail) {
      const existingUsers = await query('SELECT id FROM users WHERE email = ?', [normalizedEmail])
      if (existingUsers.length > 0) {
        return res.status(400).json({ message: 'El email ya está registrado' })
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const result = await query(
      'INSERT INTO users (name, email, password, role_id, company_id) VALUES (?, ?, ?, ?, ?)',
      [name, normalizedEmail, hashedPassword, role_id, company_id || null]
    )

    res.status(201).json({ 
      message: 'Usuario creado exitosamente',
      id: result.insertId 
    })
  } catch (error) {
    console.error('Error creating user:', error)
    res.status(500).json({ message: 'Error en el servidor', error: error.message })
  }
}

export const update = async (req, res) => {
  try {
    const { name, email, password, role_id, company_id } = req.body
    const { id } = req.params

    const normalizedEmail = email !== undefined ? (email && email.trim() !== '' ? email.trim() : null) : undefined

    let updateQuery = 'UPDATE users SET name = ?'
    let params = [name]

    if (normalizedEmail !== undefined) {
      updateQuery += ', email = ?'
      params.push(normalizedEmail)
    }

    updateQuery += ', role_id = ?, company_id = ?'
    params.push(role_id, company_id || null)

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10)
      updateQuery += ', password = ?'
      params.push(hashedPassword)
    }

    updateQuery += ' WHERE id = ?'
    params.push(id)

    await query(updateQuery, params)

    res.json({ message: 'Usuario actualizado exitosamente' })
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor', error: error.message })
  }
}

export const remove = async (req, res) => {
  try {
    await query('DELETE FROM users WHERE id = ?', [req.params.id])
    res.json({ message: 'Usuario eliminado exitosamente' })
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor', error: error.message })
  }
}
