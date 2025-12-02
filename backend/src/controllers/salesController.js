import { query } from '../config/database.js'

export const getAll = async (req, res) => {
  try {
    const sales = await query(
      `SELECT s.*, 
        c.name as client_name, 
        q.total as quote_total 
      FROM sales s 
      LEFT JOIN clients c ON s.client_id = c.id 
      LEFT JOIN quotes q ON s.quote_id = q.id 
      ORDER BY s.sale_date DESC`
    )

    res.json(sales.map(s => ({
      ...s,
      client: { name: s.client_name }
    })))
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor', error: error.message })
  }
}

export const getById = async (req, res) => {
  try {
    const sales = await query(
      `SELECT s.*, 
        c.name as client_name, 
        c.document as client_document,
        c.address as client_address 
      FROM sales s 
      LEFT JOIN clients c ON s.client_id = c.id 
      WHERE s.id = ?`,
      [req.params.id]
    )

    if (sales.length === 0) {
      return res.status(404).json({ message: 'Venta no encontrada' })
    }

    const sale = sales[0]

    // Obtener items de la cotización
    const items = await query(
      `SELECT qi.*, p.name as product_name 
      FROM quote_items qi 
      JOIN products p ON qi.product_id = p.id 
      WHERE qi.quote_id = ?`,
      [sale.quote_id]
    )

    res.json({
      ...sale,
      client: {
        name: sale.client_name,
        document: sale.client_document,
        address: sale.client_address
      },
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
  try {
    const { quote_id, client_id, total } = req.body

    const result = await query(
      'INSERT INTO sales (quote_id, client_id, total) VALUES (?, ?, ?)',
      [quote_id, client_id, total]
    )

    res.status(201).json({ 
      message: 'Venta creada exitosamente',
      id: result.insertId 
    })
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor', error: error.message })
  }
}

export const downloadPDF = async (req, res) => {
  try {
    // Aquí implementarías la generación del PDF
    // Por ahora solo retornamos un mensaje
    res.json({ message: 'Funcionalidad de PDF en desarrollo' })
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor', error: error.message })
  }
}
