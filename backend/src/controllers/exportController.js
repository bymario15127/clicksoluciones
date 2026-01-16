import ExcelJS from 'exceljs'
import { query } from '../config/database.js'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'
import puppeteer from 'puppeteer'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const TEMPLATE_PATH = path.join(__dirname, '../../uploads/template.xlsx')
// Subir template Excel personalizado
export const uploadTemplate = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No se subió archivo' })
    }

    const uploadPath = path.join(__dirname, `../../uploads/${req.file.filename}`)
    
    // Copiar archivo a la carpeta uploads con nombre template.xlsx
    fs.copyFileSync(uploadPath, TEMPLATE_PATH)
    
    // Eliminar archivo temporal
    try {
      fs.unlinkSync(uploadPath)
    } catch (e) {
      // Ignorar si falla el borrado
    }
    
    res.json({ 
      message: 'Template subido correctamente',
      filename: req.file.filename
    })
  } catch (error) {
    console.error('Error subiendo template:', error)
    res.status(500).json({ message: 'Error subiendo template', error: error.message })
  }
}

// Descargar cotización usando template personalizado
export const generateQuoteExcel = async (req, res) => {
  try {
    const { id } = req.params
    console.log(`📊 Generando Excel para cotización #${id}`)

    // Obtener datos de la cotización
    const quotes = await query(
      `SELECT q.*, c.name as client_name, c.email as client_email, 
              c.phone as client_phone, c.address as client_address,
              c.city
       FROM quotes q
       LEFT JOIN clients c ON q.client_id = c.id
       WHERE q.id = ?`,
      [id]
    )

    if (quotes.length === 0) {
      return res.status(404).json({ message: 'Cotización no encontrada' })
    }

    const quote = quotes[0]
    console.log(`✓ Cotización encontrada: ${quote.client_name}`)

    // Obtener items de la cotización
    const items = await query(
      `SELECT qi.*, p.name as product_name 
       FROM quote_items qi
       LEFT JOIN products p ON qi.product_id = p.id
       WHERE qi.quote_id = ?`,
      [id]
    )
    console.log(`✓ Items encontrados: ${items.length}`)
    console.log('📦 Items data:', JSON.stringify(items, null, 2))

    // Calcular totales
    const subtotal = items.reduce((sum, item) => {
      const cantidad = parseFloat(item.quantity) || 0
      const unit = parseFloat(item.unit_price ?? item.price) || 0
      const totalItem = parseFloat(item.total_price ?? item.total) || (cantidad * unit)
      return sum + totalItem
    }, 0)
    const iva = subtotal * 0.19
    const total = subtotal + iva
    console.log(`✓ Totales: Subtotal=$${subtotal}, IVA=$${iva}, Total=$${total}`)

    // Crear workbook - leer template si existe
    const workbook = new ExcelJS.Workbook()
    let worksheet
    let useTemplate = false

    if (fs.existsSync(TEMPLATE_PATH)) {
      console.log('📄 Usando template personalizado')
      await workbook.xlsx.readFile(TEMPLATE_PATH)
      // Evitar rangos con nombre que se corrompan al guardar
      if (workbook.definedNames && workbook.definedNames.model && Array.isArray(workbook.definedNames.model.names)) {
        workbook.definedNames.model.names = []
      }
      worksheet = workbook.getWorksheet(1) || workbook.worksheets[0]
      
      // VERIFICAR imágenes
      const images = worksheet.getImages()
      console.log(`🖼️ Imágenes en template: ${images.length}`)
      images.forEach((img, idx) => {
        console.log(`   Imagen ${idx + 1}: Filas ${img.range.tl.row}-${img.range.br.row}, Columnas ${img.range.tl.col}-${img.range.br.col}`)
      })
      
      useTemplate = true
    } else {
      console.log('📄 Creando formato por defecto (no hay template)')
      worksheet = workbook.addWorksheet('Cotización')
    }

    if (useTemplate) {
      // ===== REEMPLAZAR PLACEHOLDERS EN TEMPLATE =====
      const replacements = {
        '{{cliente}}': quote.client_name || '',
        '{{email}}': quote.client_email || '',
        '{{telefono}}': quote.client_phone || '',
        '{{direccion}}': quote.client_address || '',
        '{{ciudad}}': quote.city || '',
        '{{fecha}}': new Date(quote.created_at).toLocaleDateString('es-CO'),
        '{{numero}}': `RV${String(quote.id).padStart(3, '0')}`,
        '{{numero_cotizacion}}': `RV${String(quote.id).padStart(3, '0')}`,
        '{{no}}': `RV${String(quote.id).padStart(3, '0')}`,
        '{{No}}': `RV${String(quote.id).padStart(3, '0')}`,
        '{{subtotal}}': subtotal,
        '{{iva}}': iva,
        '{{total}}': total,
        '{{SUBTOTAL}}': subtotal,
        '{{IVA}}': iva,
        '{{TOTAL}}': total
      }

      let itemsRowStart = null
      let itemsColumnStart = null
      let itemTemplateStyles = {}
      let headerRowDetected = null

      const getCellText = (cell) => {
        if (!cell) return ''
        const v = cell.value
        if (v === undefined || v === null) return ''
        if (typeof v === 'string') return v
        if (typeof v === 'number') return v.toString()
        if (typeof v === 'object') {
          if (v.richText && Array.isArray(v.richText)) {
            return v.richText.map(r => r.text || '').join('')
          }
          if (v.text) return v.text
        }
        return ''
      }

      // Primer pase: detectar {{items}} ANTES de reemplazar otros placeholders
      worksheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
        row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
          const cellText = getCellText(cell)
          if (!cellText || !cellText.includes('{{items}}')) return
          
          itemsRowStart = rowNumber
          itemsColumnStart = colNumber
          // Guardar estilos base de TODA la fila para reutilizar luego
          row.eachCell({ includeEmpty: true }, (c, cIdx) => {
            // Copiar profundamente todos los estilos
            itemTemplateStyles[cIdx] = JSON.parse(JSON.stringify(c.style || {}))
          })
          console.log(`📍 Placeholder {{items}} encontrado en fila ${rowNumber}, columna ${String.fromCharCode(64 + colNumber)} (${colNumber})`)
          console.log(`   Estilos guardados para ${Object.keys(itemTemplateStyles).length} celdas`)
        })
      })

      // Segundo pase: detectar encabezados si no hay {{items}}
      if (!itemsRowStart) {
        worksheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
          row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
            const cellText = getCellText(cell).toUpperCase().replace(/\s+/g, '')
            if (!headerRowDetected && (cellText.includes('ITEM') || cellText.includes('ÍTEM'))) {
              headerRowDetected = rowNumber
              console.log(`📍 Encabezado de items detectado en fila ${rowNumber}`)
            }
          })
        })
      }

      // Tercer pase: reemplazar todos los placeholders (excepto {{items}})
      worksheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
        row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
          let cellText = getCellText(cell)
          if (!cellText) return

          Object.keys(replacements).forEach(placeholder => {
            if (cellText.includes(placeholder)) {
              const replacement = replacements[placeholder]
              if (typeof replacement === 'number') {
                cell.value = replacement
                cell.numFmt = '$#.##0'
              } else {
                cellText = cellText.replace(placeholder, replacement)
                cell.value = cellText
              }
              console.log(`✓ Reemplazado ${placeholder} en ${cell.address}`)
            }
          })
        })
      })

      // Cuarto pase: Limpiar cualquier placeholder, fórmula o error que cause #¡VALOR!
      worksheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
        row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
          // Si la celda tiene error, limpiarla
          if (cell.value && typeof cell.value === 'object' && cell.value.error) {
            cell.value = ''
            console.log(`⚠️ Error ${cell.value.error} eliminado en ${cell.address}`)
            return
          }
          
          let cellText = getCellText(cell)
          if (!cellText) return
          
          // Si hay {{...}} sin reemplazar, eliminarlos
          const placeholderRegex = /\{\{[^}]+\}\}/g
          if (placeholderRegex.test(cellText)) {
            const cleaned = cellText.replace(placeholderRegex, '')
            cell.value = cleaned || '' // Dejar vacío si solo había placeholder
            console.log(`⚠️ Placeholder sin mapear eliminado en ${cell.address}: ${cellText}`)
          }
          
          // Si la celda tiene una fórmula que referencia placeholders, eliminarla
          if (cell.formula && cell.formula.includes('{{')) {
            cell.value = ''
            delete cell.formula
            console.log(`⚠️ Fórmula con placeholder eliminada en ${cell.address}`)
          }
        })
      })

      if (!itemsRowStart && headerRowDetected) {
        itemsRowStart = headerRowDetected + 1
        const baseRow = worksheet.getRow(itemsRowStart)
        baseRow.eachCell({ includeEmpty: true }, (c, cIdx) => {
          itemTemplateStyles[cIdx] = { ...c.style }
        })
        console.log(`ℹ️ Usando fila ${itemsRowStart} bajo el encabezado para insertar items`)
      }

      if (itemsRowStart) {
        console.log(`📦 Insertando ${items.length} items desde fila ${itemsRowStart}`)

        const baseRow = worksheet.getRow(itemsRowStart)
        const baseHeight = baseRow.height || 25

        // USAR columna detectada en el primer pase
        let itemsColumnNumber = itemsColumnStart || 2
        console.log(`🔍 Usando columna detectada: ${String.fromCharCode(64 + itemsColumnNumber)} (número ${itemsColumnNumber})`)
        
        // CALCULAR: Posiciones de columnas basadas en {{items}}
        // Si {{items}} está en col C (3), el layout es: C=ITEM, D=CARACTERÍSTICA, E=MARCA, F=REFERENCIA, G=UNIDAD, H=CANTIDAD, I=UNITARIO, J=TOTAL
        const itemCol = itemsColumnNumber         // C = ITEM (número de ítem)
        const descCol = itemsColumnNumber + 1     // D = CARACTERÍSTICA (nombre producto)
        const marcaCol = itemsColumnNumber + 2    // E = MARCA
        const refCol = itemsColumnNumber + 3      // F = REFERENCIA
        const unidadCol = itemsColumnNumber + 4   // G = UNIDAD
        const cantCol = itemsColumnNumber + 5     // H = CANTIDAD
        const unitCol = itemsColumnNumber + 6     // I = VALOR UNITARIO
        const totalCol = itemsColumnNumber + 7    // J = VALOR TOTAL
        
        console.log(`📊 Mapeando columnas: ITEM=${String.fromCharCode(64+itemCol)}, DESC=${String.fromCharCode(64+descCol)}, MARCA=${String.fromCharCode(64+marcaCol)}, REF=${String.fromCharCode(64+refCol)}, UNIDAD=${String.fromCharCode(64+unidadCol)}, CANT=${String.fromCharCode(64+cantCol)}, UNIT=${String.fromCharCode(64+unitCol)}, TOTAL=${String.fromCharCode(64+totalCol)}`)
        
        // FUNCIÓN: Clonar celda con TODOS sus estilos
        const cloneCellStyle = (sourceCell, targetCell) => {
          if (sourceCell.numFmt) targetCell.numFmt = sourceCell.numFmt
          if (sourceCell.font) targetCell.font = { ...sourceCell.font }
          if (sourceCell.fill) targetCell.fill = { ...sourceCell.fill }
          if (sourceCell.border) targetCell.border = { ...sourceCell.border }
          if (sourceCell.alignment) targetCell.alignment = { ...sourceCell.alignment }
          if (sourceCell.protection) targetCell.protection = { ...sourceCell.protection }
        }

        // GUARDAR estilos originales de la fila base para clonar perfectamente
        const baseRowStyles = {}
        for (let col = 1; col <= 20; col++) {
          const cell = baseRow.getCell(col)
          baseRowStyles[col] = {
            numFmt: cell.numFmt,
            font: cell.font ? { ...cell.font } : null,
            fill: cell.fill ? { ...cell.fill } : null,
            border: cell.border ? { ...cell.border } : null,
            alignment: cell.alignment ? { ...cell.alignment } : null,
            protection: cell.protection ? { ...cell.protection } : null
          }
        }
        
        // LLENAR primer item (conservando estilos)
        const item0 = items[0]
        const desc0 = item0.product_name || item0.description || 'Producto'
        const cant0 = parseFloat(item0.quantity) || 0
        const unit0 = parseFloat(item0.unit_price ?? item0.price) || 0
        const total0 = cant0 * unit0

        baseRow.getCell(itemCol).value = 1
        baseRow.getCell(descCol).value = desc0
        baseRow.getCell(marcaCol).value = ''
        baseRow.getCell(refCol).value = ''
        baseRow.getCell(unidadCol).value = ''
        baseRow.getCell(cantCol).value = cant0
        baseRow.getCell(unitCol).value = unit0
        baseRow.getCell(totalCol).value = total0

        console.log(`  ✓ Item 1: ${desc0}`)

        // ITEMS ADICIONALES: NO usar spliceRows (destruye imágenes)
        // En su lugar, trabajar directamente con las filas
        for (let i = 1; i < items.length; i++) {
          const item = items[i]
          const desc = item.product_name || item.description || 'Producto'
          const cant = parseFloat(item.quantity) || 0
          const unit = parseFloat(item.unit_price ?? item.price) || 0
          const total = cant * unit

          const newRowNum = itemsRowStart + i
          const newRow = worksheet.getRow(newRowNum)
          newRow.height = baseHeight
          
          // COPIAR estilos de la fila base (sin spliceRows)
          for (let col = 1; col <= 20; col++) {
            const sourceCell = baseRow.getCell(col)
            const targetCell = newRow.getCell(col)
            
            // Copiar estilos
            if (sourceCell.numFmt) targetCell.numFmt = sourceCell.numFmt
            if (sourceCell.font) targetCell.font = JSON.parse(JSON.stringify(sourceCell.font))
            if (sourceCell.fill) targetCell.fill = JSON.parse(JSON.stringify(sourceCell.fill))
            if (sourceCell.border) targetCell.border = JSON.parse(JSON.stringify(sourceCell.border))
            if (sourceCell.alignment) targetCell.alignment = JSON.parse(JSON.stringify(sourceCell.alignment))
            if (sourceCell.protection) targetCell.protection = JSON.parse(JSON.stringify(sourceCell.protection))
          }

          // LLENAR con datos del producto
          newRow.getCell(itemCol).value = i + 1
          newRow.getCell(descCol).value = desc
          newRow.getCell(marcaCol).value = ''
          newRow.getCell(refCol).value = ''
          newRow.getCell(unidadCol).value = ''
          newRow.getCell(cantCol).value = cant
          newRow.getCell(unitCol).value = unit
          newRow.getCell(totalCol).value = total

          console.log(`  ✓ Item ${i + 1}: ${desc}`)
        }

        console.log(`✅ Se llenaron ${items.length} productos correctamente`)
      } else {
        console.warn('⚠️ CRÍTICO: No se encontró {{items}} en el template')
      }
    } else {
      // ===== CREAR FORMATO POR DEFECTO =====
      worksheet.columns = [
        { width: 3 }, { width: 15 }, { width: 30 }, { width: 15 },
        { width: 15 }, { width: 15 }, { width: 15 }, { width: 15 }
      ]

      worksheet.mergeCells('B2:D4')
      const headerCell = worksheet.getCell('B2')
      headerCell.value = 'CLICK SOLUCIONES S.A.S'
      headerCell.font = { name: 'Calibri', size: 18, bold: true, color: { argb: 'FF0066CC' } }
      headerCell.alignment = { horizontal: 'center', vertical: 'middle' }

      worksheet.mergeCells('F2:H3')
      const numCell = worksheet.getCell('F2')
      numCell.value = `COTIZACIÓN\nRV${String(quote.id).padStart(3, '0')}`
      numCell.font = { name: 'Calibri', size: 14, bold: true }
      numCell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }
      numCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8F4F8' } }

      let row = 6
      worksheet.getCell(`B${row}`).value = 'Cliente:'
      worksheet.getCell(`B${row}`).font = { bold: true }
      worksheet.getCell(`C${row}`).value = quote.client_name || ''
      
      row++
      worksheet.getCell(`B${row}`).value = 'Email:'
      worksheet.getCell(`B${row}`).font = { bold: true }
      worksheet.getCell(`C${row}`).value = quote.client_email || ''
      
      row++
      worksheet.getCell(`B${row}`).value = 'Teléfono:'
      worksheet.getCell(`B${row}`).font = { bold: true }
      worksheet.getCell(`C${row}`).value = quote.client_phone || ''
      
      row++
      worksheet.getCell(`B${row}`).value = 'Dirección:'
      worksheet.getCell(`B${row}`).font = { bold: true }
      worksheet.mergeCells(`C${row}:F${row}`)
      worksheet.getCell(`C${row}`).value = quote.client_address || ''
      
      row++
      worksheet.getCell(`B${row}`).value = 'Ciudad:'
      worksheet.getCell(`B${row}`).font = { bold: true }
      worksheet.getCell(`C${row}`).value = quote.city || ''
      
      row++
      worksheet.getCell(`B${row}`).value = 'Fecha:'
      worksheet.getCell(`B${row}`).font = { bold: true }
      worksheet.getCell(`C${row}`).value = new Date(quote.created_at).toLocaleDateString('es-CO')

      row += 2
      const headerRow = row
      const headers = ['#', 'DESCRIPCIÓN', 'CANTIDAD', 'V. UNITARIO', 'V. TOTAL']
      const columns = ['B', 'C', 'E', 'F', 'G']
      
      columns.forEach((col, idx) => {
        const cell = worksheet.getCell(`${col}${headerRow}`)
        cell.value = headers[idx]
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' } }
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0066CC' } }
        cell.alignment = { horizontal: 'center', vertical: 'middle' }
        cell.border = {
          top: { style: 'thin' }, bottom: { style: 'thin' },
          left: { style: 'thin' }, right: { style: 'thin' }
        }
      })

      row++
      items.forEach((item, index) => {
        worksheet.getCell(`B${row}`).value = index + 1
        worksheet.getCell(`B${row}`).alignment = { horizontal: 'center' }
        
        const descripcion = item.product_name || item.description || 'Producto'
        worksheet.getCell(`C${row}`).value = descripcion
        worksheet.mergeCells(`C${row}:D${row}`)
        
        const cantidad = parseFloat(item.quantity) || 0
        worksheet.getCell(`E${row}`).value = cantidad
        worksheet.getCell(`E${row}`).alignment = { horizontal: 'center' }
        
        const precioUnitario = parseFloat(item.unit_price) || 0
        worksheet.getCell(`F${row}`).value = precioUnitario
        worksheet.getCell(`F${row}`).numFmt = '$#.##0'
        worksheet.getCell(`F${row}`).alignment = { horizontal: 'right' }
        
        const precioTotal = parseFloat(item.total_price) || (cantidad * precioUnitario)
        worksheet.getCell(`G${row}`).value = precioTotal
        worksheet.getCell(`G${row}`).numFmt = '$#.##0'
        worksheet.getCell(`G${row}`).alignment = { horizontal: 'right' }
        
        console.log(`Item ${index + 1}: ${descripcion} - $${precioTotal}`)
        
        ;['B', 'C', 'E', 'F', 'G'].forEach(col => {
          worksheet.getCell(`${col}${row}`).border = {
            top: { style: 'thin' }, bottom: { style: 'thin' },
            left: { style: 'thin' }, right: { style: 'thin' }
          }
        })
        
        row++
      })

      row += 2
      worksheet.getCell(`E${row}`).value = 'SUBTOTAL:'
      worksheet.getCell(`E${row}`).font = { bold: true }
      worksheet.getCell(`E${row}`).alignment = { horizontal: 'right' }
      worksheet.getCell(`G${row}`).value = subtotal
      worksheet.getCell(`G${row}`).numFmt = '$#.##0'
      worksheet.getCell(`G${row}`).font = { bold: true }
      worksheet.getCell(`G${row}`).alignment = { horizontal: 'right' }
      worksheet.getCell(`G${row}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8F4F8' } }
      
      row++
      worksheet.getCell(`E${row}`).value = 'IVA (19%):'
      worksheet.getCell(`E${row}`).font = { bold: true }
      worksheet.getCell(`E${row}`).alignment = { horizontal: 'right' }
      worksheet.getCell(`G${row}`).value = iva
      worksheet.getCell(`G${row}`).numFmt = '$#.##0'
      worksheet.getCell(`G${row}`).font = { bold: true }
      worksheet.getCell(`G${row}`).alignment = { horizontal: 'right' }
      worksheet.getCell(`G${row}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8F4F8' } }
      
      row++
      worksheet.getCell(`E${row}`).value = 'TOTAL:'
      worksheet.getCell(`E${row}`).font = { bold: true, size: 12 }
      worksheet.getCell(`E${row}`).alignment = { horizontal: 'right' }
      worksheet.getCell(`G${row}`).value = total
      worksheet.getCell(`G${row}`).numFmt = '$#.##0'
      worksheet.getCell(`G${row}`).font = { bold: true, size: 12, color: { argb: 'FF0066CC' } }
      worksheet.getCell(`G${row}`).alignment = { horizontal: 'right' }
      worksheet.getCell(`G${row}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9EEF7' } }
    }

    // Guardar y descargar
    const filename = `Cotizacion_RV${String(quote.id).padStart(3, '0')}_${Date.now()}.xlsx`
    const filepath = path.join(__dirname, `../../uploads/${filename}`)
    
    // VERIFICAR imágenes antes de guardar
    if (useTemplate) {
      const finalImages = worksheet.getImages()
      console.log(`🖼️ Imágenes antes de guardar: ${finalImages.length}`)
    }
    
    console.log(`💾 Guardando archivo: ${filename}`)
    await workbook.xlsx.writeFile(filepath)
    console.log(`✓ Excel generado correctamente`)

    res.download(filepath, filename, (err) => {
      if (err) {
        console.error('❌ Error descargando archivo:', err)
      } else {
        console.log('✓ Archivo descargado exitosamente')
      }
    })
  } catch (error) {
    console.error('❌ Error generando Excel:', error)
    res.status(500).json({ message: 'Error generando cotización', error: error.message })
  }
}

export const downloadQuoteTemplate = async (req, res) => {
  try {
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

    // Header
    worksheet.mergeCells('C1:E3')
    const headerCell = worksheet.getCell('C1')
    headerCell.value = 'CLICK SOLUCIONES S.A.S'
    headerCell.font = { name: 'Arial', size: 16, bold: true, color: { argb: 'FF00B4E5' } }
    headerCell.alignment = { horizontal: 'center', vertical: 'center', wrapText: true }

    worksheet.mergeCells('C4:E6')
    const infoCell = worksheet.getCell('C4')
    infoCell.value = 'NIT: 900.428.369-5\nCRA 15 - 78-02 OFICINA 306\nWWW.CLICKSOLUUSAS.COM.CO'
    infoCell.font = { name: 'Arial', size: 9 }
    infoCell.alignment = { horizontal: 'center', vertical: 'top', wrapText: true }

    worksheet.mergeCells('G1:I2')
    const titleCell = worksheet.getCell('G1')
    titleCell.value = 'COTIZACIÓN'
    titleCell.font = { name: 'Arial', size: 14, bold: true, color: { argb: 'FFFFFFFF' } }
    titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0E1B25' } }
    titleCell.alignment = { horizontal: 'center', vertical: 'center' }

    worksheet.mergeCells('G3:I3')
    const numCell = worksheet.getCell('G3')
    numCell.value = 'RV__'
    numCell.font = { name: 'Arial', size: 11, bold: true }
    numCell.alignment = { horizontal: 'center', vertical: 'center' }
    numCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0F7FF' } }

    // Cliente info
    const clientLabels = ['SEÑORES:', 'ATENCIÓN:', 'DIRECCIÓN:', 'TELÉFONO:', 'EMAIL:', 'FECHA:']
    for (let i = 0; i < clientLabels.length; i++) {
      const row = 8 + i
      const labelCell = worksheet.getCell(`B${row}`)
      labelCell.value = clientLabels[i]
      labelCell.font = { bold: true, size: 9 }

      const valueCell = worksheet.getCell(`C${row}`)
      valueCell.border = { bottom: { style: 'thin' } }
    }

    // Tabla items
    const headerRow = 15
    const headers = ['ITEM', 'CARACTERÍSTICA', 'MARCA', 'REFERENCIA', 'UNIDAD', 'CANTIDAD', 'VALOR UNITARIO', 'VALOR TOTAL']
    for (let i = 0; i < headers.length; i++) {
      const cell = worksheet.getCell(headerRow, i + 2)
      cell.value = headers[i]
      cell.font = { name: 'Arial', size: 9, bold: true, color: { argb: 'FFFFFFFF' } }
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0E1B25' } }
      cell.alignment = { horizontal: 'center', vertical: 'center', wrapText: true }
      cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
    }

    // Filas vacías
    for (let i = 0; i < 10; i++) {
      const rowNum = headerRow + 1 + i
      for (let col = 2; col <= 9; col++) {
        const cell = worksheet.getCell(rowNum, col)
        cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }
      }
    }

    const filename = `Cotizacion_Template_${Date.now()}.xlsx`
    const filepath = path.join(__dirname, `../../uploads/${filename}`)

    await workbook.xlsx.writeFile(filepath)
    res.download(filepath, filename)
  } catch (error) {
    console.error('Error descargando template:', error)
    res.status(500).json({ message: 'Error descargando template', error: error.message })
  }
}
