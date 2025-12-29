import ExcelJS from 'exceljs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function generateTemplateExample() {
  const workbook = new ExcelJS.Workbook()
  const worksheet = workbook.addWorksheet('Cotización', {
    pageSetup: { paperSize: 9, orientation: 'portrait' }
  })

  // Configurar ancho de columnas
  worksheet.columns = [
    { key: 'col1', width: 3 },
    { key: 'col2', width: 12 },
    { key: 'col3', width: 35 },
    { key: 'col4', width: 12 },
    { key: 'col5', width: 12 },
    { key: 'col6', width: 15 },
    { key: 'col7', width: 15 },
    { key: 'col8', width: 15 }
  ]

  // ===== HEADER =====
  // Logo y empresa
  worksheet.mergeCells('C1:E3')
  const headerCell = worksheet.getCell('C1')
  headerCell.value = 'TU EMPRESA S.A.S'
  headerCell.font = { name: 'Arial', size: 16, bold: true, color: { argb: 'FF00B4E5' } }
  headerCell.alignment = { horizontal: 'center', vertical: 'center', wrapText: true }

  // Info empresa
  worksheet.mergeCells('C4:E6')
  const infoCell = worksheet.getCell('C4')
  infoCell.value = 'NIT: 000.000.000-0\nDirección de tu empresa\nWWW.TUEMPRESA.COM'
  infoCell.font = { name: 'Arial', size: 9 }
  infoCell.alignment = { horizontal: 'center', vertical: 'top', wrapText: true }

  // Titulo COTIZACIÓN
  worksheet.mergeCells('G1:I2')
  const titleCell = worksheet.getCell('G1')
  titleCell.value = 'COTIZACIÓN'
  titleCell.font = { name: 'Arial', size: 14, bold: true, color: { argb: 'FF00B4E5' } }
  titleCell.alignment = { horizontal: 'center', vertical: 'center' }

  // Número de cotización
  worksheet.mergeCells('G3:I4')
  const numCell = worksheet.getCell('G3')
  numCell.value = `Cotización #: {{numero_cotizacion}}`
  numCell.font = { name: 'Arial', size: 10, bold: true }
  numCell.alignment = { horizontal: 'center', vertical: 'center' }

  // Fecha
  worksheet.mergeCells('G5:I6')
  const dateCell = worksheet.getCell('G5')
  dateCell.value = `Fecha: {{fecha}}`
  dateCell.font = { name: 'Arial', size: 10 }
  dateCell.alignment = { horizontal: 'center', vertical: 'center' }

  // ===== INFORMACIÓN DEL CLIENTE =====
  worksheet.getCell('B8').value = 'INFORMACIÓN DEL CLIENTE:'
  worksheet.getCell('B8').font = { bold: true, size: 11 }

  worksheet.getCell('B9').value = 'Cliente:'
  worksheet.getCell('C9').value = '{{cliente}}'
  worksheet.getCell('C9').font = { bold: true }

  worksheet.getCell('B10').value = 'Email:'
  worksheet.getCell('C10').value = '{{email}}'

  worksheet.getCell('B11').value = 'Teléfono:'
  worksheet.getCell('C11').value = '{{telefono}}'

  worksheet.getCell('B12').value = 'Dirección:'
  worksheet.getCell('C12').value = '{{direccion}}'

  worksheet.getCell('B13').value = 'Ciudad:'
  worksheet.getCell('C13').value = '{{ciudad}}'

  // ===== TABLA DE ITEMS =====
  worksheet.getCell('B15').value = 'ITEM'
  worksheet.getCell('C15').value = 'DESCRIPCIÓN'
  worksheet.getCell('E15').value = 'CANTIDAD'
  worksheet.getCell('F15').value = 'V.UNITARIO'
  worksheet.getCell('G15').value = 'V.TOTAL'

  // Aplicar estilos al header de la tabla
  const headerRow = worksheet.getRow(15)
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } }
  headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF00B4E5' } }
  headerRow.alignment = { horizontal: 'center', vertical: 'center' }

  // Filas de ejemplo (se llenarán dinámicamente)
  for (let i = 0; i < 5; i++) {
    const row = 16 + i
    worksheet.getCell(`B${row}`).value = i + 1
    worksheet.getCell(`C${row}`).value = `Producto ${i + 1}`
    worksheet.getCell(`E${row}`).value = 1
    worksheet.getCell(`F${row}`).value = 0
    worksheet.getCell(`G${row}`).value = 0

    // Aplicar formato de moneda
    worksheet.getCell(`F${row}`).numFmt = '$#,##0.00'
    worksheet.getCell(`G${row}`).numFmt = '$#,##0.00'
  }

  // ===== TOTALES =====
  worksheet.getCell('E21').value = 'SUBTOTAL:'
  worksheet.getCell('E21').font = { bold: true }
  worksheet.getCell('E21').alignment = { horizontal: 'right' }
  worksheet.getCell('G21').value = '{{subtotal}}'
  worksheet.getCell('G21').font = { bold: true }
  worksheet.getCell('G21').numFmt = '$#,##0.00'
  worksheet.getCell('G21').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8F4F8' } }

  worksheet.getCell('E22').value = 'IVA (19%):'
  worksheet.getCell('E22').font = { bold: true }
  worksheet.getCell('E22').alignment = { horizontal: 'right' }
  worksheet.getCell('G22').value = '{{iva}}'
  worksheet.getCell('G22').font = { bold: true }
  worksheet.getCell('G22').numFmt = '$#,##0.00'
  worksheet.getCell('G22').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8F4F8' } }

  worksheet.getCell('E23').value = 'TOTAL:'
  worksheet.getCell('E23').font = { bold: true, size: 12 }
  worksheet.getCell('E23').alignment = { horizontal: 'right' }
  worksheet.getCell('G23').value = '{{total}}'
  worksheet.getCell('G23').font = { bold: true, size: 12, color: { argb: 'FF00B4E5' } }
  worksheet.getCell('G23').numFmt = '$#,##0.00'
  worksheet.getCell('G23').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9EEF5' } }

  // ===== FOOTER =====
  worksheet.getCell('B25').value = 'Observaciones:'
  worksheet.getCell('B25').font = { bold: true }
  worksheet.mergeCells('B26:G28')
  worksheet.getCell('B26').value = 'Esta cotización es válida por 30 días.'
  worksheet.getCell('B26').alignment = { horizontal: 'left', vertical: 'top', wrapText: true }

  // Guardar archivo
  const uploadDir = path.join(__dirname, 'uploads')
  await workbook.xlsx.writeFile(path.join(uploadDir, 'template-ejemplo.xlsx'))

  console.log('✅ Template de ejemplo generado en: uploads/template-ejemplo.xlsx')
}

generateTemplateExample().catch(err => {
  console.error('❌ Error generando template:', err)
  process.exit(1)
})
