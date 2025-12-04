//api/reservations/route.ts
import { getServerSession } from "next-auth" // 2 Dec 2025
//import { authOptions } from "@/app/api/auth/[...nextauth]/route"  // 2 Dec 2025
import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import crypto from 'crypto';
import { transporter } from '@/lib/email';


//const transporter2 = nodemailer.createTransport({
//  host: process.env.SMTP_HOST,
//  port: parseInt(process.env.SMTP_PORT || '587'),
//  secure: false,
//  auth: {
//    user: process.env.SMTP_USER,
//    pass: process.env.SMTP_PASS,
//  },
//});

// Common email sent to both roles
async function sendReservationConfirmationEmail(
  recipientEmail: string,
  username: any,
  room: any,
  seatDetails: any,
  confirmLink: any,
  rejectLink: any
 

) {
  const TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: recipientEmail,
    subject: 'ขออนุมัติจากผศ.ดร.ปรวัน แพทยานนท์',
     html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
      </head>
      <body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: Arial, sans-serif;">
        <div style="max-width: 600px; margin: 40px auto; background-color: white; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <div style="background: gray; padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">คำขออนุมัติการจองห้อง</h2>
          </div>
          
          <!-- Content -->
          <div style="padding: 30px;">
            <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
              เรียน <strong></strong> (ผู้อนุมัติรายการจองห้อง)
            </p>
            
            <p style="font-size: 15px; color: #555; line-height: 1.6;">
              <strong>${username}</strong> ได้ทำรายการจองห้องคอมพิวเตอร์ <strong>${room}</strong> 
              ของวิทยาลัยนวัตกรรมสื่อสารสังคม ผ่านทางเว็บไซต์
            </p>
            
            <p style="font-size: 15px; color: #555; line-height: 1.6;">
              ทั้งนี้ ใคร่ขอรบกวนให้ท่านตรวจสอบรายละเอียดการจอง และอนุมัติหรือไม่อนุมัติรายการจองดังกล่าว โดยกดปุ่มด้านล่าง
            </p>
            
            <!-- Booking Details Box -->
            <div style="background-color: #f8f9fa;  padding: 20px; margin: 25px 0; border-radius: 5px;">
              <h3 style="margin-top: 0; color: #667eea; font-size: 18px; margin-bottom: 15px;">รายละเอียดการจอง</h3>
              <ul style="list-style: none; padding: 0; margin: 0;">
                ${seatDetails}
              </ul>
              <p style="margin: 15px 0 0 0; color: #666; font-size: 14px;">
                <strong>วันที่ขอ:</strong> ${new Date().toLocaleString('th-TH')}
              </p>
            </div>
                  
            <!-- Confirm Button -->
            <div style="text-align: center; margin: 30px 0;">
              <a href="${confirmLink}" 
                 style="background-color: #4CAF50; 
                        color: white; 
                        padding: 15px 50px; 
                        text-decoration: none; 
                        border-radius: 8px; 
                        font-size: 18px;
                        font-weight: bold;
                        display: inline-block;
                        box-shadow: 0 4px 6px rgba(76, 175, 80, 0.3);">
                 อนุมัติ (CONFIRM)
              </a>
            </div>
            <!-- Reject Section  -->
            <div style="background-color: #fff3f3; border: 2px solid #f44336; border-radius: 8px; padding: 25px; margin-top: 30px;">
  <h3 style="color: #f44336; margin-top: 0; font-size: 18px; margin-bottom: 15px;">
    คำขอปฏิเสธ
  </h3>
  <p style="font-size: 14px; color: #666; margin-bottom: 15px;">
    หากต้องการปฏิเสธการจอง กรุณาตอบกลับอีเมลนี้พร้อมระบุเหตุผลของคุณ<br>
  </p>
  <div style="text-align: center; margin-top: 20px;">
    <a href="${rejectLink}" 
                   style="background-color: #f44336; 
                          color: white; 
                          padding: 14px 40px; 
                          text-decoration: none; 
                          border-radius: 8px; 
                          font-size: 16px; 
                          font-weight: bold; 
                          display: inline-block;
                          margin: 0 0 10px 0;
                          box-shadow: 0 4px 15px rgba(244, 67, 54, 0.4);">
                  ปฏิเสธการจอง (REJECT)
                </a>
  </div>
</div>
            
          </div>  
        </div>
      </body>
      </html>
    `
,
  };
  // Create timeout promise
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new Error('Email send timeout after 5 minutes'));
    }, TIMEOUT_MS);
  });
 /*try {
    // Race between sending email and timeout
    const info = await Promise.race([
      transporter.sendMail(mailOptions),
      timeoutPromise
    ]);

    // Success - update status to 'sent'
    await updateEmailStatus(emailId, 'sent', info.messageId);

    return {
      success: true,
      messageId: info.messageId,
      status: 'sent'
    };

  } catch (error: any) {
    // Timeout or error - update status to 'rejected'
    await updateEmailStatus(emailId, 'rejected', undefined, error.message);

    return {
      success: false,
      error: error.message,
      status: 'rejected'
    };
  }
} */ 
  await transporter.sendMail(mailOptions);
}

// Additional email ONLY for students
async function sendStudentPendingApprovalEmail(
  recipientEmail: string,
  username: any,
  room: any,
  seatDetails: any,
  confirmLink: any,
  rejectLink: any
) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: recipientEmail,
    subject: 'Reservation Pending Approval',
        html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
      </head>
      <body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: Arial, sans-serif;">
        <div style="max-width: 600px; margin: 40px auto; background-color: white; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <div style="background: gray; padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">คำขออนุมัติการจองห้อง</h2>
          </div>
          
          <!-- Content -->
          <div style="padding: 30px;">
            <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
              เรียน <strong></strong> (ผู้อนุมัติรายการจองห้อง)
            </p>
            
            <p style="font-size: 15px; color: #555; line-height: 1.6;">
              <strong>${username}</strong> ได้ทำรายการจองห้องคอมพิวเตอร์ <strong>${room}</strong> 
              ของวิทยาลัยนวัตกรรมสื่อสารสังคม ผ่านทางเว็บไซต์
            </p>
            
            <p style="font-size: 15px; color: #555; line-height: 1.6;">
              ทั้งนี้ ใคร่ขอรบกวนให้ท่านตรวจสอบรายละเอียดการจอง และอนุมัติหรือไม่อนุมัติรายการจองดังกล่าว โดยกดปุ่มด้านล่าง
            </p>
            
            <!-- Booking Details Box -->
            <div style="background-color: #f8f9fa;  padding: 20px; margin: 25px 0; border-radius: 5px;">
              <h3 style="margin-top: 0; color: #667eea; font-size: 18px; margin-bottom: 15px;">รายละเอียดการจอง</h3>
              <ul style="list-style: none; padding: 0; margin: 0;">
                ${seatDetails}
              </ul>
              <p style="margin: 15px 0 0 0; color: #666; font-size: 14px;">
                <strong>วันที่ขอ:</strong> ${new Date().toLocaleString('th-TH')}
              </p>
            </div>
                  
            <!-- Confirm Button -->
            <div style="text-align: center; margin: 30px 0;">
              <a href="${confirmLink}" 
                 style="background-color: #4CAF50; 
                        color: white; 
                        padding: 15px 50px; 
                        text-decoration: none; 
                        border-radius: 8px; 
                        font-size: 18px;
                        font-weight: bold;
                        display: inline-block;
                        box-shadow: 0 4px 6px rgba(76, 175, 80, 0.3);">
                 อนุมัติ (CONFIRM)
              </a>
            </div>
            <!-- Reject Section  -->
            <div style="background-color: #fff3f3; border: 2px solid #f44336; border-radius: 8px; padding: 25px; margin-top: 30px;">
  <h3 style="color: #f44336; margin-top: 0; font-size: 18px; margin-bottom: 15px;">
    คำขอปฏิเสธ
  </h3>
  <p style="font-size: 14px; color: #666; margin-bottom: 15px;">
    หากต้องการปฏิเสธการจอง กรุณาตอบกลับอีเมลนี้พร้อมระบุเหตุผลของคุณ<br>
  </p>
  <div style="text-align: center; margin-top: 20px;">
    <a href="${rejectLink}" 
                   style="background-color: #f44336; 
                          color: white; 
                          padding: 14px 40px; 
                          text-decoration: none; 
                          border-radius: 8px; 
                          font-size: 16px; 
                          font-weight: bold; 
                          display: inline-block;
                          margin: 0 0 10px 0;
                          box-shadow: 0 4px 15px rgba(244, 67, 54, 0.4);">
                  ปฏิเสธการจอง (REJECT)
                </a>
  </div>
</div>
            
          </div>  
        </div>
      </body>
      </html>
    `
,
  };

  await transporter.sendMail(mailOptions);
}

// Helper function to check and update expired reservations
/* eslint-disable */
async function updateExpiredReservations(connection: any) {
  try {
    console.log('\n=== Checking for expired reservations ===');
    console.log('Current time:', new Date().toISOString());
    
    // First, let's see what we're working with
    const [occupiedRows]: any = await connection.execute(`
  
  SELECT 
      id,
      username,
      room,
      seat,
      date_out,
      period_time,
      status,
      CONCAT(date_out, ' ', SUBSTRING_INDEX(period_time, '-', -1)) as end_datetime,
      NOW() as current_datetime,
      CONCAT(date_out, ' ', SUBSTRING_INDEX(period_time, '-', -1)) < NOW() as is_expired
    FROM nodelogin.bookingsTest
    WHERE (status = 'occupied' OR status = 'pending')
    LIMIT 5
  
`);
    
    console.log('Sample occupied reservations:', occupiedRows);
    
    // Count how many should be expired
    
    const [CountResult]: any = await connection.execute(`
      SELECT COUNT(*) as count
      FROM nodelogin.bookingsTest
      WHERE (status = 'occupied' OR status = 'pending')
      AND CONCAT(date_out, ' ', SUBSTRING_INDEX(period_time, '-', -1), ':00') < NOW()
    `);

    console.log('Reservations to expire:', CountResult[0].count);

    
    // ⭐ FIXED: Added ':00' for seconds to make proper datetime comparison
    // The issue was that period_time is '9:00-12:00' format (HH:MM)
    // But MySQL NOW() returns 'YYYY-MM-DD HH:MM:SS' format
    // So we need to add ':00' for seconds to match the format
     
    
    // Update STUDENT bookings (ADDED)
    const query = `
      UPDATE nodelogin.bookingsTest
      SET status = 'complete', updated_at = NOW()
      WHERE (status = 'occupied' OR status = 'pending')
      AND CONCAT(date_out, ' ', SUBSTRING_INDEX(period_time, '-', -1), ':00') < NOW()
    `;

       const [result]: any = await connection.execute(query);
    console.log('Update result - Rows affected:', result.affectedRows);
    console.log('=== Expiry check complete ===\n');

    return result.affectedRows;
  } catch (error) {
    console.error('Error in updateExpiredReservations:', error);
    return 0;
  }
}
/* eslint-enable */

// GET method with auto-update for expired reservations
export async function GET(request: Request) {
 const { searchParams } = new URL(request.url); // 18 Nov 2568
  const source = searchParams.get('source'); // 18 Nov 2568
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    // First, update any expired reservations
    const expiredCount = await updateExpiredReservations(connection);
    console.log(`GET: Updated ${expiredCount} expired reservations`);

   
    const selectQuery = `
      SELECT room, seat, status, major FROM nodelogin.bookingsTest
      WHERE (status = 'occupied' OR status = 'pending')
    `;


    const [reservations] = await connection.execute(selectQuery);
    await connection.end();

    return NextResponse.json({ 
      reservations,
      expiredUpdated: expiredCount 
    });
  } catch (err) {
    console.error('Database error:', err);
    if (connection) await connection.end();
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const role = searchParams.get('role');
  let advisorEmail;

  let connection, connection2;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      charset: 'utf8mb4'
    });

    // Parse request body
    const body = await request.json();
    
    let username, major, room, seats, advisor_name;

    if (role === 'student') {
      // Student sends: { username, major, room, seats, email }
      username = body.username;
      major = body.major;
      room = body.room;
      seats = body.seats;
      advisor_name = seats[0]?.advisor_name;

      console.log('=== DEBUG ADVISOR ===');
      console.log('advisor_name received:', advisor_name);
      console.log('advisor_name type:', typeof advisor_name);
      console.log('advisor_name length:', advisor_name?.length);
      
    } else if (role === 'admin') {
      // Admin sends: { username, room, seats, email } - no major field
      username = body.username;
      major = body.major; // Default value for admin
      room = body.room;
      seats = body.seats;
    }
  
    const expiredCount = await updateExpiredReservations(connection);
    console.log(`POST: Updated ${expiredCount} expired reservations`);

    
    // Validation
    if (!username || !major || !room || !seats || !Array.isArray(seats)) {
      return NextResponse.json({
        error: 'Missing required fields'
      }, { status: 400 });
    }

        if (role === 'student') {
      // Connection 2: For staff/advisors (DB_NAME2)
      connection2 = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME2,
        charset: 'utf8mb4'  
      });

      const [advisorRows] = await connection2.query(
        'SELECT staff_email FROM staff WHERE staff_name = ?',
        [advisor_name]
      );

      if (!advisorRows || (advisorRows as any[]).length === 0) {
        return NextResponse.json({
          error: `Advisor "${advisor_name}" not found`
        }, { status: 404 });
      }

      advisorEmail = (advisorRows as any[])[0].staff_email;
    }


    // Check if any seats are already occupied (for BOTH roles)
    const seatIds = seats.map((s: any) => s.seat);
    const approvalToken = crypto.randomUUID();
    const placeholders = seatIds.map(() => '?').join(',');
    const checkQuery = `
      SELECT seat FROM nodelogin.bookingslist
      WHERE room = ? AND seat IN (${placeholders}) AND (status = 'occupied' OR status = 'pending')
    `;

    const [existingSeats] = await connection.execute(checkQuery, [room, ...seatIds]);

    if ((existingSeats as any[]).length > 0) {
      await connection.end();
      return NextResponse.json({
        error: 'Some seats are already occupied or pending approval',
        occupiedSeats: (existingSeats as any[]).map(row => row.seat)
      }, { status: 409 });
    }
    const confirmLink = `${process.env.NEXT_PUBLIC_BASE_URL}/api/approve?token=${approvalToken}&action=confirm&approver=admin`;
    const rejectLink = `${process.env.NEXT_PUBLIC_BASE_URL}/reject?token=${approvalToken}`;
    // Email 2 - For Advisor
    const aaConfirmLink = `${process.env.NEXT_PUBLIC_BASE_URL}/api/approve?token=${approvalToken}&action=confirm&approver=advisor`;

    // Insert reservation with different status based on role
        const insertQuery = `
      INSERT INTO nodelogin.bookingsTest
      (username, major, room, seat, date_in, date_out, period_time, advisor_name, advisor, admin, status, approval_token, created_at, updated_at) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;
        //  Insert with better error handling
    for (const seat of seats) {
      try {
        console.log('Inserting seat data:', {
        date_in: seat.date_in,
        date_out: seat.date_out,
        period_time: seat.period_time
      });
        console.log('Inserting seat:', seat.seat); // Debug log
        await connection.execute(insertQuery, [
          username,
          major,
          room,
          seat.seat,
          seat.date_in,
          seat.date_out,
          seat.period_time,
          seat.advisor_name,
          'x',
          'x',
          'pending',
          approvalToken
        ]);
      } catch (insertError) {
        console.error('Error inserting seat:', seat.seat, insertError);
        throw insertError; // Re-throw to be caught by outer catch
      }
    }


          const seatDetails = seats.map((seat: any) => `
    <li style="padding: 8px 0; color: #333;">
      <strong>Seat ${seat.seat}:</strong> ${seat.date_in} to ${seat.date_out} (${seat.period_time})
    </li>
  `).join('');

   // const status = role === 'admin' ? 'occupied' : 'pending';
    //const values = seats.map((s: any) => [username, major, room, s.seat, status]);
    //await connection.query(insertQuery, [values]);
    
    // Send emails
    await sendReservationConfirmationEmail('naruesorn@g.swu.ac.th', username, room, seatDetails, confirmLink, rejectLink);
    
    if (role === 'student') {
      await sendStudentPendingApprovalEmail(advisorEmail, username, room, seatDetails, aaConfirmLink, rejectLink );
    }
    
    await connection.end();
    
    return NextResponse.json({
      success: true,
      message: role === 'admin' ? 'Reservation created and approved' : 'Reservation submitted for approval',
      role: role
    });
    
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({
      error: 'An error occurred'
    }, { status: 500 });
  } finally {
    if (connection) await connection.end();
    if (connection2) await connection2.end();
  }
}



// PUT method with auto-update for expired reservations

export async function PUT(request: Request) {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    // First, update any expired reservations
    const expiredCount = await updateExpiredReservations(connection);
    
    console.log(`PUT: Updated ${expiredCount} expired reservations`);

    const { username, major, room, seat, date_in, date_out, period_time, status } = await request.json();

    if (!username || !major || !room || !seat || !date_in || !date_out || !period_time || !status) {
      await connection.end();
      return NextResponse.json({ 
        error: 'Missing required fields: username, major, room, seat, date_in, date_out, period_time, and status are required' 
      }, { status: 400 });
    }

    // Check if the reservation exists
    const checkQuery = `
      SELECT * FROM nodelogin.bookingsTest
      WHERE username = ? AND room = ? AND seat = ?
    `;

   
    const [existingReservation] = await connection.execute(checkQuery, [username, room, seat]);

    if (!(existingReservation as any[]).length) {
      await connection.end();
      return NextResponse.json({ error: 'Reservation not found' }, { status: 404 });
    }

    const updateQuery = `
      UPDATE nodelogin.bookingsTest
      SET major = ?, date_in = ?, date_out = ?, period_time = ?, status = ?, updated_at = NOW()
      WHERE username = ? AND room = ? AND seat = ?
    `;

    


    await connection.execute(updateQuery, [
      major,
      date_in,
      date_out,
      period_time,
      status,
      username,
      room,
      seat
    ]);

    await connection.end();
    return NextResponse.json({ 
      message: 'Reservation updated successfully',
      expiredUpdated: expiredCount
    });
  } catch (err) {
    console.error('Database error:', err);
    if (connection) await connection.end();
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}