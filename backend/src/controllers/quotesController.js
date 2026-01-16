import { query, getConnection } from '../config/database.js'

export const getAll = async (req, res) => {
  try {
    const { status, client_id } = req.query
    let sql = `
      SELECT q.*, 
        c.name as client_name, 
        u.name as sales_name 
      FROM quotes q 
      LEFT JOIN clients c ON q.client_id = c.id 
      LEFT JOIN users u ON q.sales_id = u.id 
      WHERE 1=1
    `
    const params = []

    if (status) {
      sql += ' AND q.status = ?'
      params.push(status)
    }

    if (client_id) {
      sql += ' AND q.client_id = ?'
      params.push(client_id)
    }

    sql += ' ORDER BY q.created_at DESC'

    const quotes = await query(sql, params)
    res.json(quotes.map(q => ({
      ...q,
      client: { name: q.client_name },
      sales: { name: q.sales_name }
    })))
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor', error: error.message })
  }
}

export const getById = async (req, res) => {
  try {
    const quotes = await query(
      `SELECT q.*, 
        c.name as client_name, 
        u.name as sales_name 
      FROM quotes q 
      LEFT JOIN clients c ON q.client_id = c.id 
      LEFT JOIN users u ON q.sales_id = u.id 
      WHERE q.id = ?`,
      [req.params.id]
    )

    if (quotes.length === 0) {
      return res.status(404).json({ message: 'Cotización no encontrada' })
    }

    const items = await query(
      `SELECT qi.*, p.name as product_name 
      FROM quote_items qi 
      JOIN products p ON qi.product_id = p.id 
      WHERE qi.quote_id = ?`,
      [req.params.id]
    )

    const quote = quotes[0]
    res.json({
      ...quote,
      client: { name: quote.client_name },
      sales: { name: quote.sales_name },
      items: items.map(i => ({
        ...i,
        product: { name: i.product_name }
      }))
    })
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor', error: error.message })
  }
}

export const create = async (req, res) => {
  const connection = await getConnection()
  
  try {
    await connection.beginTransaction()

    console.log('📝 Datos recibidos:', JSON.stringify(req.body, null, 2))

    const { client_id, items, status = 'borrador', notes } = req.body
    const sales_id = req.user.id

    let subtotal = 0
    let iva_total = 0

    // Calcular totales
    for (const item of items) {
      const itemSubtotal = item.quantity * item.unit_price
      const itemIva = itemSubtotal * (item.iva_percentage / 100)
      subtotal += itemSubtotal
      iva_total += itemIva
    }

    const total = subtotal + iva_total

    console.log('💰 Totales calculados:', { subtotal, iva_total, total })

    // Crear cotización
    const [quoteResult] = await connection.execute(
      'INSERT INTO quotes (client_id, sales_id, subtotal, iva_total, total, status) VALUES (?, ?, ?, ?, ?, ?)',
      [client_id, sales_id, subtotal, iva_total, total, status]
    )

    const quote_id = quoteResult.insertId

    // Crear items
    for (const item of items) {
      const itemSubtotal = item.quantity * item.unit_price
      const itemIva = itemSubtotal * (item.iva_percentage / 100)
      const itemTotal = itemSubtotal + itemIva

      await connection.execute(
        'INSERT INTO quote_items (quote_id, product_id, quantity, price, iva, total) VALUES (?, ?, ?, ?, ?, ?)',
        [quote_id, item.product_id, item.quantity, item.unit_price, item.iva_percentage, itemTotal]
      )
    }

    await connection.commit()

    res.status(201).json({ 
      message: 'Cotización creada exitosamente',
      id: quote_id 
    })
  } catch (error) {
    await connection.rollback()
    console.error('❌ Error creando cotización:', error)
    res.status(500).json({ message: 'Error en el servidor', error: error.message })
  } finally {
    connection.release()
  }
}

export const update = async (req, res) => {
  try {
    const { status } = req.body
    const { id } = req.params

    await query('UPDATE quotes SET status = ? WHERE id = ?', [status, id])

    res.json({ message: 'Cotización actualizada exitosamente' })
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor', error: error.message })
  }
}

export const remove = async (req, res) => {
  try {
    const { id } = req.params
    
    console.log(`🗑️ Intentando eliminar cotización #${id}`)

    // Paso 1: Verificar que existe
    const quotes = await query('SELECT id FROM quotes WHERE id = ?', [id])
    if (!quotes || quotes.length === 0) {
      console.log(`❌ Cotización #${id} no encontrada`)
      return res.status(404).json({ message: 'Cotización no encontrada' })
    }
    console.log(`✓ Cotización encontrada`)

    // Paso 2: Eliminar items
    console.log(`→ Eliminando items...`)
    const itemsDeleted = await query('DELETE FROM quote_items WHERE quote_id = ?', [id])
    console.log(`✓ Items eliminados`)

    // Paso 3: Eliminar cotización
    console.log(`→ Eliminando cotización...`)
    const quoteDeleted = await query('DELETE FROM quotes WHERE id = ?', [id])
    console.log(`✓ Cotización eliminada`)

    res.json({ 
      message: 'Cotización eliminada exitosamente',
      id: id
    })
    
  } catch (error) {
    console.error('❌ ERROR al eliminar:', error.message)
    console.error('Stack:', error.stack)
    res.status(500).json({ 
      message: 'Error al eliminar cotización', 
      error: error.message
    })
  }
}

export const send = async (req, res) => {
  try {
    await query('UPDATE quotes SET status = ? WHERE id = ?', ['enviada', req.params.id])
    res.json({ message: 'Cotización enviada exitosamente' })
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor', error: error.message })
  }
}

export const approve = async (req, res) => {
  try {
    await query('UPDATE quotes SET status = ? WHERE id = ?', ['aprobada', req.params.id])
    res.json({ message: 'Cotización aprobada exitosamente' })
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor', error: error.message })
  }
}

export const convertToSale = async (req, res) => {
  const connection = await getConnection()
  
  try {
    await connection.beginTransaction()

    const quotes = await query('SELECT * FROM quotes WHERE id = ?', [req.params.id])

    if (quotes.length === 0) {
      return res.status(404).json({ message: 'Cotización no encontrada' })
    }

    const quote = quotes[0]

    const [saleResult] = await connection.execute(
      'INSERT INTO sales (quote_id, client_id, total) VALUES (?, ?, ?)',
      [quote.id, quote.client_id, quote.total]
    )

    await connection.execute(
      'UPDATE quotes SET status = ? WHERE id = ?',
      ['aprobada', quote.id]
    )

    await connection.commit()

    res.status(201).json({ 
      message: 'Venta creada exitosamente',
      id: saleResult.insertId 
    })
  } catch (error) {
    await connection.rollback()
    res.status(500).json({ message: 'Error en el servidor', error: error.message })
  } finally {
    connection.release()
  }
}
