import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');
  const action = searchParams.get('action'); // 'confirm' or 'reject'

  if (!token || !action) {
    return new Response(
      `<html><body><h1>Invalid request</h1></body></html>`,
      { headers: { 'Content-Type': 'text/html' } }
    );
  }

  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    // Check if reservation exists and is pending
    const [reservations] = await connection.execute(
      'SELECT * FROM nodelogin.stud_reserv WHERE approval_token = ? AND status = "pending"',
      [token]
    );

    if ((reservations as any[]).length === 0) {
      await connection.end();
      return new Response(
        `<html>
          <body style="font-family: Arial; text-align: center; padding: 50px;">
            <h1 style="color: #ff9800;">⚠️ Already Processed</h1>
            <p>This reservation has already been confirmed or rejected.</p>
          </body>
        </html>`,
        { headers: { 'Content-Type': 'text/html' } }
      );
    }

    const reservation = (reservations as any[])[0];
    const newStatus = action === 'confirm' ? 'occupied' : 'rejected';

    // Update status
    await connection.execute(
      'UPDATE nodelogin.stud_reserv SET status = ?, admin = ?,  updated_at = NOW() WHERE approval_token = ?',
      [newStatus,'o', token]
    );

    await connection.end();

    // Return success page
    const isConfirmed = action === 'confirm';
    return new Response(
      `<html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${isConfirmed ? 'Confirmed' : 'Rejected'}</title>
        </head>
        <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px; background-color: #f5f5f5;">
          <div style="background: white; padding: 40px; border-radius: 10px; max-width: 500px; margin: 0 auto; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h1 style="color: ${isConfirmed ? '#4CAF50' : '#f44336'}; margin-bottom: 20px;">
              ${isConfirmed ? '✓ Confirmed!' : '✗ Rejected'}
            </h1>
            <p style="font-size: 18px; margin-bottom: 30px;">
              The reservation has been successfully ${isConfirmed ? 'confirmed' : 'rejected'}.
            </p>
            <div style="background: #f9f9f9; padding: 20px; border-radius: 5px; text-align: left;">
              <p><strong>Student:</strong> ${reservation.username}</p>
              <p><strong>Room:</strong> ${reservation.room}</p>
              <p><strong>Seat:</strong> ${reservation.seat}</p>
              <p><strong>Status:</strong> <span style="color: ${isConfirmed ? '#4CAF50' : '#f44336'};">${newStatus}</span></p>
            </div>
            <p style="margin-top: 30px; color: #666;">You can close this window now.</p>
          </div>
        </body>
      </html>`,
      { headers: { 'Content-Type': 'text/html' } }
    );

  } catch (err) {
    console.error('Approval error:', err);
    if (connection) await connection.end();
    return new Response(
      `<html><body><h1>Error processing request</h1></body></html>`,
      { headers: { 'Content-Type': 'text/html' } }
    );
  }
}