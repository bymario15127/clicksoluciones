import { useState } from 'react'
import { exportService } from '../services/export'
import '../styles/AdminSettings.css'

export default function AdminSettings() {
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('') // 'success' or 'error'

  const handleTemplateUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Validar que sea un archivo Excel
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      setMessageType('error')
      setMessage('❌ Por favor sube un archivo Excel (.xlsx o .xls)')
      return
    }

    setUploading(true)
    setMessage('')

    try {
      const formData = new FormData()
      formData.append('template', file)

      const response = await fetch('/api/export/template', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      })

      if (!response.ok) {
        throw new Error('Error al subir el template')
      }

      setMessageType('success')
      setMessage('✅ Template subido correctamente. Se usará en todas las futuras descargas de cotizaciones.')
    } catch (error) {
      setMessageType('error')
      setMessage('❌ Error al subir el template: ' + error.message)
    } finally {
      setUploading(false)
      e.target.value = '' // Limpiar input
    }
  }

  return (
    <div className="admin-settings">
      <div className="settings-container">
        <h1>⚙️ Configuración del Sistema</h1>

        <div className="settings-section">
          <div className="section-card">
            <h2>📋 Template de Cotizaciones</h2>
            <p className="section-description">
              Sube tu template personalizado de Excel con el diseño y logo de tu empresa. 
              Este template se usará automáticamente en todas las descargas de cotizaciones.
            </p>

            <div className="upload-area">
              <input
                type="file"
                id="template-input"
                accept=".xlsx,.xls"
                onChange={handleTemplateUpload}
                disabled={uploading}
                className="file-input"
              />
              <label htmlFor="template-input" className={`upload-label ${uploading ? 'disabled' : ''}`}>
                <div className="upload-icon">📁</div>
                <div className="upload-text">
                  {uploading ? 'Subiendo...' : 'Haz clic aquí o arrastra tu archivo Excel'}
                </div>
                <div className="upload-hint">
                  Soporta: .xlsx, .xls
                </div>
              </label>
            </div>

            {message && (
              <div className={`message ${messageType}`}>
                {message}
              </div>
            )}

            <div className="instructions">
              <h3>📝 Instrucciones:</h3>
              <ol>
                <li>Crea tu template en Excel con el diseño y logo de tu empresa</li>
                <li>Usa estos placeholders en el template donde desees que se llenen los datos:
                  <ul>
                    <li><code>{'{{cliente}}'}</code> - Nombre del cliente</li>
                    <li><code>{'{{email}}'}</code> - Email del cliente</li>
                    <li><code>{'{{telefono}}'}</code> - Teléfono del cliente</li>
                    <li><code>{'{{direccion}}'}</code> - Dirección del cliente</li>
                    <li><code>{'{{ciudad}}'}</code> - Ciudad</li>
                    <li><code>{'{{fecha}}'}</code> - Fecha de cotización</li>
                    <li><code>{'{{numero_cotizacion}}'}</code> - Número de cotización</li>
                    <li><code>{'{{subtotal}}'}</code> - Subtotal</li>
                    <li><code>{'{{iva}}'}</code> - IVA (19%)</li>
                    <li><code>{'{{total}}'}</code> - Total</li>
                  </ul>
                </li>
                <li>Sube el archivo aquí (solo se guarda 1 template a la vez)</li>
                <li>A partir de ahora, todas las cotizaciones se descargarán con tu diseño personalizado</li>
              </ol>
            </div>

            <div className="example-section">
              <h3>📌 Ejemplo de uso en Excel:</h3>
              <p>En tu template Excel, puedes tener algo como:</p>
              <div className="example-box">
                <p><strong>Cliente:</strong> {'{{cliente}}'}</p>
                <p><strong>Email:</strong> {'{{email}}'}</p>
                <p><strong>Fecha:</strong> {'{{fecha}}'}</p>
                <p><strong>Cotización #:</strong> {'{{numero_cotizacion}}'}</p>
                <hr style={{ margin: '10px 0' }} />
                <p style={{ marginTop: '10px' }}><strong>Total:</strong> $ {'{{total}}'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
