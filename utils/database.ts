import pool from '@/lib/db';
import bcrypt from "bcryptjs"


// utils/database.ts or wherever you handle DB


async function getUserFromDatabase(email: string, password: string) {
  try {
    const [rows] = await pool.execute(
      'SELECT id, full_name, email, password FROM tasks WHERE email = ?',
      [email]
    )
    
    const user = (rows as any[])[0]
    
    if (user && await bcrypt.compare(password, user.password)) {
      return {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        
      }
    }
    
    return null
  } catch (error) {
    console.error('Database error:', error)
    return null
  }
}

export { getUserFromDatabase }