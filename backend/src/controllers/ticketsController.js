import { query } from '../config/database.js'

export const getAll = async (req, res) => {
  try {
    const { status, priority, category, company_id, user_id, role_id } = req.query
    let sql = `
      SELECT t.*, 
        u1.name as requester_name,
        u1.company_id as company_id,
        c.name as company_name,
        u2.name as technician_name 
      FROM tickets t 
      LEFT JOIN users u1 ON t.requester_id = u1.id
      LEFT JOIN companies c ON u1.company_id = c.id
      LEFT JOIN users u2 ON t.technician_id = u2.id 
      WHERE 1=1
    `
    const params = []

    // Si es cliente (role_id = 4), solo ver sus propios tickets
    if (role_id === '4' && user_id) {
      sql += ' AND t.requester_id = ?'
      params.push(user_id)
    }

    if (status) {
      sql += ' AND t.status = ?'
      params.push(status)
    }

    if (priority) {
      sql += ' AND t.priority = ?'
      params.push(priority)
    }

    if (category) {
      sql += ' AND t.category = ?'
      params.push(category)
    }

    if (company_id) {
      sql += ' AND u1.company_id = ?'
      params.push(company_id)
    }

    sql += ' ORDER BY t.created_at DESC'

    const tickets = await query(sql, params)
    res.json(tickets.map(t => ({
      ...t,
      requester: { name: t.requester_name },
      company: t.company_id ? { id: t.company_id, name: t.company_name } : null,
      technician: t.technician_name ? { name: t.technician_name } : null
    })))
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor', error: error.message })
  }
}

export const getById = async (req, res) => {
  try {
    const tickets = await query(
      `SELECT t.*, 
        u1.name as requester_name,
        u1.company_id as company_id,
        c.name as company_name,
        u2.name as technician_name 
      FROM tickets t 
      LEFT JOIN users u1 ON t.requester_id = u1.id
      LEFT JOIN companies c ON u1.company_id = c.id
      LEFT JOIN users u2 ON t.technician_id = u2.id 
      WHERE t.id = ?`,
      [req.params.id]
    )

    if (tickets.length === 0) {
      return res.status(404).json({ message: 'Ticket no encontrado' })
    }

    const comments = await query(
      `SELECT c.*, u.name as user_name 
      FROM ticket_comments c 
      JOIN users u ON c.user_id = u.id 
      WHERE c.ticket_id = ? 
      ORDER BY c.created_at ASC`,
      [req.params.id]
    )

    const ticket = tickets[0]
    res.json({
      ...ticket,
      requester: { name: ticket.requester_name },
      company: ticket.company_id ? { id: ticket.company_id, name: ticket.company_name } : null,
      technician: ticket.technician_name ? { name: ticket.technician_name } : null,
      comments: comments.map(c => ({
        ...c,
        user: { name: c.user_name }
      }))
    })
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor', error: error.message })
  }
}

export const create = async (req, res) => {
  try {
    const { title, description, priority, category, technician_id } = req.body
    const requester_id = req.user.id

    const result = await query(
      `INSERT INTO tickets (title, description, requester_id, technician_id, priority, status, category) 
       VALUES (?, ?, ?, ?, ?, 'nuevo', ?)`,
      [title, description, requester_id, technician_id || null, priority || 'media', category]
    )

    res.status(201).json({ 
      message: 'Ticket creado exitosamente',
      id: result.insertId 
    })
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor', error: error.message })
  }
}

export const update = async (req, res) => {
  try {
    const { title, description, priority, status, category, technician_id } = req.body
    const { id } = req.params

    // Construir query dinámicamente solo con los campos enviados
    const updates = []
    const values = []

    if (title !== undefined) {
      updates.push('title = ?')
      values.push(title)
    }
    if (description !== undefined) {
      updates.push('description = ?')
      values.push(description)
    }
    if (priority !== undefined) {
      updates.push('priority = ?')
      values.push(priority)
    }
    if (status !== undefined) {
      updates.push('status = ?')
      values.push(status)
    }
    if (category !== undefined) {
      updates.push('category = ?')
      values.push(category)
    }
    if (technician_id !== undefined) {
      updates.push('technician_id = ?')
      values.push(technician_id || null)
      
      // Si se asigna un técnico y el estado es 'nuevo', cambiar automáticamente a 'en proceso'
      if (technician_id && status === undefined) {
        updates.push('status = ?')
        values.push('en proceso')
      }
    }

    if (updates.length === 0) {
      return res.status(400).json({ message: 'No hay campos para actualizar' })
    }

    values.push(id)

    await query(
      `UPDATE tickets SET ${updates.join(', ')} WHERE id = ?`,
      values
    )

    res.json({ message: 'Ticket actualizado exitosamente' })
  } catch (error) {
    console.error('Error actualizando ticket:', error)
    res.status(500).json({ message: 'Error en el servidor', error: error.message })
  }
}

export const remove = async (req, res) => {
  try {
    await query('DELETE FROM tickets WHERE id = ?', [req.params.id])
    res.json({ message: 'Ticket eliminado exitosamente' })
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor', error: error.message })
  }
}

export const addComment = async (req, res) => {
  try {
    const { comment } = req.body
    const { id } = req.params
    const user_id = req.user.id

    await query(
      'INSERT INTO ticket_comments (ticket_id, user_id, comment) VALUES (?, ?, ?)',
      [id, user_id, comment]
    )

    res.status(201).json({ message: 'Comentario agregado exitosamente' })
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor', error: error.message })
  }
}

export const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No se proporcionó ningún archivo' })
    }

    res.json({ 
      message: 'Archivo subido exitosamente',
      filename: req.file.filename,
      path: req.file.path
    })
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor', error: error.message })
  }
}
