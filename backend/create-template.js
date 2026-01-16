import ExcelJS from 'exceljs'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Crear template Excel profesional para Click Soluciones
const createTemplate = async () => {
  const workbook = new ExcelJS.Workbook()
  const worksheet = workbook.addWorksheet('Cotización')

  // ============ CONFIGURAR COLUMNAS ============
  worksheet.columns = [
    { width: 2 },   // A
    { width: 8 },   // B - ITEM
    { width: 25 },  // C - CARACTERÍSTICA
    { width: 15 },  // D - MARCA
    { width: 15 },  // E - REFERENCIA
    { width: 10 },  // F - UNIDAD
    { width: 12 },  // G - CANTIDAD
    { width: 15 },  // H - VALOR UNITARIO
    { width: 15 }   // I - VALOR TOTAL
  ]

  // ============ ESTILOS ============
  const headerFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF001B54' } }
  const headerFont = { color: { argb: 'FFFFFFFF' }, bold: true, size: 11 }
  const headerAlignment = { horizontal: 'center', vertical: 'center', wrapText: true }
  const borderStyle = {
    top: { style: 'thin', color: { argb: 'FF000000' } },
    left: { style: 'thin', color: { argb: 'FF000000' } },
    bottom: { style: 'thin', color: { argb: 'FF000000' } },
    right: { style: 'thin', color: { argb: 'FF000000' } }
  }
  
  const dataAlignment = { horizontal: 'left', vertical: 'center' }
  const centerAlignment = { horizontal: 'center', vertical: 'center' }
  const currencyFormat = '$#,##0.00'

  // ============ FILA 1-3: ENCABEZADO ============
  worksheet.mergeCells('B1:D3')
  const logoCell = worksheet.getCell('B1')
  logoCell.value = 'CLICK\nSOLUCIONES S.A.S'
  logoCell.font = { name: 'Calibri', size: 16, bold: true, color: { argb: 'FF0099FF' } }
  logoCell.alignment = { horizontal: 'center', vertical: 'center', wrapText: true }
  logoCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFAFAFA' } }

  worksheet.mergeCells('E1:I3')
  const titleCell = worksheet.getCell('E1')
  titleCell.value = 'COTIZACIÓN'
  titleCell.font = { name: 'Calibri', size: 14, bold: true, color: { argb: 'FFFFFFFF' } }
  titleCell.fill = headerFill
  titleCell.alignment = { horizontal: 'center', vertical: 'center' }

  // ============ FILA 5-11: DATOS DEL CLIENTE ============
  const clientSections = [
    { label: 'SEÑORES:', placeholder: '{{cliente}}' },
    { label: 'ATENCIÓN:', placeholder: '' },
    { label: 'DIRECCIÓN:', placeholder: '{{direccion}}' },
    { label: 'TELÉFONO:', placeholder: '{{telefono}}' },
    { label: 'EMAIL:', placeholder: '{{email}}' },
    { label: 'CIUDAD:', placeholder: '{{ciudad}}' }
  ]

  let currentRow = 5
  clientSections.forEach(section => {
    const labelCell = worksheet.getCell(`B${currentRow}`)
    labelCell.value = section.label
    labelCell.font = { bold: true, size: 10 }
    labelCell.alignment = { horizontal: 'left', vertical: 'center' }
    labelCell.border = borderStyle

    const valueCell = worksheet.getCell(`C${currentRow}`)
    valueCell.value = section.placeholder
    valueCell.alignment = { horizontal: 'left', vertical: 'center' }
    valueCell.border = borderStyle

    currentRow++
  })

  // ============ FILA 12: ENCABEZADO DE TABLA ============
  const tableHeaderRow = 12
  const tableHeaders = [
    { col: 'B', text: 'ITEM' },
    { col: 'C', text: 'CARACTERÍSTICA' },
    { col: 'D', text: 'MARCA' },
    { col: 'E', text: 'REFERENCIA' },
    { col: 'F', text: 'UNIDAD' },
    { col: 'G', text: 'CANTIDAD' },
    { col: 'H', text: 'VALOR UNITARIO' },
    { col: 'I', text: 'VALOR TOTAL' }
  ]

  tableHeaders.forEach(header => {
    const cell = worksheet.getCell(`${header.col}${tableHeaderRow}`)
    cell.value = header.text
    cell.fill = headerFill
    cell.font = headerFont
    cell.alignment = headerAlignment
    cell.border = borderStyle
  })

  // ============ FILAS 13-17: TEMPLATE CON {{items}} ============
  // La fila 13 es la primera fila de datos con {{items}} como marcador
  for (let rowIdx = 0; rowIdx < 5; rowIdx++) {
    const rowNum = 13 + rowIdx
    const row = worksheet.getRow(rowNum)
    row.height = 25

    for (let col = 1; col <= 9; col++) {
      const cell = row.getCell(col)
      cell.border = borderStyle
      cell.alignment = { horizontal: 'left', vertical: 'center' }
      
      // Aplicar formato moneda a las columnas de precio
      if (col === 8 || col === 9) {
        cell.numFmt = currencyFormat
      }
    }

    // IMPORTANTE: Poner {{items}} en la primera celda de datos (columna B, fila 13)
    if (rowIdx === 0) {
      const itemCell = row.getCell(2)
      itemCell.value = '{{items}}'
      itemCell.alignment = centerAlignment
      console.log(`✅ {{items}} colocado en B${rowNum}`)
    }
  }

  // ============ FILA 19: TOTALES ============
  const totalRow = 19
  const totalLabelCell = worksheet.getCell(`G${totalRow}`)
  totalLabelCell.value = 'SUBTOTAL:'
  totalLabelCell.font = { bold: true, size: 10 }
  totalLabelCell.alignment = { horizontal: 'right', vertical: 'center' }

  const subtotalCell = worksheet.getCell(`H${totalRow}`)
  subtotalCell.value = '{{subtotal}}'
  subtotalCell.numFmt = currencyFormat
  subtotalCell.font = { bold: true }
  subtotalCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFAFAFA' } }
  subtotalCell.border = borderStyle

  // ============ FILA 20: IVA ============
  const ivaRow = 20
  const ivaLabelCell = worksheet.getCell(`G${ivaRow}`)
  ivaLabelCell.value = 'IVA (19%):'
  ivaLabelCell.font = { bold: true, size: 10 }
  ivaLabelCell.alignment = { horizontal: 'right', vertical: 'center' }

  const ivaCell = worksheet.getCell(`H${ivaRow}`)
  ivaCell.value = '{{iva}}'
  ivaCell.numFmt = currencyFormat
  ivaCell.font = { bold: true }
  ivaCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFAFAFA' } }
  ivaCell.border = borderStyle

  // ============ FILA 21: TOTAL ============
  const finalRow = 21
  const totalFinalLabel = worksheet.getCell(`G${finalRow}`)
  totalFinalLabel.value = 'TOTAL:'
  totalFinalLabel.font = { bold: true, size: 11, color: { argb: 'FFFFFFFF' } }
  totalFinalLabel.fill = headerFill
  totalFinalLabel.alignment = { horizontal: 'right', vertical: 'center' }

  const totalFinalCell = worksheet.getCell(`H${finalRow}`)
  totalFinalCell.value = '{{total}}'
  totalFinalCell.numFmt = currencyFormat
  totalFinalCell.font = { bold: true, size: 11, color: { argb: 'FFFFFFFF' } }
  totalFinalCell.fill = headerFill
  totalFinalCell.border = borderStyle

  // ============ FILAS INFERIORES ============
  const footer = [
    { row: 23, label: 'FECHA:', value: '{{fecha}}' },
    { row: 24, label: 'CONDICIONES DE PAGO:', value: '' },
    { row: 25, label: 'VALIDEZ DE LA OFERTA:', value: '30 días' },
    { row: 27, label: 'OBSERVACIONES:', value: '' }
  ]

  footer.forEach(item => {
    const labelCell = worksheet.getCell(`B${item.row}`)
    labelCell.value = item.label
    labelCell.font = { bold: true, size: 9 }
    labelCell.alignment = { horizontal: 'left', vertical: 'top' }

    const valueCell = worksheet.getCell(`C${item.row}`)
    valueCell.value = item.value
    valueCell.alignment = { horizontal: 'left', vertical: 'top' }
  })

  // ============ GUARDAR ============
  const templatePath = path.join(__dirname, 'uploads', 'template.xlsx')
  
  if (!fs.existsSync(path.join(__dirname, 'uploads'))) {
    fs.mkdirSync(path.join(__dirname, 'uploads'), { recursive: true })
  }

  await workbook.xlsx.writeFile(templatePath)
  console.log('✅ Template creado correctamente en:', templatePath)
  console.log('✅ {{items}} está en la fila 13, columna B')
}

createTemplate().catch(err => {
  console.error('❌ Error creando template:', err)
  process.exit(1)
})

