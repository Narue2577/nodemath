// src/app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import mysql from 'mysql2/promise';

//console.log('🚀 NextAuth route file loaded!');

//  SIMPLE FUNCTION - Just update expired reservations
async function updateExpiredReservations(connection: any) {
  try {
    console.log('🔍 Checking for expired reservations...');
    
    // Simple query: If checkout time has passed, mark as complete
    const updateQuery = `
      UPDATE cosci_reservation.BookingTest
      SET status = 'complete', 
          updated_at = NOW()
      WHERE status = 'occupied' 
        AND CONCAT(date_out, ' ', SUBSTRING_INDEX(period_time, '-', -1), ':00') < NOW()
    `;

    const [result]: any = await connection.execute(updateQuery);
    
    if (result.affectedRows > 0) {
      console.log(`✅ Updated ${result.affectedRows} expired reservation(s)`);
    } else {
      console.log('✅ No expired reservations found');
    }
    
    return result.affectedRows;
  } catch (error) {
    console.error('❌ Error updating reservations:', error);
    return 0;
  }
}

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        buasri: { label: "Buasri ID", type: "text" },
        role: { label: "Role", type: "text" },
        password: { label: "Password", type: "text" }
      },
      async authorize(credentials) {
        console.log('🔐 Authorize called with credentials:', {
          buasri: credentials?.buasri,
          role: credentials?.role,
          hasPassword: !!credentials?.password
        });

        if (!credentials?.buasri || !credentials?.role || !credentials?.password) {
          console.log('❌ Missing credentials');
          return null
        }
        
        let connection;
        try {
          connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME3,
          });
          console.log('✅ Database connected');
        } catch (error) {
          console.error('❌ Database connection failed:', error);
          return null;
        }

        try {
          const { buasri, role, password } = credentials;
          console.log('🔍 Login attempt:', { buasri, role });
          
          let mockUsers;
          let query;
          
          if (role === 'student') {
            query = 'SELECT * FROM student_member WHERE student_buasri = ?';
            console.log('📝 Executing query:', query, 'with buasri:', buasri);
            [mockUsers] = await connection.execute(query, [buasri]);
          } else if (role === 'teacher') {
            query = 'SELECT * FROM staff_member WHERE staff_buasri = ?';
            console.log('📝 Executing query:', query, 'with buasri:', buasri);
            [mockUsers] = await connection.execute(query, [buasri]);
          } else {
            console.log('❌ Invalid role:', role);
            return null;
          }
          
          const mockUsersArray = Array.isArray(mockUsers) ? mockUsers : Object.values(mockUsers);
          console.log('📊 Query returned:', mockUsersArray.length, 'users');
          
          if (mockUsersArray.length === 0) {
            console.log('❌ No user found with buasri:', buasri, 'in', role === 'student' ? 'student_member' : 'staff_member');
            return null;
          }
          
          // Find matching user based on role
          const user = mockUsersArray.find((u: any) => {
            const buasriField = role === 'teacher' ? 'staff_buasri' : 'student_buasri';
            const passwordField = role === 'teacher' ? 'staff_password' : 'student_password';
            
            const buasriMatch = u[buasriField] === buasri;
            const passwordMatch = u[passwordField] === password;
            
            console.log('🔍 Checking user:', {
              buasriMatch,
              passwordMatch,
              dbBuasri: u[buasriField],
              inputBuasri: buasri
            });
            
            return buasriMatch && passwordMatch;
          });
          
          if (user) {
            console.log('✅ Login successful!');
            
            // Map database fields to return object based on role
            if (role === 'teacher') {
              return {
                id: user.staffmem_id.toString(),
                name: user.staff_name,
                buasri: user.staff_buasri,
                username: user.staff_buasri,
                role: 'teacher',
                field: user.staff_position,
                email: user.staff_email,
                phone: user.staff_phone
              }
            } else {
              return {
                id: user.stumem_id.toString(),
                name: user.student_name,
                buasri: user.student_buasri,
                username: user.student_buasri,
                role: 'student',
                field: user.student_major,
                advisor: user.student_advisor,
                email: user.student_email,
                phone: user.student_phone
              }
            }
          }
          
          console.log('❌ Password mismatch');
          return null
        } catch (error) {
          console.error('❌ Database error:', error);
          return null;
        } finally {
          if (connection) {
            await connection.end();
            console.log('🔌 Database connection closed');
          }
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role
        token.name = (user as any).name;
        token.buasri = (user as any).buasri;
        token.username = (user as any).username;
        token.field = (user as any).field;
        token.email = (user as any).email;
        token.phone = (user as any).phone;
        if ((user as any).advisor) {
          token.advisor = (user as any).advisor;
        }
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        (session.user as any).role = token.role;
        (session.user as any).name = token.name;
        (session.user as any).buasri = token.buasri;
        (session.user as any).username = token.username;
        (session.user as any).field = token.field;
        (session.user as any).email = token.email;
        (session.user as any).phone = token.phone;
        if (token.advisor) {
          (session.user as any).advisor = token.advisor;
        }
      }
      console.log("Session:", session);
      return session
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`
      else if (new URL(url).origin === baseUrl) return url
      return baseUrl
    },
    //  SIMPLE: Update expired reservations when someone logs in
    async signIn() {
      const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME3,
      });

      try {
        await updateExpiredReservations(connection);
      } catch (error) {
        console.error('❌ Error in signIn callback:', error);
      } finally {
        await connection.end();
      }
      
      return true; // Always allow login
    }
  },
  pages: {
    signIn: '/auth/login',
    signOut: '/auth/register',
  },
  session: {
    strategy: 'jwt',
  },
})

export { handler as GET, handler as POST }
{/*import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import mysql from 'mysql2/promise';

//  SIMPLE FUNCTION - Just update expired reservations
async function updateExpiredReservations(connection: any) {
  try {
    console.log('🔍 Checking for expired reservations...');
    
    // Simple query: If checkout time has passed, mark as complete
    const updateQuery = `
      UPDATE cosci_reservation.BookingTest
      SET status = 'complete', 
          updated_at = NOW()
      WHERE status = 'occupied' 
        AND CONCAT(date_out, ' ', SUBSTRING_INDEX(period_time, '-', -1), ':00') < NOW()
    `;

    const [result]: any = await connection.execute(updateQuery);
    
    if (result.affectedRows > 0) {
      console.log(` Updated ${result.affectedRows} expired reservation(s)`);
    } else {
      console.log(' No expired reservations found');
    }
    
    return result.affectedRows;
  } catch (error) {
    console.error(' Error updating reservations:', error);
    return 0;
  }
}

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        buasri: { label: "Buasri ID", type: "text" },
        role: { label: "Role", type: "text" },
        password: { label: "Password", type: "text" }
      },
      async authorize(credentials) {
        if (!credentials?.buasri || !credentials?.role || !credentials?.password) {
          return null
        }
        
        const connection = await mysql.createConnection({
          host: process.env.DB_HOST,
          user: process.env.DB_USER,
          password: process.env.DB_PASSWORD,
          database: process.env.DB_NAME3,
        });

        try {
          if(role === 'student'){
          const [mockUsers] = await connection.execute(
            'SELECT * FROM student_member ',
          );
        } else{
          const [mockUsers] = await connection.execute(
            'SELECT * FROM staff_member',
          );
        }
          const mockUsersArray = Object.values(mockUsers);
          
          const user = mockUsersArray.find(
            u => u.buasri === credentials.buasri &&
                  u.role === credentials.role &&
                  u.password === credentials.password
          )
          
          if (user) {
            return {
              id: user.id.toString(),
              name: user.name,
              buasri: user.buasri,
              username: user.buasri,
              role: user.role,
              password: user.password,
              field: user.field
            }
          }
          
          return null
        } finally {
          await connection.end();
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role
        token.name = (user as any).name;
        token.buasri = (user as any).buasri;
        token.username = (user as any).username;
        token.field = (user as any).field;
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        (session.user as any).role = token.role;
        (session.user as any).name = token.name;
        (session.user as any).buasri = token.buasri;
        (session.user as any).username = token.username;
        (session.user as any).field = token.field;
      }
      console.log("Session:", session); //checked
      return session //checked
    }, //checked
    async redirect({ url, baseUrl }) { //checked
      if (url.startsWith("/")) return `${baseUrl}${url}` //checked
      else if (new URL(url).origin === baseUrl) return url //checked
      return baseUrl //checked
    }, //checked
    //  SIMPLE: Update expired reservations when someone logs in
    async signIn() { //checked
      const connection = await mysql.createConnection({ //checked
        host: process.env.DB_HOST, //checked
      user: process.env.DB_USER, //checked
      password: process.env.DB_PASSWORD, //checked
      database: process.env.DB_NAME3, //checked
      }); //checked

      try { //checked
        await updateExpiredReservations(connection); //checked
      } catch (error) { //checked
        console.error(' Error in signIn callback:', error); //checked
      } finally { //checked
        await connection.end(); //checked
      } //checked
      
      return true; // Always allow login
    } //checked
  }, //checked
  pages: { //checked
    signIn: '/auth/login', //checked
    signOut: '/auth/register', //checked
  }, //checked
  session: { //checked
    strategy: 'jwt', //checked
  }, //checked
}) //checked

export { handler as GET, handler as POST } //checked

{/* // src/app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth"
import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import mysql from 'mysql2/promise';

async function updateExpiredReservations(connection: any) {
  try {
    console.log('Checking for expired reservations...');
    
    const query = `
      UPDATE nodelogin.stud_reserv 
      SET status = 'complete', updated_at = NOW()
      WHERE status = 'occupied' 
      AND STR_TO_DATE(
        CONCAT(date_out, ' ', SUBSTRING_INDEX(period_time, '-', -1), ':00'),
        '%Y-%m-%d %H:%i:%s'
      ) < NOW()
    `;

    const [result]: any = await connection.execute(query);
    console.log('Expired reservations updated:', result.affectedRows);
    return result.affectedRows;
  } catch (error) {
    console.error('Error updating expired reservations:', error);
    return 0;
  }
}

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        buasri: { label: "Buasri ID", type: "text" },
        role: { label: "Role", type: "text" },
        password: { label: "Password", type: "text" }
      },
      async authorize(credentials) {
        if (!credentials?.buasri || !credentials?.role || !credentials?.password) {
          return null
        }
        
        const connection = await mysql.createConnection({
          host: 'localhost',
          user: 'root',
          password: 'Ertnom35!',
          database: 'cosci_system'
        });

        try {
          const [mockUsers] = await connection.execute(
            'SELECT staff_id AS id, staff_buasri AS buasri, "teacher" AS role, staff_name AS name, staff_password AS password, staff_position AS field FROM staff WHERE staff_buasri != "NULL" UNION SELECT stu_id, stu_buasri, "student" AS role, stu_name, stu_password AS password, stu_major AS field FROM student',
          );
          
          const mockUsersArray = Object.values(mockUsers);
          
          const user = mockUsersArray.find(
            u => u.buasri === credentials.buasri &&
                  u.role === credentials.role &&
                  u.password === credentials.password
          )
          
          if (user) {
            return {
              id: user.id.toString(),
              name: user.name,
              buasri: user.buasri,
              username: user.buasri, // ← ADD THIS: Use buasri as username
              role: user.role,
              password: user.password,
              field: user.field
            }
          }
          
          return null
        } finally {
          await connection.end();
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role
        token.name = (user as any).name;
        token.buasri = (user as any).buasri;
        token.username = (user as any).username; // ← ADD THIS
        token.field = (user as any).field;
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        (session.user as any).role = token.role;
        (session.user as any).name = token.name;
        (session.user as any).buasri = token.buasri;
        (session.user as any).username = token.username; // ← ADD THIS
        (session.user as any).field = token.field;
      }
      console.log("Session:", session);
      return session
    },
    // ← ADD THIS NEW CALLBACK for automatic redirect
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url
      return baseUrl
    },
     async signIn() {
    // Update expired reservations when user signs in
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    
    await updateExpiredReservations(connection);
    
    await connection.end();
    return true;
  }
  },
  pages: {
  signIn: '/auth/login',
  signOut: '/auth/register', // ← Keep this as register
},

  session: {
    strategy: 'jwt',
  },
})

export { handler as GET, handler as POST }
*/}