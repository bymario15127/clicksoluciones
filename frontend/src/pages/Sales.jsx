import { useState, useEffect } from 'react'
import { salesService } from '../services/sales'

const Sales = () => {
  const [sales, setSales] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSales()
  }, [])

  const loadSales = async () => {
    try {
      const data = await salesService.getAll()
      setSales(data)
    } catch (error) {
      console.error('Error loading sales:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadPDF = async (id) => {
    try {
      const blob = await salesService.downloadPDF(id)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `venta-${id}.pdf`
      a.click()
    } catch (error) {
      console.error('Error downloading PDF:', error)
    }
  }

  if (loading) {
    return <div>Cargando...</div>
  }

  return (
    <div className="sales-page">
      <div className="page-header">
        <h1>Ventas</h1>
      </div>

      <div className="card">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Cliente</th>
              <th>Cotización</th>
              <th>Total</th>
              <th>Fecha</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {sales.map(sale => (
              <tr key={sale.id}>
                <td>#{sale.id}</td>
                <td>{sale.client?.name}</td>
                <td>#{sale.quote_id}</td>
                <td>${sale.total}</td>
                <td>{new Date(sale.sale_date).toLocaleDateString()}</td>
                <td>
                  <button 
                    onClick={() => handleDownloadPDF(sale.id)} 
                    className="btn btn-sm btn-primary"
                  >
                    Descargar PDF
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Sales
