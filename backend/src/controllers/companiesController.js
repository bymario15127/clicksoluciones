import db from '../config/database.js'

const companiesController = {
  // Obtener todas las empresas
  async getAll(req, res) {
    try {
      // Si el usuario tiene rol de cliente, solo puede ver su propia empresa
      if (req.user.role === 'client' && req.user.company_id) {
        const [companies] = await db.query(
          'SELECT * FROM companies WHERE id = ? AND active = true',
          [req.user.company_id]
        )
        return res.json(companies)
      }
      
      // Administradores y otros roles pueden ver todas las empresas
      const [companies] = await db.query(
        'SELECT * FROM companies WHERE active = true ORDER BY name'
      )
      res.json(companies)
    } catch (error) {
      console.error('❌ Error getting companies:', error)
      res.status(500).json({ message: 'Error al obtener empresas' })
    }
  },

  // Obtener empresa por ID con sus usuarios
  async getById(req, res) {
    try {
      const { id } = req.params
      
      const [companies] = await db.query(
        'SELECT * FROM companies WHERE id = ?',
        [id]
      )

      if (companies.length === 0) {
        return res.status(404).json({ message: 'Empresa no encontrada' })
      }

      // Obtener usuarios de esta empresa
      const [users] = await db.query(`
        SELECT u.id, u.name, u.email, u.role_id, r.name as role_name
        FROM users u
        LEFT JOIN roles r ON u.role_id = r.id
        WHERE u.company_id = ?
        ORDER BY u.name
      `, [id])

      const company = {
        ...companies[0],
        users
      }

      res.json(company)
    } catch (error) {
      console.error('❌ Error getting company:', error)
      res.status(500).json({ message: 'Error al obtener empresa' })
    }
  },

  // Crear empresa
  async create(req, res) {
    try {
      const { name, email, phone, address, contact_person, notes } = req.body

      if (!name) {
        return res.status(400).json({ message: 'El nombre es requerido' })
      }

      const [result] = await db.query(
        `INSERT INTO companies (name, email, phone, address, contact_person, notes) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [name, email, phone, address, contact_person, notes]
      )

      res.status(201).json({ 
        id: result.insertId,
        message: 'Empresa creada exitosamente' 
      })
    } catch (error) {
      console.error('❌ Error creating company:', error)
      res.status(500).json({ message: 'Error al crear empresa' })
    }
  },

  // Actualizar empresa
  async update(req, res) {
    try {
      const { id } = req.params
      const { name, email, phone, address, contact_person, notes, active } = req.body

      const updates = []
      const values = []

      if (name !== undefined) {
        updates.push('name = ?')
        values.push(name)
      }
      if (email !== undefined) {
        updates.push('email = ?')
        values.push(email)
      }
      if (phone !== undefined) {
        updates.push('phone = ?')
        values.push(phone)
      }
      if (address !== undefined) {
        updates.push('address = ?')
        values.push(address)
      }
      if (contact_person !== undefined) {
        updates.push('contact_person = ?')
        values.push(contact_person)
      }
      if (notes !== undefined) {
        updates.push('notes = ?')
        values.push(notes)
      }
      if (active !== undefined) {
        updates.push('active = ?')
        values.push(active)
      }

      if (updates.length === 0) {
        return res.status(400).json({ message: 'No hay datos para actualizar' })
      }

      values.push(id)
      const sql = `UPDATE companies SET ${updates.join(', ')} WHERE id = ?`

      await db.query(sql, values)
      res.json({ message: 'Empresa actualizada exitosamente' })
    } catch (error) {
      console.error('❌ Error updating company:', error)
      res.status(500).json({ message: 'Error al actualizar empresa' })
    }
  },

  // Eliminar empresa (soft delete)
  async delete(req, res) {
    try {
      const { id } = req.params

      // Verificar si tiene usuarios asociados
      const [users] = await db.query(
        'SELECT COUNT(*) as count FROM users WHERE company_id = ?',
        [id]
      )

      if (users[0].count > 0) {
        return res.status(400).json({ 
          message: 'No se puede eliminar la empresa porque tiene usuarios asociados' 
        })
      }

      await db.query('UPDATE companies SET active = false WHERE id = ?', [id])
      res.json({ message: 'Empresa eliminada exitosamente' })
    } catch (error) {
      console.error('❌ Error deleting company:', error)
      res.status(500).json({ message: 'Error al eliminar empresa' })
    }
  }
}

export default companiesController
