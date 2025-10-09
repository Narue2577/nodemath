// pages/api/login.ts
import { NextApiRequest, NextApiResponse } from 'next';
import mysql from 'mysql2/promise';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { role, input } = req.body;

  try {
    // เชื่อมต่อกับฐานข้อมูล
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'Ertnom35!',
      database: 'cosci_system'
    });

    let tableName, columnName;
    if (role === 'student') {
      tableName = 'student'; // ชื่อตารางสำหรับนักเรียน
      columnName = 'stu_buasri'; // คอลัมน์ที่ใช้ตรวจสอบ
    } else if (role === 'teacher') {
      tableName = 'staff'; // ชื่อตารางสำหรับครู
      columnName = 'staff_buasri'; // คอลัมน์ที่ใช้ตรวจสอบ
    } else {
      await connection.end();
      return res.status(400).json({ error: 'Invalid role' });
    }

    // คิวรีเพื่อตรวจสอบว่าข้อมูลมีอยู่ในฐานข้อมูลหรือไม่
    const [rows] = await connection.execute(
       `SELECT ${columnName} FROM ${tableName} WHERE ${columnName} = ?`,
      [input]
    );

    await connection.end();

    if (Array.isArray(rows) && rows.length > 0) {
      // หากพบข้อมูลในฐานข้อมูล
      return res.status(200).json({ exists: true });
    } else {
      // หากไม่พบข้อมูลในฐานข้อมูล
      return res.status(200).json({ exists: false });
    }
  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}