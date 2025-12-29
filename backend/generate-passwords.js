import bcrypt from 'bcrypt'

// Función para hashear contraseña
async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10)
  const hashedPassword = await bcrypt.hash(password, salt)
  return hashedPassword
}

// Generar contraseñas para los usuarios
async function generatePasswords() {
  const passwords = {
    admin123: await hashPassword('admin123'),
    tech123: await hashPassword('tech123'),
    sales123: await hashPassword('sales123')
  }
  
  console.log('=== CONTRASEÑAS HASHEADAS PARA INSERTAR EN LA BD ===\n')
  console.log(`Admin (admin123):`)
  console.log(`  ${passwords.admin123}\n`)
  
  console.log(`Technician (tech123):`)
  console.log(`  ${passwords.tech123}\n`)
  
  console.log(`Sales (sales123):`)
  console.log(`  ${passwords.sales123}\n`)
  
  console.log('\n=== COPIAR Y PEGAR EN MySQL Workbench ===\n')
  console.log(`UPDATE users SET password = '${passwords.admin123}' WHERE id = 1;`)
  console.log(`UPDATE users SET password = '${passwords.tech123}' WHERE id = 2;`)
  console.log(`UPDATE users SET password = '${passwords.sales123}' WHERE id = 3;`)
}

generatePasswords().catch(console.error)
