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
              <h3>📝 Instrucciones Detalladas:</h3>
              <ol>
                <li><strong>Prepara tu template en Excel</strong> con el diseño y logo de tu empresa</li>
                
                <li><strong>Reemplaza valores por placeholders</strong> donde necesites que se llenen datos automáticamente:
                  <div style={{ marginTop: '8px', paddingLeft: '20px' }}>
                    <p><strong>Datos del Cliente:</strong></p>
                    <ul style={{ margin: '5px 0' }}>
                      <li><code>{'{{cliente}}'}</code> - Nombre del cliente</li>
                      <li><code>{'{{email}}'}</code> - Email del cliente</li>
                      <li><code>{'{{telefono}}'}</code> - Teléfono del cliente</li>
                      <li><code>{'{{direccion}}'}</code> - Dirección del cliente</li>
                      <li><code>{'{{ciudad}}'}</code> - Ciudad</li>
                    </ul>
                    
                    <p style={{ marginTop: '10px' }}><strong>Datos de la Cotización:</strong></p>
                    <ul style={{ margin: '5px 0' }}>
                      <li><code>{'{{fecha}}'}</code> - Fecha de cotización</li>
                      <li><code>{'{{numero_cotizacion}}'}</code> - Número de cotización</li>
                    </ul>
                    
                    <p style={{ marginTop: '10px' }}><strong>📌 IMPORTANTE - Productos (OBLIGATORIO):</strong></p>
                    <ul style={{ margin: '5px 0', backgroundColor: '#fff3cd', padding: '10px', borderRadius: '4px' }}>
                      <li><strong>En la primera fila de tu tabla de productos</strong>, en la <strong>columna ITEM (B)</strong>, escribe:</li>
                      <li style={{ marginTop: '5px', fontSize: '16px', fontWeight: 'bold', color: '#d32f2f' }}><code>{'{{items}}'}</code></li>
                      <li style={{ marginTop: '5px', fontSize: '12px', color: '#666' }}>Esto le indica al sistema dónde expandir las filas de productos</li>
                    </ul>
                    
                    <p style={{ marginTop: '10px' }}><strong>Datos de Totales:</strong></p>
                    <ul style={{ margin: '5px 0' }}>
                      <li><code>{'{{subtotal}}'}</code> - Subtotal (sin IVA)</li>
                      <li><code>{'{{iva}}'}</code> - IVA (19%)</li>
                      <li><code>{'{{total}}'}</code> - Total final</li>
                    </ul>
                  </div>
                </li>

                <li><strong>Estructura de columnas requeridas:</strong>
                  <div style={{ marginTop: '8px', fontSize: '12px', backgroundColor: '#f5f5f5', padding: '10px', borderRadius: '4px' }}>
                    <p style={{ margin: '3px 0' }}>Para que funcione correctamente, tu tabla debe tener estas columnas en este orden:</p>
                    <ul style={{ margin: '5px 0' }}>
                      <li><strong>B</strong> = ITEM (número 1, 2, 3...)</li>
                      <li><strong>C</strong> = CARACTERÍSTICA / DESCRIPCIÓN</li>
                      <li><strong>D</strong> = MARCA</li>
                      <li><strong>E</strong> = REFERENCIA</li>
                      <li><strong>F</strong> = UNIDAD</li>
                      <li><strong>G</strong> = CANTIDAD</li>
                      <li><strong>H</strong> = VALOR UNITARIO (precio)</li>
                      <li><strong>I</strong> = VALOR TOTAL</li>
                    </ul>
                  </div>
                </li>

                <li><strong>Guarda tu template</strong> en formato .xlsx (Excel 2007+)</li>
                
                <li><strong>Sube el archivo aquí</strong> (solo se guarda 1 template a la vez)</li>
                
                <li><strong>¡Listo!</strong> A partir de ahora, todas las cotizaciones se descargarán:
                  <ul style={{ marginTop: '5px' }}>
                    <li>✅ Con tu diseño y logo exacto</li>
                    <li>✅ Con todos los datos rellenados automáticamente</li>
                    <li>✅ Con las filas expandidas según la cantidad de productos</li>
                    <li>✅ Manteniendo 100% el formato (bordes, colores, fuentes)</li>
                  </ul>
                </li>
              </ol>
            </div>

            <div className="example-section">
              <h3>📌 Ejemplo Visual de Template Correcto:</h3>
              <p>Aquí está la estructura que debe tener tu Excel:</p>
              <div className="example-box" style={{ fontSize: '12px', lineHeight: '1.6' }}>
                <p><strong>ENCABEZADO (filas 1-3)</strong></p>
                <p style={{ margin: '2px 0', paddingLeft: '10px' }}>Tu logo, nombre de empresa, etc.</p>
                
                <p style={{ marginTop: '10px' }}><strong>DATOS DEL CLIENTE (filas 5-10)</strong></p>
                <p style={{ margin: '2px 0', paddingLeft: '10px' }}>Señores: {'{{cliente}}'}</p>
                <p style={{ margin: '2px 0', paddingLeft: '10px' }}>Email: {'{{email}}'}</p>
                <p style={{ margin: '2px 0', paddingLeft: '10px' }}>Teléfono: {'{{telefono}}'}</p>
                <p style={{ margin: '2px 0', paddingLeft: '10px' }}>Dirección: {'{{direccion}}'}</p>
                <p style={{ margin: '2px 0', paddingLeft: '10px' }}>Ciudad: {'{{ciudad}}'}</p>
                
                <p style={{ marginTop: '10px' }}><strong>TABLA DE PRODUCTOS (a partir de fila 12)</strong></p>
                <div style={{ 
                  backgroundColor: '#f0f0f0', 
                  padding: '8px', 
                  margin: '5px 0', 
                  borderRadius: '3px',
                  fontFamily: 'monospace',
                  fontSize: '11px'
                }}>
                  <p style={{ margin: '2px 0' }}>ITEM | CARACTERÍSTICA | MARCA | REF | UNIDAD | CANTIDAD | V. UNITARIO | V. TOTAL</p>
                  <p style={{ margin: '2px 0', color: '#d32f2f', fontWeight: 'bold' }}>{'{{items}}'} | [Data] | [Data] | [Data] | [Data] | [Data] | [Data] | [Data]</p>
                  <p style={{ margin: '2px 0', fontSize: '10px', color: '#999' }}>↑ En la columna ITEM (B), escribe {'{{items}}'}</p>
                </div>
                
                <p style={{ marginTop: '10px' }}><strong>TOTALES (filas después de productos)</strong></p>
                <p style={{ margin: '2px 0', paddingLeft: '10px' }}>SUBTOTAL: {'{{subtotal}}'}</p>
                <p style={{ margin: '2px 0', paddingLeft: '10px' }}>IVA (19%): {'{{iva}}'}</p>
                <p style={{ margin: '2px 0', paddingLeft: '10px' }}>TOTAL: <span style={{ fontWeight: 'bold', color: '#d32f2f' }}>{'{{total}}'}</span></p>
              </div>
              
              <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#e3f2fd', borderLeft: '4px solid #2196f3', borderRadius: '4px' }}>
                <p style={{ margin: '5px 0', fontSize: '13px' }}>
                  <strong>💡 Consejo:</strong> Puedes usar tu template actual sin problemas. Solo reemplaza los valores que varían (cliente, datos, productos) por los placeholders {'{{...}}'}, y mantén todo lo que es fijo (logo, encabezados, estilos).
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
