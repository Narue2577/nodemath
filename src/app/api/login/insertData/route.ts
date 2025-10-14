import { NextApiRequest, NextApiResponse } from 'next';
import mysql from 'mysql2/promise';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { id, buasri, fullName, email, password, position, phone, group, advisor, role } = req.body;
    // Validate required fields
    if (!id || !buasri || !fullName || !password || !role) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    try {
      // Create a connection to the MySQL database
      const connection = await mysql.createConnection({
         host: 'localhost',
         user: 'root',
         password: 'Ertnom35!',
         database: 'cosci_system'
      });

      console.log(id);
      

      if (role === 'student') {
        // Insert student data into the table
       await connection.execute(
          `INSERT INTO student 
           (stu_id, stu_buasri, stu_password, stu_name, stu_eng_name, stu_group, stu_advisor, stu_major, stu_status) 
           VALUES  (?,?,?,?,"",?,?,"","o")`,
          [id, buasri, password, fullName,  group, advisor]
        );
      } else if (role === 'teacher') {
        // Insert teacher data into the table
        await connection.execute(
          `INSERT INTO staff 
           (staff_id,staff_buasri, staff_password, staff_name, staff_position, staff_email, staff_phone, staff_major, staff_workload, staff_from, staff_status) 
           VALUES (?,?,?,?,?,?,?,"",0,"","o")`,
          [id, buasri,password, fullName, position, email,  phone]
        );
      }

      console.log('Data inserted successfully');
      res.status(200).json({ message: 'Data inserted successfully' });
    } catch (error) {
      console.error('Error inserting data:', error);
      res.status(500).json({ error: 'Failed to insert data' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

{/*import { NextApiRequest, NextApiResponse } from 'next';
import mysql from 'mysql2/promise';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { id,buasri, role, name, password } = req.body;

    try {
      // Create a connection to the MySQL database
      const connection = await mysql.createConnection({
        host: 'localhost',
          user: 'root',
          password: 'Ertnom35!',
          database: 'cosci_system'
      });

      // Insert data into the table (replace `users` with your table name)
      if(role =="student"){
      const [result] = await connection.execute(
        'INSERT INTO student (stu_id, stu_buasri, stu_password, stu_name, stu_eng_name, stu_group, stu_advisor, stu_major, stu_status) VALUES (?,?,?,?,?,?,?,?,?)',
        [buasri, role]
      ); } else{
        const [result] = await connection.execute(
        'INSERT INTO staff (staff_id,staff_buasri, staff_password, staff_name, staff_position, staff_email, staff_phone, staff_major, staff_workload, staff_from, staff_status) VALUES (?,?,?,?,?,?,?,?,?,?,?)',
        [buasri, role]
      }

      console.log('Data inserted:', result);
      res.status(200).json({ message: 'Data inserted successfully' });
    } catch (error) {
      console.error('Error inserting data:', error);
      res.status(500).json({ error: 'Failed to insert data' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} */}