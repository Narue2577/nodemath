'use client'
/* eslint-disable */
import { useEffect, useState } from 'react';
import Image from "next/image";
import Link from "next/link";
import { Eye, EyeOff, Check, X } from 'lucide-react';

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [buasri, setBuasri] = useState('naruesorn');
  const [role, setRole] = useState<'student' | 'teacher'>('teacher');
  const [fullName, setFullName] = useState('นายนฤสรณ์ อริยสกุลวงศ์');
  const [enName, setEnName] = useState('');
  const [major, setMajor] = useState('');
  const [position, setPosition] = useState('นักวิชาการคอมพิวเตอร์');
  const [email, setEmail] = useState('naruesorn@g.swu.ac.th');
  const [phone, setPhone] = useState('089-496-5747');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isPending, setIsPending] = useState(false);
  const [buasriRegistered, setBuasriRegistered] = useState(true);
  const [passwordError, setPasswordError] = useState('');
  const [showPopup, setShowPopup] = useState(true);
  const [isBuasriValidated, setIsBuasriValidated] = useState(true);
   const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleRoleChange = (newRole: 'student' | 'teacher') => {
    setRole(newRole);
    setBuasri('naruesorn');
    setFullName('นายนฤสรณ์ อริยสกุลวงศ์');
    setEnName('');
    setMajor('');
    setPosition('นักวิชาการคอมพิวเตอร์');
    setEmail('naruesorn@g.swu.ac.th');
    setPhone('089-496-5747');
    setPassword('');
    setConfirmPassword('');
    setBuasriRegistered(true);
    setError('');
    setIsBuasriValidated(true);
    setStep(1);
  };

  const validatePassword = (pass: string) => {
    if (pass.length < 8 || pass.length > 15) {
      return 'Password must be between 8-15 characters';
    }
    if (!/[A-Z]/.test(pass)) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!/[a-z]/.test(pass)) {
      return 'Password must contain at least one lowercase letter';
    }
    if (!/[0-9]/.test(pass)) {
      return 'Password must contain at least one number';
    }
    return '';
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    const error = validatePassword(newPassword);
    setPasswordError(error);
  };

  const handleRegisterClick = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setStep(2);
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    const passError = validatePassword(password);
    if (passError) {
      setPasswordError(passError);
      return;
    }
    setIsPending(true);
    // TODO: Call your API here
    console.log({
      role,
      buasri,
      fullName,
      enName,
      major,
      position,
      email,
      phone,
      password,
    });
    setIsPending(false);
    alert('Registration successful!');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      {/* Privacy Policy Popup */}
      {showPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 animate-fade-in">
          <div className="relative w-full max-w-4xl p-8 mx-4 bg-white rounded-lg shadow-2xl animate-slide-up max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowPopup(false)}
              className="absolute text-gray-400 transition-colors duration-200 top-4 right-4 hover:text-gray-600"
              aria-label="Close"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="text-center">
              <div className="p-4">
                <h2 className="mb-6 text-5xl font-bold">นโยบายการคุ้มครองข้อมูลส่วนบุคคล</h2>
                <h2 className="mb-6 text-5xl font-bold">(Privacy Policy)</h2>
              </div>
              <div className="p-2 text-left">
                <h5 className="mb-4">
                  เราเคารพสิทธิความเป็นส่วนตัวและความปลอดภัยของข้อมูลส่วนบุคคลของท่าน ขณะที่ท่านเข้าใช้บริการเว็บไซต์นี้ เราจะจัดการ ควบคุม และรักษาข้อมูลของท่านอย่างเหมาะสม เพื่อให้ท่านมั่นใจได้ว่าข้อมูลส่วนบุคคลที่ท่านให้ไว้จะถูกนำไปใช้ตรงตามวัตถุประสงค์และถูกต้องตามกฎหมาย
                </h5>
                <div className="mb-6">
                  <h3 className="text-xl font-bold mb-2 text-left">1. การเก็บรวบรวม ใช้ และ/หรือ เปิดเผยข้อมูลส่วนบุคคล</h3>
                  <ul className="list-disc ml-5 space-y-1 text-left">
                    <li>ข้อมูลที่บ่งชี้ตัวตน ได้แก่ ชื่อ-นามสกุล, ตำแหน่งงาน</li>
                    <li>ข้อมูลการติดต่อ ได้แก่ หมายเลขโทรศัพท์, อีเมล</li>
                    <li>ข้อมูลการเข้าใช้งานเว็บไซต์ ได้แก่ ประวัติการเข้าใช้งาน, ชื่อผู้ใช้</li>
                  </ul>
                </div>
                <div className="mb-6">
                  <h3 className="text-xl font-bold mb-2 text-left">2. ช่องทางการรับข้อมูลส่วนบุคคลของท่าน</h3>
                  <ul className="list-disc ml-5 space-y-1 text-left">
                    <li>เราได้รับข้อมูลส่วนบุคคลของท่านจากมหาวิทยาลัย</li>
                    <li>เราได้รับข้อมูลส่วนบุคคลจากท่านโดยตรงจากการที่ท่านเข้าใช้บริการ</li>
                  </ul>
                </div>
                <div className="pb-8">
                  <h5>ท่านสามารถดูรายละเอียดเพิ่มเติมได้ที่ <a href="https://pdpa.swu.ac.th/" className="text-indigo-600 hover:underline">pdpa.swu.ac.th</a></h5>
                  <h5>ระบบจองห้องเรียนและที่นั่งคอมพิวเตอร์ วิทยาลัยนวัตกรรมสื่อสารสังคม มหาวิทยาลัยศรีนครินทรวิโรฒ</h5>
                </div>
              </div>
              <button
                onClick={() => setShowPopup(false)}
                className="w-full px-6 py-3 text-white transition duration-300 bg-indigo-500 rounded-md hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-700"
              >
                ทราบครับ
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="w-full max-w-lg p-8 bg-white rounded-lg shadow-md">
        {/* Logo */}
        <div className="relative flex flex-col items-center justify-center w-full mb-6">
          <Image src="/swuEng.png" width={150} height={150} alt="SWU Logo" />
        </div>

        {/* Title */}
        <h1 className="mb-6 text-3xl font-bold text-center text-gray-800">
          {role === 'student' ? 'Student Register' : 'Faculty/Staff Register'}
        </h1>
        <h2 className="mb-8 text-xl text-center text-gray-600">
          College of Social Communication Innovation
        </h2>

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

        {/* Step 1: Buasri ID Input */}
        {step === 1 && (
          <form onSubmit={handleRegisterClick} className="space-y-4">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-600">
                {role === 'student' ? (
                  <>
                    Student ID
                  </>
                ) : (
                  <>
                   Buasri ID
                  </>
                )}
              </label>
              <input
                type="text"
                value={buasri}
                onChange={(e) => setBuasri(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter your Buasri ID"
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button
              type="submit"
              className="w-full px-4 py-2 text-white bg-indigo-500 rounded-md hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-700 disabled:opacity-50 transition duration-300"
              disabled={!buasri}
            >
              Register
            </button>
          </form>
        )}

        {/* Step 2: Full Info + Password */}
        {step === 2 && (
          <form onSubmit={handleFinalSubmit} className="space-y-4 animate-fade-in">
            {/* Display auto-filled information */}
            <div className="p-4 mb-4 bg-gray-50 rounded-md">
              <h3 className="mb-3 text-lg font-semibold text-gray-700">Your Information</h3>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">Buasri ID:</span> {buasri}</p>
                <p><span className="font-medium">Full Name:</span> {fullName}</p>
                {role === 'student' ? (
                  <>
                    <p><span className="font-medium">English Name:</span> {enName}</p>
                    <p><span className="font-medium">Major:</span> {major}</p>
                  </>
                ) : (
                  <>
                    <p><span className="font-medium">Position:</span> {position}</p>
                    <p><span className="font-medium">Email:</span> {email}</p>
                    <p><span className="font-medium">Phone:</span> {phone}</p>
                  </>
                )}
              </div>
            </div>

            {/* Editable Input Fields */}
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
            {role === 'teacher' && (
              <>
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
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter your phone number"
                  />
                </div>
              </>
            )}

            {/* Password Fields */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-600">
                Password *
              </label>
              <input
                type="password"
                value={password}
                onChange={handlePasswordChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter password (8-15 characters)"
              />
              {passwordError && <p className="mt-1 text-xs text-red-600">{passwordError}</p>}
              <p className="mt-1 text-xs text-gray-500">
                Must contain: 8-15 characters, uppercase, lowercase, and number
              </p>
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-600">
                Confirm Password *
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Re-enter your password"
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 transition duration-300"
              >
                Back
              </button>
              <button
                type="submit"
                className="w-full px-4 py-2 text-white bg-indigo-500 rounded-md hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-700 disabled:opacity-50 transition duration-300"
                disabled={isPending || passwordError !== '' || !password || !confirmPassword}
              >
                {isPending ? 'Registering...' : 'Complete Registration'}
              </button>
            </div>
          </form>
        )}

        {/* Registration Link */}
        <div className="mt-6 text-center">
          <Link href="/auth/login" className="grid text-center text-indigo-600 justify-items-center hover:text-indigo-800">
            Login (Already have an account?)
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
          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .animate-slide-up {
            animation: slideUp 0.4s ease-out;
          }
          .animate-fade-in {
            animation: fadeIn 0.4s ease-out;
          }
          input:focus {
            box-shadow: none !important;
            outline: none !important;
          }
        `}</style>
      </div>
    </div>
  );
}
