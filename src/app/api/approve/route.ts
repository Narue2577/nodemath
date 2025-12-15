//import { NextResponse } from 'next/server'; app/api/approve/route.ts
{/* 
import mysql from 'mysql2/promise';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');
  const action = searchParams.get('action'); // 'confirm' or 'reject'
  const approver = searchParams.get('approver'); // Get who is approving

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
      'SELECT * FROM nodelogin.bookingsTest WHERE approval_token = ? AND status = "pending"',
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
    const isConfirmed = action === 'confirm';

    if(isConfirmed){
      let adminValue = 'o';
       // Different update based on who approved
      if (approver === 'admin') {
        await connection.execute(
      'UPDATE nodelogin.bookingsTest SET status = ?, admin = ?, updated_at = NOW() WHERE approval_token = ?',
      [newStatus,'o', token]
    );
      } else if (approver === 'advisor') {
        await connection.execute(
      'UPDATE nodelogin.bookingsTest SET advisor = ?, updated_at = NOW() WHERE approval_token = ? AND advisor_name != "-" ',
      ['o', token]
    );
      } else {
        adminValue = 'x'; // default
      }
      
    }
    // Update status
    

    await connection.end();

    // Return success page
   
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
} */}
{/*
// app/api/approve/route.ts
import mysql from 'mysql2/promise';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');
  const action = searchParams.get('action'); // 'confirm' only
  const approver = searchParams.get('approver'); // 'admin' or 'advisor'

  if (!token || action !== 'confirm') {
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

    // Check if reservation exists and is not already rejected or occupied
    const [reservations] = await connection.execute(
      'SELECT * FROM nodelogin.bookingsTest WHERE approval_token = ?',
      [token]
    );

    if ((reservations as any[]).length === 0) {
      await connection.end();
      return new Response(
        `<html>
          <body style="font-family: Arial; text-align: center; padding: 50px;">
            <h1 style="color: #ff9800;">⚠️ Reservation Not Found</h1>
            <p>This reservation does not exist or has been removed.</p>
          </body>
        </html>`,
        { headers: { 'Content-Type': 'text/html' } }
      );
    }

    const reservation = (reservations as any[])[0];

    // Check if already rejected
    if (reservation.status === 'rejected') {
      await connection.end();
      return new Response(
        `<html>
          <body style="font-family: Arial; text-align: center; padding: 50px;">
            <h1 style="color: #f44336;">✗ Already Rejected</h1>
            <p>This reservation has already been rejected.</p>
          </body>
        </html>`,
        { headers: { 'Content-Type': 'text/html' } }
      );
    }

    // Check if already fully approved (occupied)
    if (reservation.status === 'occupied') {
      await connection.end();
      return new Response(
        `<html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Already Confirmed</title>
          </head>
          <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px; background-color: #f5f5f5;">
            <div style="background: white; padding: 40px; border-radius: 10px; max-width: 500px; margin: 0 auto; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <h1 style="color: #4CAF50; margin-bottom: 20px;">✓ Already Confirmed</h1>
              <p style="font-size: 18px; margin-bottom: 30px;">
                This reservation has already been fully approved.
              </p>
              <div style="background: #f9f9f9; padding: 20px; border-radius: 5px; text-align: left;">
                <p><strong>Student:</strong> ${reservation.username}</p>
                <p><strong>Room:</strong> ${reservation.room}</p>
                <p><strong>Seat:</strong> ${reservation.seat}</p>
                <p><strong>Status:</strong> <span style="color: #4CAF50;">occupied</span></p>
              </div>
              <p style="margin-top: 30px; color: #666;">You can close this window now.</p>
            </div>
          </body>
        </html>`,
        { headers: { 'Content-Type': 'text/html' } }
      );
    }

    const currentAdmin = reservation.admin;
    const currentAdvisor = reservation.advisor;
    const advisorName = reservation.advisor_name;
    
    // Determine if this is a student reservation (needs advisor approval)
    const isStudentReservation = advisorName && advisorName !== '-';

    // Check if already approved by this person
    const alreadyApproved = 
      (approver === 'admin' && currentAdmin === 'o') ||
      (approver === 'advisor' && currentAdvisor === 'o');

    if (alreadyApproved) {
      await connection.end();
      return new Response(
        `<html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Already Approved</title>
          </head>
          <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px; background-color: #f5f5f5;">
            <div style="background: white; padding: 40px; border-radius: 10px; max-width: 500px; margin: 0 auto; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <h1 style="color: #ff9800; margin-bottom: 20px;">⚠️ Already Approved</h1>
              <p style="font-size: 18px; margin-bottom: 30px;">
                You have already approved this reservation.
              </p>
              <div style="background: #f9f9f9; padding: 20px; border-radius: 5px; text-align: left;">
                <p><strong>Student:</strong> ${reservation.username}</p>
                <p><strong>Room:</strong> ${reservation.room}</p>
                <p><strong>Seat:</strong> ${reservation.seat}</p>
                <p><strong>Current Status:</strong> <span style="color: #ff9800;">${reservation.status}</span></p>
              </div>
              <p style="margin-top: 30px; color: #666;">You can close this window now.</p>
            </div>
          </body>
        </html>`,
        { headers: { 'Content-Type': 'text/html' } }
      );
    }

    let newStatus = 'pending';
    let newAdmin = currentAdmin;
    let newAdvisor = currentAdvisor;

    // Update approval status based on who is approving
    if (approver === 'admin') {
      newAdmin = 'o';
    } else if (approver === 'advisor') {
      newAdvisor = 'o';
    }

    // Determine final status based on reservation type
    if (isStudentReservation) {
      // STUDENT: Need BOTH admin='o' AND advisor='o'
      if (newAdmin === 'o' && newAdvisor === 'o') {
        newStatus = 'occupied';
      } else {
        newStatus = 'pending'; // Still waiting for the other approval
      }
    } else {
      // ADMIN/TEACHER: Only need admin='o'
      if (newAdmin === 'o') {
        newStatus = 'occupied';
      }
    }

    // Update database
    await connection.execute(
      'UPDATE nodelogin.bookingsTest SET status = ?, admin = ?, advisor = ?, updated_at = NOW() WHERE approval_token = ?',
      [newStatus, newAdmin, newAdvisor, token]
    );

    await connection.end();

    // Prepare response message
    let statusMessage = '';
    if (newStatus === 'occupied') {
      statusMessage = isStudentReservation 
        ? 'All required approvals received. Reservation is now confirmed!'
        : 'Reservation approved and confirmed!';
    } else if (newStatus === 'pending') {
      const waitingFor = newAdmin === 'x' ? 'admin' : 'advisor';
      statusMessage = `Your approval has been recorded. Waiting for ${waitingFor} approval.`;
    }

    return new Response(
      `<html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${newStatus === 'occupied' ? 'Confirmed' : 'Approval Recorded'}</title>
        </head>
        <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px; background-color: #f5f5f5;">
          <div style="background: white; padding: 40px; border-radius: 10px; max-width: 500px; margin: 0 auto; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h1 style="color: ${newStatus === 'occupied' ? '#4CAF50' : '#ff9800'}; margin-bottom: 20px;">
              ${newStatus === 'occupied' ? '✓ Fully Confirmed!' : '✓ Approval Recorded'}
            </h1>
            <p style="font-size: 18px; margin-bottom: 30px;">
              ${statusMessage}
            </p>
            <div style="background: #f9f9f9; padding: 20px; border-radius: 5px; text-align: left;">
              <p><strong>Student:</strong> ${reservation.username}</p>
              <p><strong>Room:</strong> ${reservation.room}</p>
              <p><strong>Seat:</strong> ${reservation.seat}</p>
              <p><strong>Status:</strong> <span style="color: ${newStatus === 'occupied' ? '#4CAF50' : '#ff9800'};">${newStatus}</span></p>
              ${isStudentReservation ? `
                <p style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #ddd;">
                  <strong>Approvals:</strong><br/>
                  Admin: ${newAdmin === 'o' ? '✓ Approved' : '⏳ Pending'}<br/>
                  Advisor: ${newAdvisor === 'o' ? '✓ Approved' : '⏳ Pending'}
                </p>
              ` : `
                <p style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #ddd;">
                  <strong>Admin Approval:</strong> ✓ Approved
                </p>
              `}
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
      `<html><body><h1>Error processing request</h1><p>${err}</p></body></html>`,
      { headers: { 'Content-Type': 'text/html' } }
    );
  }
}
  */}

// app/api/approve/route.ts
// app/api/approve/route.ts
import mysql from 'mysql2/promise';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');
  const action = searchParams.get('action'); // 'confirm' only
  const approver = searchParams.get('approver'); // 'admin' or 'advisor'

  if (!token || action !== 'confirm') {
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

    // Check if reservation exists
    const [reservations] = await connection.execute(
      'SELECT * FROM nodelogin.bookingsTest WHERE approval_token = ?',
      [token]
    );

    if ((reservations as any[]).length === 0) {
      await connection.end();
      return new Response(
        `<html>
          <body style="font-family: Arial; text-align: center; padding: 50px;">
            <h1 style="color: #ff9800;">⚠️ Reservation Not Found</h1>
            <p>This reservation does not exist or has been removed.</p>
          </body>
        </html>`,
        { headers: { 'Content-Type': 'text/html' } }
      );
    }

    const reservation = (reservations as any[])[0];

    // *** UNIFIED CHECK: Block if already processed (rejected OR fully confirmed) ***
    if (reservation.status === 'rejected' || reservation.status === 'occupied') {
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

    const currentAdmin = reservation.admin;
    const currentAdvisor = reservation.advisor;
    const advisorName = reservation.advisor_name;
    
    // Determine if this is a student reservation (needs advisor approval)
    const isStudentReservation = advisorName && advisorName !== '-';

    // Check if already approved by this person
    const alreadyApproved = 
      (approver === 'admin' && currentAdmin === 'o') ||
      (approver === 'advisor' && currentAdvisor === 'o');

    if (alreadyApproved) {
      await connection.end();
      return new Response(
        `<html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Already Approved</title>
          </head>
          <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px; background-color: #f5f5f5;">
            <div style="background: white; padding: 40px; border-radius: 10px; max-width: 500px; margin: 0 auto; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <h1 style="color: #ff9800; margin-bottom: 20px;">⚠️ Already Approved</h1>
              <p style="font-size: 18px; margin-bottom: 30px;">
                You have already approved this reservation.
              </p>
              <div style="background: #f9f9f9; padding: 20px; border-radius: 5px; text-align: left;">
                <p><strong>Student:</strong> ${reservation.username}</p>
                <p><strong>Room:</strong> ${reservation.room}</p>
                <p><strong>Seat:</strong> ${reservation.seat}</p>
                <p><strong>Current Status:</strong> <span style="color: #ff9800;">${reservation.status}</span></p>
              </div>
              <p style="margin-top: 30px; color: #666;">You can close this window now.</p>
            </div>
          </body>
        </html>`,
        { headers: { 'Content-Type': 'text/html' } }
      );
    }

    let newStatus = 'pending';
    let newAdmin = currentAdmin;
    let newAdvisor = currentAdvisor;

    // Update approval status based on who is approving
    if (approver === 'admin') {
      newAdmin = 'o';
    } else if (approver === 'advisor') {
      newAdvisor = 'o';
    }

    // Determine final status based on reservation type
    if (isStudentReservation) {
      // STUDENT: Need BOTH admin='o' AND advisor='o'
      if (newAdmin === 'o' && newAdvisor === 'o') {
        newStatus = 'occupied';
      } else {
        newStatus = 'pending'; // Still waiting for the other approval
      }
    } else {
      // ADMIN/TEACHER: Only need admin='o'
      if (newAdmin === 'o') {
        newStatus = 'occupied';
      }
    }

    // Update database
    await connection.execute(
      'UPDATE nodelogin.bookingsTest SET status = ?, admin = ?, advisor = ?, updated_at = NOW() WHERE approval_token = ?',
      [newStatus, newAdmin, newAdvisor, token]
    );

    await connection.end();

    // Prepare response message
    let statusMessage = '';
    if (newStatus === 'occupied') {
      statusMessage = isStudentReservation 
        ? 'All required approvals received. Reservation is now confirmed!'
        : 'Reservation approved and confirmed!';
    } else if (newStatus === 'pending') {
      const waitingFor = newAdmin === 'x' ? 'admin' : 'advisor';
      statusMessage = `Your approval has been recorded. Waiting for ${waitingFor} approval.`;
    }

    return new Response(
      `<html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${newStatus === 'occupied' ? 'Confirmed' : 'Approval Recorded'}</title>
        </head>
        <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px; background-color: #f5f5f5;">
          <div style="background: white; padding: 40px; border-radius: 10px; max-width: 500px; margin: 0 auto; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h1 style="color: ${newStatus === 'occupied' ? '#4CAF50' : '#ff9800'}; margin-bottom: 20px;">
              ${newStatus === 'occupied' ? '✓ Fully Confirmed!' : '✓ Approval Recorded'}
            </h1>
            <p style="font-size: 18px; margin-bottom: 30px;">
              ${statusMessage}
            </p>
            <div style="background: #f9f9f9; padding: 20px; border-radius: 5px; text-align: left;">
              <p><strong>Student:</strong> ${reservation.username}</p>
              <p><strong>Room:</strong> ${reservation.room}</p>
              <p><strong>Seat:</strong> ${reservation.seat}</p>
              <p><strong>Status:</strong> <span style="color: ${newStatus === 'occupied' ? '#4CAF50' : '#ff9800'};">${newStatus}</span></p>
              ${isStudentReservation ? `
                <p style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #ddd;">
                  <strong>Approvals:</strong><br/>
                  Admin: ${newAdmin === 'o' ? '✓ Approved' : '⏳ Pending'}<br/>
                  Advisor: ${newAdvisor === 'o' ? '✓ Approved' : '⏳ Pending'}
                </p>
              ` : `
                <p style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #ddd;">
                  <strong>Admin Approval:</strong> ✓ Approved
                </p>
              `}
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
      `<html><body><h1>Error processing request</h1><p>${err}</p></body></html>`,
      { headers: { 'Content-Type': 'text/html' } }
    );
  }
}