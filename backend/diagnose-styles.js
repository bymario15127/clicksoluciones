import ExcelJS from 'exceljs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function diagnoseStyles() {
  const templatePath = path.join(__dirname, 'uploads', 'template.xlsx')
  
  console.log('📄 Analizando estilos del template...\n')
  
  const workbook = new ExcelJS.Workbook()
  await workbook.xlsx.readFile(templatePath)
  const worksheet = workbook.worksheets[0]
  
  // Buscar fila con {{items}}
  let itemsRow = null
  worksheet.eachRow((row, rowNumber) => {
    row.eachCell((cell) => {
      if (cell.value && String(cell.value).includes('{{items}}')) {
        itemsRow = rowNumber
      }
    })
  })
  
  if (!itemsRow) {
    console.log('❌ No se encontró {{items}} en el template')
    return
  }
  
  console.log(`✓ {{items}} encontrado en fila ${itemsRow}\n`)
  
  const row = worksheet.getRow(itemsRow)
  console.log(`Altura de fila: ${row.height || 'default'}\n`)
  
  // Analizar columnas C-J (3-10)
  for (let col = 3; col <= 10; col++) {
    const cell = row.getCell(col)
    const colLetter = String.fromCharCode(64 + col)
    
    console.log(`\n📍 Columna ${colLetter} (${col}):`)
    console.log(`   Valor: ${cell.value || '(vacío)'}`)
    console.log(`   Font: ${JSON.stringify(cell.font, null, 2)}`)
    console.log(`   Fill: ${JSON.stringify(cell.fill, null, 2)}`)
    console.log(`   Border: ${JSON.stringify(cell.border, null, 2)}`)
    console.log(`   Alignment: ${JSON.stringify(cell.alignment, null, 2)}`)
    console.log(`   NumFmt: ${cell.numFmt || 'ninguno'}`)
  }
}

diagnoseStyles().catch(console.error)
