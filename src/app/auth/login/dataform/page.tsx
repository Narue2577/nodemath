"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';

const RegisterDetailsPage: React.FC = () => {
  const searchParams = useSearchParams();
  const buasri = searchParams.get('buasri');
  const role = searchParams.get('role');
  const [id, setID] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [position, setPosition] = useState('');
  const [phone, setPhone] = useState('');
  const [group, setGroup] = useState('');
  const [advisor, setAdvisor] = useState('');

  const [error, setError] = useState<string>('');
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);
    setError('');

    try {
      // ส่งข้อมูลไปยัง API เพื่อบันทึกลงฐานข้อมูล
      const response = await fetch('/api/auth/login/insertData', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
        id,
        buasri,
        fullName,
        email,
        password,
        position,
        phone,
        group,
        advisor,
        role, // Include the role
      }),
      });

      //const data = await response.json();  Parse the response as JSON

      if (response.ok) {
        router.push('/dashboard'); // Redirect ไปหน้าหลักหลังจากบันทึกข้อมูลสำเร็จ
      } else {
        setError('Failed to save details. Please try again.');
      }
    } catch (error) {
      console.error('Save error:', error);
      console.error('API error:');
      setError( 'An error occurred. Please try again.');
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-lg p-8 bg-white rounded-lg shadow-md">
        {/* Title */}
        <h1 className="mb-6 text-3xl font-bold text-center text-gray-800">Fill your data</h1>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
         <div>
            <label className="block mb-2 text-sm font-medium text-gray-600">ID</label>
            <input
              type="text"
              value={id}
              onChange={(e) => setID(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter your ID"
              required
            />
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-600">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter your full name"
              required
            />
          </div>

          { role === 'teacher' && <div>
            <label className="block mb-2 text-sm font-medium text-gray-600">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter your email"
              required
            />
          </div>}
         
         <div>
            <label className="block mb-2 text-sm font-medium text-gray-600">Password</label>
            <input
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter your password"
              required
            />
          </div>

          { role === 'teacher' && <div>
            <label className="block mb-2 text-sm font-medium text-gray-600">Position</label>
            <input
              type="text"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter your position"
              required
            />
          </div>}

          { role === 'teacher' &&<div>
            <label className="block mb-2 text-sm font-medium text-gray-600">Phone</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter your telephone"
              required
            />
          </div>}

          { role === 'student' &&<div>
            <label className="block mb-2 text-sm font-medium text-gray-600">Group</label>
            <input
              type="text"
              value={group}
              onChange={(e) => setGroup(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter your group"
              required
            />
          </div>}

          { role === 'student' &&<div>
            <label className="block mb-2 text-sm font-medium text-gray-600">Advisor (Coded)</label>
            <input
              type="number"
              value={advisor}
              onChange={(e) => setAdvisor(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter your advisor"
              required
            />
          </div>}

          {/* Error Message */}
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

          {/* Submit Button */}
          <button
            type="submit" 
            className="w-full px-4 py-2 text-white bg-indigo-500 rounded-md hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-700 disabled:opacity-50 transition duration-300"
            disabled={isPending}
          >
            {isPending ? 'Saving...' : 'Submit'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterDetailsPage;