import ExcelJS from 'exceljs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const TEMPLATE_PATH = path.join(__dirname, 'uploads/template.xlsx')

const diagnoseTemplate = async () => {
  try {
    const workbook = new ExcelJS.Workbook()
    await workbook.xlsx.readFile(TEMPLATE_PATH)
    
    const worksheet = workbook.getWorksheet(1)
    console.log('📄 Analizando template...\n')

    let foundItems = false
    let foundHeader = false

    worksheet.eachRow((row, rowNumber) => {
      row.eachCell((cell, colNumber) => {
        const value = cell.value ? cell.value.toString() : ''
        
        if (value.includes('{{items}}')) {
          console.log(`✅ Encontrado {{items}} en:`)
          console.log(`   Fila: ${rowNumber}`)
          console.log(`   Columna: ${cell.address}`)
          console.log(`   Valor: "${value}"`)
          foundItems = true
        }
        
        if (value.toUpperCase().includes('ITEM') && 
            (value.toUpperCase().includes('CARACTERÍSTICA') || colNumber === 2)) {
          console.log(`✅ Posible encabezado de tabla en fila ${rowNumber}`)
          console.log(`   Celda: ${cell.address}`)
          console.log(`   Valor: "${value}"`)
          foundHeader = true
        }
      })
    })

    console.log('\n═══════════════════════════════════')
    if (!foundItems && !foundHeader) {
      console.log('❌ PROBLEMA: No se encontró {{items}} ni encabezado')
      console.log('   El template NO está configurado correctamente')
    } else if (foundItems) {
      console.log('✅ Template está correcto (tiene {{items}})')
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

diagnoseTemplate()
