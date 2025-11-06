// app/auth/forget-password/page.tsx
/* eslint-disable */
'use client'
import Link from "next/link";
import Image from "next/image";
import React, { useState } from 'react';

const PasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string>('');
  const [isPending, setIsPending] = useState(false);
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setError('Please fill in all fields.');
      return;
    }

    setIsPending(true);
    setError('');
    setSuccess('');

    try {
        const response = await fetch('/api/forget-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email })
        });
       
        if (!response.ok) {
            throw new Error('Error sending reset link');
        }
        
        setSuccess('Reset link sent to your email!');
    } catch (error) {
        setError('Error sending reset link');
    } finally {
        setIsPending(false);
    }
  }; // <-- This closes handleSubmit properly

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-lg p-8 bg-white rounded-lg shadow-md">
       
        <div className="relative flex flex-col items-center justify-center w-full mb-6">
          <Image src="/swuEng.png" width={150} height={150} alt="SWU Logo" />
        </div>
        
        <h1 className="mb-6 text-3xl font-bold text-center text-gray-800">
          Please send email
        </h1>
       
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter your email"
              required
            />
          </div>
          
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          {success && <p className="mt-2 text-sm text-green-600">{success}</p>}
          
          <button
            type="submit"
            className="w-full px-4 py-2 text-white bg-indigo-500 rounded-md hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-700 disabled:opacity-50 transition duration-300"
            disabled={isPending}
          >
            {isPending ? 'Sending...' : 'Send Email'}
          </button>
        </form>
       
        <div className="mt-6 text-center">
          <Link href="/auth/login" className="text-sm text-indigo-500 hover:text-indigo-700 transition duration-300">
             Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PasswordPage;