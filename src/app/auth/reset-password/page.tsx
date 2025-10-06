// app/reset-password/page.tsx
'use client'
import Link from "next/link";
import Image from "next/image";
import React, { useState } from 'react';
import { signIn, getSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

const PasswordPage: React.FC = () => {
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'student' | 'teacher'>('student');
  const [error, setError] = useState<string>('');
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password) {
      setError('Please fill in all fields.');
      return;
    }

    setIsPending(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid credentials. Please try again.');
      } else {
        // Get the session to check user role and redirect accordingly
        const session = await getSession();
        if (session?.user) {
          const userRole = (session.user as any).role;
          
          // Redirect based on role
          if (userRole === 'student') {
            router.push('/dashboard/student');
          } else if (userRole === 'teacher') {
            router.push('/dashboard/admin');
          }
        }
      }
    } catch (error) {
      setError('An error occurred during login.');
      console.error('Login error:', error);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-lg p-8 bg-white rounded-lg shadow-md">
       
        <div className="relative flex flex-col items-center justify-center w-full mb-6">
          <Image src="/swuEng.png" width={150} height={150} alt="SWU Logo" />
        </div>

     
        
       <h1 className="mb-6 text-3xl font-bold text-center text-gray-800">
         Set the password
        </h1>

       
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            {/*<div>{session?.user.name}</div> */}
            <input
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter your password"
              required
            />
          </div>

          
          
         
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

          
          <button
            type="submit"
            className="w-full px-4 py-2 text-white bg-indigo-500 rounded-md hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-700 disabled:opacity-50 transition duration-300"
            disabled={isPending}
          >
            {isPending ? 'Logging in...' : 'Login'}
          </button>
        </form>

       
        <div className="mt-6 text-center">
          <Link href="/auth/login" className="text-sm text-indigo-500 hover:text-indigo-700 transition duration-300">
             Back
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PasswordPage;

