// src/app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import mysql from 'mysql2/promise';

//  SIMPLE FUNCTION - Just update expired reservations
async function updateExpiredReservations(connection: any) {
  try {
    console.log('🔍 Checking for expired reservations...');
    
    // Simple query: If checkout time has passed, mark as complete
    const updateQuery = `
      UPDATE nodelogin.stud_reserv 
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
        host: 'localhost',
        user: 'root',
        password: 'Ertnom35!',
        database: 'cosci_system'
      });

      try {
        await updateExpiredReservations(connection);
      } catch (error) {
        console.error(' Error in signIn callback:', error);
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