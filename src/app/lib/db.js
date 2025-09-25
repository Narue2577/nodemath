import mysql from 'mysql2/promise';

const databook = {
  host: process.env.DB_HOST || '10.1.140.57' ,
  user: process.env.DB_USER ||'cosciadministrator',
  password: process.env.DB_PASSWORD ||'Cosci!_2021',
  database: process.env.DB_NAME ||'cosci_system' ,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};
const pool = mysql.createPool(databook);

export default pool;
//
//
//
//