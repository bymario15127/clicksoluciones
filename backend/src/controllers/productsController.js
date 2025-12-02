import { query } from '../config/database.js'

export const getAll = async (req, res) => {
  try {
    const { category, lowStock } = req.query
    let sql = 'SELECT * FROM products WHERE 1=1'
    const params = []

    if (category) {
      sql += ' AND category = ?'
      params.push(category)
    }

    if (lowStock) {
      sql += ' AND stock < ?'
      params.push(parseInt(lowStock))
    }

    sql += ' ORDER BY name'

    const products = await query(sql, params)
    res.json(products)
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor', error: error.message })
  }
}

export const getById = async (req, res) => {
  try {
    const products = await query('SELECT * FROM products WHERE id = ?', [req.params.id])

    if (products.length === 0) {
      return res.status(404).json({ message: 'Producto no encontrado' })
    }

    res.json(products[0])
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor', error: error.message })
  }
}

export const create = async (req, res) => {
  try {
    const { name, category, brand, model, serial, price_buy, price_sell, iva, stock, status } = req.body

    const result = await query(
      `INSERT INTO products (name, category, brand, model, serial, price_buy, price_sell, iva, stock, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, category, brand, model, serial, price_buy, price_sell, iva, stock, status]
    )

    res.status(201).json({ 
      message: 'Producto creado exitosamente',
      id: result.insertId 
    })
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor', error: error.message })
  }
}

export const update = async (req, res) => {
  try {
    const { name, category, brand, model, serial, price_buy, price_sell, iva, stock, status } = req.body
    const { id } = req.params

    await query(
      `UPDATE products 
       SET name = ?, category = ?, brand = ?, model = ?, serial = ?, price_buy = ?, price_sell = ?, iva = ?, stock = ?, status = ? 
       WHERE id = ?`,
      [name, category, brand, model, serial, price_buy, price_sell, iva, stock, status, id]
    )

    res.json({ message: 'Producto actualizado exitosamente' })
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor', error: error.message })
  }
}

export const remove = async (req, res) => {
  try {
    await query('DELETE FROM products WHERE id = ?', [req.params.id])
    res.json({ message: 'Producto eliminado exitosamente' })
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor', error: error.message })
  }
}
