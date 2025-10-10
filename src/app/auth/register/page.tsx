'use client'
/* eslint-disable */

// submit form action
//async function submitForm(prevState, formData) {
 // await new Promise((resolve) => setTimeout(resolve, 1500));
//  const email = formData.get("email");
//  if (!email || !email.includes("@")) {
//    return { success: false, message: "Please enter a valid email address." };
//  }
//  return { success: true, message: "Form submitted successfully!" };
//}

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSession, signIn } from "next-auth/react";

export default function RegisterPage() {
  const [buasri, setBuasri] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'student' | 'teacher'>('student');
  const [error, setError] = useState<string>('');
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

 const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!buasri || !password) {
    setError('Please fill in all fields.');
    return;
  }

  setIsPending(true);
  setError('');

  try {
    const result = await signIn('credentials', {
      buasri,
      role,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError('Invalid credentials. Please try again.');
      setIsPending(false);
      return;
    }

    // Add a small delay to ensure session is updated
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Get fresh session
    const session = await getSession();
    console.log('Session after login:', session); // Debug log
    
    if (session?.user) {
      const userRole = (session.user as any).role;
      
      // Redirect based on role
      if (userRole === 'teacher') {
        router.push('/dashboard/admin');
      } else if (userRole === 'student') {
        router.push('/dashboard/student');
      } else {
        // Fallback if role is undefined
        setError('User role not found. Please contact administrator.');
        setIsPending(false);
      }
    } else {
      setError('Failed to retrieve session. Please try again.');
      setIsPending(false);
    }
  } catch (error) {
    setError('An error occurred during login.');
    console.error('Login error:', error);
    setIsPending(false);
  }
};
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-lg p-6 bg-white rounded-lg shadow-lg">　
        <div className="relative flex flex-col items-center justify-center w-full">
          <Image src="/swuEng.png" width={150} height={150} alt="SWU Logo" />
        </div>
        <h2 className="mb-6 text-3xl font-bold text-center text-gray-800">
          {role === 'student' ? 'Student Register' : 'Faculty/Staff Register'}
        </h2>
        <h2 className="mb-6 text-2xl font-semibold text-center">College of Social Communication Innovation</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleLogin}>
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-600">
              Buasri ID
            </label>
            <input
              type="text"
              value={buasri}
              onChange={(e) => setBuasri(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Buasri ID"
              required
            />
          </div>
          
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-600">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter your password"
              required
            />
           
            <Link href="/forget-password" className="grid pt-2 ml-4 text-left text-red-600 justify-items-start hover:text-red-300">
              Forget your password?
            </Link>
          </div>

          {/* Role Selection Buttons */}
          <div className="flex gap-4 mb-6">
            <button
              type="button"
              onClick={() => setRole('student')}
              className={`w-full px-4 py-2 rounded-md transition duration-300 ${
                role === 'student'
                  ? 'bg-indigo-500 text-white hover:bg-indigo-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Student 
            </button>
            <button
              type="button"
              onClick={() => setRole('teacher')}
              className={`w-full px-4 py-2 rounded-md transition duration-300 ${
                role === 'teacher'
                  ? 'bg-indigo-500 text-white hover:bg-indigo-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Faculty/Staff 
            </button>
          </div>

          <div>
            <button
              type="submit"
              className="w-full px-4 py-2 text-white bg-indigo-500 rounded-md hover:bg-indigo-600 focus:outline-none focus:bg-indigo-700 disabled:opacity-50"
              disabled={isPending}
            >
              {isPending ? 'Registering...' : 'Register'}
            </button>
          </div>
           <Link href="/auth/policy" className="grid text-center text-indigo-600 justify-items-center hover:text-indigo-800">
            Login
          </Link>
        </form>
      </div>
    </div>
  );
}