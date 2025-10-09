// app/login/page.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import React, { useState } from 'react';
import { signIn, getSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

const LoginPage: React.FC = () => {
  const [buasri, setBuasri] = useState('');
  const [role, setRole] = useState<'student' | 'teacher'>('student');
  const [error, setError] = useState<string>('');
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

const handleRegister = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsPending(true);
  setError('');
  try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role, input:buasri }),
      });

      const data = await response.json();
      

    if (data.exists) {
      setError('already registered.'); // Redirect ไปยังหน้าหลักหลังจาก login สำเร็จ
    } else {
      setError('Invalid Buasri ID or role');
    }
    } catch (error) {
    console.error('Error checking input:', error);
    setError('An error occurred. Please try again.');
  } finally {
    setIsPending(false);
  }
};

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-lg p-8 bg-white rounded-lg shadow-md">
        {/* Logo */}
        <div className="relative flex flex-col items-center justify-center w-full mb-6">
          <Image src="/swuEng.png" width={150} height={150} alt="SWU Logo" />
        </div>

        {/* Title */}
        <h1 className="mb-6 text-3xl font-bold text-center text-gray-800">
          {role === 'student' ? 'Student Login' : 'Faculty/Staff Login'}
        </h1>
        <h2 className="mb-8 text-xl text-center text-gray-600">College of Social Communication Innovation</h2>

        {/* Login Form */}
        <form onSubmit={handleRegister} className="space-y-6">
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-600">Buasri ID</label>
            <input
              type="text"
              value={buasri}
              onChange={(e) => setBuasri(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter your Buasri ID"
              required
            />
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

          {/* Error Message */}
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

          {/* Login Button */}
          <button
            type="submit" 
            className="w-full px-4 py-2 text-white bg-indigo-500 rounded-md hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-700 disabled:opacity-50 transition duration-300"
            disabled={isPending}
          >
            {isPending ? 'Logging in...' : 'Login'}
          </button>
        </form>

        {/* Registration Link */}
        <div className="mt-6 text-center">
          <Link href="/auth/register" className="text-sm text-indigo-500 hover:text-indigo-700 transition duration-300">
             Register here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;