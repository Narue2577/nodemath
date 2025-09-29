import pool2 from '@/lib/db2';
import bcrypt from "bcryptjs"


// utils/database.ts or wherever you handle DB

/* eslint-disable */
async function getUserFromDatabase2(email: string, password: string) {
  try {
    const [rows] = await pool2.execute(
      'SELECT stu_buasri FROM tasks',
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

export { getUserFromDatabase2 }