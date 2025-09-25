// app/api/auth/[...nextauth]/route.ts
/*
import NextAuth from "next-auth";
import type { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import mysql from 'mysql2/promise';

// Database connection configuration
const dbConfig = {
  host: '10.1.140.57',
  user: 'cosciadministrator',
  password: 'Cosci!_2021',
  database: 'cosci_system'
};

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        buasri: { label: "Buasri ID", type: "text" },
        // We add a 'role' credential to know which table to check
        role: { label: "Role", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.buasri || !credentials?.role) {
          return null;
        }

        const connection = await mysql.createConnection(dbConfig);
        
        try {
          let user = null;
          
          // Check the appropriate table based on the role provided from the login form
          if (credentials.role === 'admin') {
            const [rows] = await connection.execute(
              'SELECT staff_buasri as buasri, staff_name as name FROM staff WHERE staff_buasri = ?',
              [credentials.buasri]
            );
            if (rows.length > 0) {
              user = { ...rows[0], role: 'admin' };
            }
          } else if (credentials.role === 'student') {
            const [rows] = await connection.execute(
              'SELECT stu_buasri as buasri, stu_name as name FROM student WHERE stu_buasri = ?',
              [credentials.buasri]
            );
            if (rows.length > 0) {
              user = { ...rows[0], role: 'student' };
            }
          }

          if (user) {
            // Return a user object for next-auth to create a session
            return { id: user.buasri, name: user.name, role: user.role };
          } else {
            // If no user is found, authorize returns null
            return null;
          }

        } catch (error) {
          console.error("Database error during authorization:", error);
          return null;
        } finally {
          await connection.end();
        }
      },
    }),
  ],

  session: {
    strategy: "jwt",
  },

  callbacks: {
    // Add the role to the JWT token
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    // Add the role to the session object so it's accessible on the client
    async session({ session, token }) {
      if (session?.user) {
        session.user.role = token.role;
      }
      return session;
    },
  },

  pages: {
    // If a user is not logged in, they will be redirected here
    signIn: '/auth/login_Student',
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST } */