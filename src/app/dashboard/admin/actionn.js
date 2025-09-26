"use server";
import pool from '@/lib/db'

export async function POST(req, res) {
    const connection = await pool();
    const pen = 'confirmed';
    const { username, room, seat, date_in, date_out, peroid_time } = await req.json();
    const [result] = await connection.query('INSERT INTO stud_reserv (username, room, seat, date_in, date_out, peroid_time, status) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())', [username, room, seat, date_in, date_out,peroid_time , pen]);
    res.status(201).json({ id: result.insertId, username, room, seat, date_in, date_out,peroid_time , pen });
}