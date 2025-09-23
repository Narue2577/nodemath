import mysql from 'mysql2/promise';

const databook = {
  host: process.env.DB_HOST ,
  user: process.env.DB_USER ,
  password: process.env.DB_PASSWORD ,
  database: process.env.DB_NAME ,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};
const pool = mysql.createPool(databook);

export default pool;
//|| '10.1.140.57'
//||'cosciadministrator'
//||'Cosci!_2021'
//||'cosci_system'