import NextAuth from "next-auth";
 // Optional: Move config to a separate file

const handler = NextAuth({
  providers: [
    // Add your authentication providers here (e.g., Credentials, Google, etc.)
  ],
  pages: {
    signIn: "/auth/login", // Default login page for all users
  },
  callbacks: {
    async redirect({ url, baseUrl }) {
      console.log('NextAuth redirect callback:', { url, baseUrl });
      
      // Allow dynamic redirection based on user roles or other conditions
      if (url.startsWith(baseUrl)) return url;
      return baseUrl;
    },
  },
});

export { handler as GET, handler as POST };
/*import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // Add your logic to validate the user (e.g., check database)
        if (credentials?.email === 'user@example.com' && credentials.password === 'password') {
          return { id: 1, name: 'User', email: 'user@example.com' };
        }
        return null;
      },
    }),
  ],
  pages: {
    signIn: '/auth/register',
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };*/