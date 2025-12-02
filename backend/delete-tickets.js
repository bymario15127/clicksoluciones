import { query } from './src/config/database.js'

async function deleteTickets() {
  try {
    // Primero eliminar los comentarios de los tickets
    await query('DELETE FROM ticket_comments WHERE ticket_id IN (1, 2)')
    console.log('Comentarios de tickets #1 y #2 eliminados')
    
    // Luego eliminar los tickets
    await query('DELETE FROM tickets WHERE id IN (1, 2)')
    console.log('Tickets #1 y #2 eliminados exitosamente')
    process.exit(0)
  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  }
}

deleteTickets()
