import { NextResponse } from 'next/server';
import { ImapFlow } from 'imapflow';
import { simpleParser } from 'mailparser';
import mysql from 'mysql2/promise';

export async function POST() {
  let connection;
  try {
    // Connect to your database
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      charset: 'utf8mb4'
    });

    // Connect to IMAP
    const client = new ImapFlow({
      host: process.env.IMAP_HOST!,
      port: 993,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER!,
        pass: process.env.EMAIL_PASSWORD!,
      },
    });

    await client.connect();
    await client.mailboxOpen('INBOX');

    // Search for replies
    const searchResult = await client.search({
      unseen: true,
      subject: 'ปฏิเสธการจองห้อง',
    });

    if (searchResult.length === 0) {
      return NextResponse.json({ success: true, message: 'No new replies found.' });
    }

    // Process each reply
    for (const uid of searchResult) {
      const message = await client.fetchOne(uid, { source: true });
      const parsed = await simpleParser(message.source);
      const reasonMatch = parsed.text?.match(/ปฏิเสธ: (.*)/);
      const bookingIdMatch = parsed.subject?.match(/Booking ID: (.*)/);

      if (reasonMatch && bookingIdMatch) {
        const reason = reasonMatch[1].trim();
        const bookingId = bookingIdMatch[1].trim();

        // Update the booking status in your database
        await connection.execute(
          'UPDATE nodelogin.stud_reserv SET status = ?, reason = ? WHERE approval_token = ?',
          ['rejected', reason, bookingId]
        );
      }
    }

    // Mark emails as seen
    await client.messageFlagsAdd(searchResult, ['\\Seen']);
    await client.logout();

    return NextResponse.json({ success: true, message: 'Processed replies.' });
  } catch (err) {
    console.error('Error:', err);
    return NextResponse.json({ success: false, error: 'Failed to process replies.' }, { status: 500 });
  } finally {
    if (connection) await connection.end();
  }
}
