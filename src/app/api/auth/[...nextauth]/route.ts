// src/app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import mysql from 'mysql2/promise';
const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        buasri: { label: "Buasri ID", type: "text" },
        role: { label: "Role", type: "text" }
      },
      async authorize(credentials) {
        if (!credentials?.buasri || !credentials?.role) {
          return null
        }

         
        const connection = await mysql.createConnection({
                host: 'localhost',      
                user: 'root',
                password: 'Ertnom35!',
                database: 'cosci_system'
            });

        const [mockUsers] = await connection.execute(
      'SELECT staff_id AS id, staff_buasri AS buasri, "teacher" AS role, staff_name AS name FROM staff WHERE staff_buasri !="NULL" UNION SELECT stu_id, stu_buasri, "student" AS role,stu_name FROM student',
    );
    const mockUsersArray = Object.values(mockUsers);
        // TODO: Replace with your actual authentication logic
        // This is just a mock - you'll need to verify against your database
        //const mockUsers = [
         // { id: "1", buasri: "66130500000", role: "student", name: "John Doe" },
         // { id: "2", buasri: "T001", role: "teacher", name: "Jane Smith" }
       // ]

        const user = mockUsersArray.find(
          u => u.buasri === credentials.buasri && u.role === credentials.role
        )

        if (user) {
          return {
            id: user.id,
            name: user.name,
            buasri: user.buasri, // Using buasri as email for now
            role: user.role
          }
        }
        
        return null
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        (session.user as any).role = token.role
      }
      return session
    }
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
})

export { handler as GET, handler as POST }