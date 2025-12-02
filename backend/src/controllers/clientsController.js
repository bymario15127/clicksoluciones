import { query } from '../config/database.js'

export const getAll = async (req, res) => {
  try {
    const clients = await query('SELECT * FROM clients ORDER BY name')
    res.json(clients)
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor', error: error.message })
  }
}

export const getById = async (req, res) => {
  try {
    const clients = await query('SELECT * FROM clients WHERE id = ?', [req.params.id])

    if (clients.length === 0) {
      return res.status(404).json({ message: 'Cliente no encontrado' })
    }

    res.json(clients[0])
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor', error: error.message })
  }
}

export const create = async (req, res) => {
  try {
    const { name, document, email, phone, address, city, contact } = req.body

    const result = await query(
      'INSERT INTO clients (name, document, email, phone, address, city, contact) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, document, email, phone, address, city, contact]
    )

    res.status(201).json({ 
      message: 'Cliente creado exitosamente',
      id: result.insertId 
    })
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor', error: error.message })
  }
}

export const update = async (req, res) => {
  try {
    const { name, document, email, phone, address, city, contact } = req.body
    const { id } = req.params

    await query(
      'UPDATE clients SET name = ?, document = ?, email = ?, phone = ?, address = ?, city = ?, contact = ? WHERE id = ?',
      [name, document, email, phone, address, city, contact, id]
    )

    res.json({ message: 'Cliente actualizado exitosamente' })
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor', error: error.message })
  }
}

export const remove = async (req, res) => {
  try {
    await query('DELETE FROM clients WHERE id = ?', [req.params.id])
    res.json({ message: 'Cliente eliminado exitosamente' })
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor', error: error.message })
  }
}

export const getHistory = async (req, res) => {
  try {
    const { id } = req.params

    const tickets = await query(
      'SELECT * FROM tickets WHERE requester_id IN (SELECT id FROM users WHERE email IN (SELECT email FROM clients WHERE id = ?)) ORDER BY created_at DESC',
      [id]
    )

    const quotes = await query(
      'SELECT * FROM quotes WHERE client_id = ? ORDER BY created_at DESC',
      [id]
    )

    const sales = await query(
      'SELECT * FROM sales WHERE client_id = ? ORDER BY sale_date DESC',
      [id]
    )

    res.json({
      tickets,
      quotes,
      sales
    })
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor', error: error.message })
  }
}
