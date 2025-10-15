'use client'
/* eslint-disable */
import { useEffect, useRef, useState } from 'react';
import Image from "next/image";
import Link from "next/link";
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [buasri, setBuasri] = useState('');
  const [role, setRole] = useState('student');
  const [show, setShow] = useState(false);
  const [fullName, setFullName] = useState('');
  const [enName, setEnName] = useState('');
  const [major, setMajor] = useState('');
  const [position, setPosition] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
   const previousRole = useRef(role);
  const [isPending, setIsPending] = useState(false);
   const [buasriRegistered, setBuasriRegistered] = useState(false);

  const handleRoleChange = (newRole: 'student' | 'teacher') => {
    setRole(newRole);
     setBuasri('');  // Reset input when switching roles
     setFullName('');
     previousRole.current = newRole;
  };

   // Check if the name is already registered
  const checkIfNameExists = async (buasriValue: string) => {
    try {
      const response = await fetch('/api/check-name', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ buasri: buasriValue, role:role }),
      });
      const data = await response.json();
      setBuasriRegistered(data.exists);
      if (data.exists && data.userData) {
      // Populate your inputs here
      setBuasri(data.userData.stu_buasri || data.userData.staff_buasri);
      // Add more fields as needed
    }
    } catch (error) {
      console.error('Error checking name:', error);
    }
  };
  // Handle Buasri ID change and show additional fields
  const handleBuasriChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setBuasri(value);
    
    // Show additional fields when Buasri ID has at least 3 characters
    if (value.trim().length >= 3) {
      setShow(true);
      await checkIfNameExists(value); // Check if the name is registered

      // Auto-fetch when user enters ID
    if (value.length > 0) {
      try {
        const response = await fetch('/api/check-name', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            buasri: value,
            role: role,
          }),
        });

        const data = await response.json();

        if (data.exists && data.userData) {
          // Get the name field from your database result
          const name = role === 'student' 
            ? data.userData.stu_name // Replace with your actual column name
            : data.userData.staff_name; // Replace with your actual column name
          
          setFullName(name || '');
        } else {
          setFullName(''); // Clear if not found
        }
      } catch (error) {
        console.error('Error:', error);
      }
    } else {
      setFullName(''); // Clear if input is empty
    }
    } else {
      setShow(false);
    }
  };

  const handleBuasriBlur = async () => {
  if (!buasri || previousRole.current !== role) {
      previousRole.current = role;
      return;
    }
  if (buasri) {
    checkIfNameExists(buasri);
    try {
        const response = await fetch('/api/check-name', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            buasri: buasri,
            role: role,
          }),
        });
        const data = await response.json();

        if (data.exists && data.userData) {
          // Get the name field from database
          const name = role === 'student' 
            ? data.userData.stu_name // Replace with your actual column name
            : data.userData.staff_name; // Replace with your actual column name
          
          setFullName(name || '');
        } else {
          setFullName('');
        }
      } catch (error) {
        console.error('Error:', error);
      }
  }
};

useEffect(() => {
  if (buasri) {
    const timer = setTimeout(async () => {
      try {
        const response = await fetch('/api/check-name', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ buasri: buasri, role: 'student' }),
        });

        const data = await response.json();
        if (data.exists && data.userData) {
          setFullName(data.userData.stu_name || ''); // Replace with your column name
        }
      } catch (error) {
        console.error('Error:', error);
      }
    }, 500); // Wait 500ms after user stops typing

    return () => clearTimeout(timer);
  }
}, [buasri]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsPending(true);
    console.log({ buasri, role, fullName, position, email, password });
   try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await response.json();
      alert(data.message); // Show success message
    } catch (error) {
      console.error('Registration error:', error);
      alert('Failed to register');
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
        <h2 className="mb-8 text-xl text-center text-gray-600">
          College of Social Communication Innovation
        </h2>

        {/* Login Form */}
        <div className="space-y-6">
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-600">
              Buasri ID
            </label>
            <input
              type="text"
              value={buasri}
              onChange={handleBuasriChange}
              onBlur={handleBuasriBlur}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter your Buasri ID"
            />
            {buasriRegistered && (
              <p style={{ color: 'green' }}>✓ This ID is registered</p>
              )}

            {!buasriRegistered && buasri && (
            <p style={{ color: 'red' }}>✗ This ID is not found</p>
            )}
          </div>

          {/* Role Selection Buttons */}
          <div className="flex gap-4 mb-6">
            <button
              type="button"
              onClick={() => handleRoleChange('student')}
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
              onClick={() => handleRoleChange('teacher')}
              className={`w-full px-4 py-2 rounded-md transition duration-300 ${
                role === 'teacher'
                  ? 'bg-indigo-500 text-white hover:bg-indigo-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Faculty/Staff
            </button>
          </div>
          {/*show for student*/}
          {show && role === "student" &&(
            <div className="space-y-4 animate-fade-in">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-600">
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter your full name"
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
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-600">
                  English Name
                </label>
                <input
                  type="text"
                  value={enName}
                  onChange={(e) => setEnName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter your english name"
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-600">
                  Major
                </label>
                <input
                  type="text"
                  value={major}
                  onChange={(e) => setMajor(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter your major code i.e. 001"
                />
              </div>
            </div>
          )}
          {/*show for teacher*/}
          {show && role === "teacher" &&(
            <div className="space-y-4 animate-fade-in">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-600">
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter your full name"
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
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-600">
                  Position
                </label>
                <input
                  type="text"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter your position"
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-600">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter your email"
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-600">
                  Phone
                </label>
                <input
                  type="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter your phone"
                />
              </div>
            </div>
          )}
          
          {/* Error Message */}
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

          {/* Login Button */}
          <button
            onClick={handleSubmit}
            className="w-full px-4 py-2 text-white bg-indigo-500 rounded-md hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-700 disabled:opacity-50 transition duration-300"
            disabled={isPending}
          >
            {isPending ? 'Logging in...' : 'Login'}
          </button>
        </div>

        {/* Registration Link */}
        <div className="mt-6 text-center">
         <Link href="/auth/register" className="grid text-center text-indigo-600 justify-items-center hover:text-indigo-800">
            Register
          </Link>
        </div>

        <style jsx>{`
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(-10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .animate-fade-in {
            animation: fadeIn 0.4s ease-out;
          }
        `}</style>
      </div>
    </div>
  );
}