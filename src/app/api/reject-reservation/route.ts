import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import mysql from 'mysql2/promise';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });


export async function POST(request: NextRequest) {
  try {
    const { token, reason } = await request.json();

    // Connect to database
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    // Get reservation details
    const [reservations] = await connection.execute(
      'SELECT * FROM nodelogin.bookingsTest WHERE approval_token = ? LIMIT 1',
      [token]
    );

    if ((reservations as any[]).length === 0) {
      await connection.end();
      return NextResponse.json({ error: 'Reservation not found' }, { status: 404 });
    }

    const reservation = (reservations as any[])[0];

    // Update status to rejected
    await connection.execute(
      'UPDATE nodelogin.bookingsTest SET status = ?, remark = ? WHERE approval_token = ?',
      ['rejected', reason, token]
    );

    // Get all seats for this booking
    const [allSeats] = await connection.execute(
      'SELECT seat FROM nodelogin.bookingsTest WHERE approval_token = ?',
      [token]
    );
    const seats = (allSeats as any[]).map(s => s.seat).join(', ');

    await connection.end();

    // Send rejection email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: "naruesorn@g.swu.ac.th",
      replyTo: 'naruesorn@g.swu.ac.th',
      subject: `ปฏิเสธการจองห้อง ${reservation.room}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #f44336; color: white; padding: 20px; text-align: center;">
            <h2>การจองถูกปฏิเสธ</h2>
          </div>
          
          <div style="padding: 30px; background-color: white;">
            <p>เรียน ผู้จอง,</p>
            <p>ขออภัย การจองห้องของคุณถูกปฏิเสธ</p>
            
            <div style="background-color: #f5f5f5; padding: 15px; margin: 20px 0;">
              <p><strong>ห้อง:</strong> ${reservation.room}</p>
              <p><strong>ที่นั่ง:</strong> ${seats}</p>
            </div>
            
            ${reason ? `
            <div style="background-color: #fff3cd; padding: 15px; margin: 20px 0;">
              <p><strong>เหตุผล:</strong></p>
              <p>${reason}</p>
            </div>
            ` : ''}
            
            <p>ขอแสดงความนับถือ,<br/>ทีมจัดการห้อง</p>
          </div>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to reject' }, { status: 500 });
  }
}