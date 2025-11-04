//app/auth/forget-password
'use client';

import React, { useState } from 'react';
import { Play, Pause, RotateCcw, ChevronRight, Mail, Link, CheckCircle, Code } from 'lucide-react';

export default function PermissionFlowTutorial() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showCode, setShowCode] = useState(false);

  const steps = [
    {
      title: "Step 1: User Requests Password Reset",
      description: "A user enters their email on your forgot password page",
      visual: "user-form",
      code: `// Frontend - User fills out the form
const handleSubmit = async (e) => {
  e.preventDefault();
  // User clicks "Send Reset Link"
}`,
      explanation: "The user fills out a form with their email address and clicks submit."
    },
    {
      title: "Step 2: Frontend Sends Request to API",
      description: "Your form sends the email to your API endpoint",
      visual: "frontend-to-api",
      code: `// When form is submitted
const response = await fetch('/api/forget-password', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    email: 'user@example.com',
    permission: 'Reset Password' 
  })
});`,
      explanation: "The frontend makes a POST request to /api/forget-password with the user's email."
    },
    {
      title: "Step 3: API Generates Token",
      description: "Your API creates a secure token with JWT",
      visual: "generate-token",
      code: `// API creates a secure token
const token = jwt.sign(
  { 
    email: 'user@example.com',
    permission: 'Reset Password',
    timestamp: Date.now() 
  },
  JWT_SECRET,
  { expiresIn: '7d' }
);

// Token looks like:
// "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."`,
      explanation: "JWT creates an encrypted token containing the email and permission. This token expires in 7 days."
    },
    {
      title: "Step 4: API Sends Email",
      description: "The API sends an email with a confirmation link",
      visual: "send-email",
      code: `// API sends email via nodemailer
const confirmLink = 
  'http://localhost:3000/auth/forget-password?token=eyJhbG...';

await transporter.sendMail({
  from: 'noreply@yourapp.com',
  to: 'user@example.com',
  subject: 'Reset Your Password',
  html: \`<a href="\${confirmLink}">Click to Reset Password</a>\`
});`,
      explanation: "Nodemailer sends an email to the user with a link containing the token."
    },
    {
      title: "Step 5: User Clicks Email Link",
      description: "User receives email and clicks the confirmation link",
      visual: "user-clicks",
      code: `// User clicks this link in their email:
http://localhost:3000/auth/forget-password?token=eyJhbG...

// Browser navigates to your confirmation page`,
      explanation: "The user opens their email inbox and clicks the reset password link."
    },
    {
      title: "Step 6: Confirmation Page Loads",
      description: "Your Next.js page extracts the token from URL",
      visual: "page-loads",
      code: `// app/auth/forget-password/page.tsx
              const searchParams = useSearchParams();
              const token = searchParams.get('token');
              token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."`,
      explanation: "The confirmation page reads the token parameter from the URL using useSearchParams()."
    },
    {
      title: "Step 7: Verify Token with API",
      description: "Page sends token back to API for verification",
      visual: "verify-token",
      code: `// Page sends token to API for verification
const response = await fetch('/api/forget-password', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ token })
});`,
      explanation: "The page makes another POST request, this time with the token to verify it."
    },
    {
      title: "Step 8: API Verifies Token",
      description: "API checks if token is valid and not expired",
      visual: "token-verified",
      code: `// API verifies the token
try {
  const decoded = jwt.verify(token, JWT_SECRET);
  // decoded = { email: 'user@example.com', permission: ... }
  
  return { success: true, message: 'Verified!' };
} catch (error) {
  return { success: false, error: 'Invalid token' };
}`,
      explanation: "JWT.verify() checks if the token is valid, not expired, and not tampered with."
    },
    {
      title: "Step 9: Success!",
      description: "User sees success message and can now reset password",
      visual: "success",
      code: `// Frontend shows success
if (data.success) {
  setStatus('success');
  setMessage('Permission confirmed successfully!');
  // Now you can show password reset form
}`,
      explanation: "The user sees a success message. You can now allow them to enter a new password!"
    }
  ];

  const Visual = ({ type }) => {
    const visualStyles = {
      container: "w-full h-64 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg flex items-center justify-center p-8",
      box: "bg-white rounded-lg shadow-lg p-6 border-2",
      arrow: "text-indigo-600 mx-4 animate-pulse"
    };

    const visuals = {
      "user-form": (
        <div className={visualStyles.container}>
          <div className={`${visualStyles.box} border-blue-500`}>
            <div className="text-center">
              <div className="text-4xl mb-4">👤</div>
              <div className="text-sm font-semibold mb-2">User</div>
              <div className="border rounded px-3 py-2 w-48 mb-2 text-sm bg-white text-gray-500">
                email@example.com
              </div>
              <div className="bg-blue-500 text-white px-4 py-2 rounded text-sm w-48">
                Send Reset Link
              </div>
            </div>
          </div>
        </div>
      ),
      "frontend-to-api": (
        <div className={visualStyles.container}>
          <div className={`${visualStyles.box} border-blue-500`}>
            <div className="text-4xl mb-2">💻</div>
            <div className="text-sm font-semibold">Frontend</div>
            <div className="text-xs text-gray-600">your-app.com</div>
          </div>
          <ChevronRight className={visualStyles.arrow} size={40} />
          <div className={`${visualStyles.box} border-green-500`}>
            <div className="text-4xl mb-2">⚙️</div>
            <div className="text-sm font-semibold">API</div>
            <div className="text-xs text-gray-600">/api/forget-password</div>
          </div>
        </div>
      ),
      "generate-token": (
        <div className={visualStyles.container}>
          <div className={`${visualStyles.box} border-green-500 max-w-md`}>
            <div className="text-4xl mb-2 text-center">🔐</div>
            <div className="text-sm font-semibold text-center mb-3">JWT Token Generated</div>
            <div className="bg-gray-100 p-3 rounded text-xs font-mono break-all">
              eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InVzZXJAZXhhbXBsZS5jb20iLCJwZXJtaXNzaW9uIjoiUmVzZXQgUGFzc3dvcmQifQ...
            </div>
            <div className="text-xs text-gray-600 mt-2 text-center">
              ✓ Expires in 7 days
            </div>
          </div>
        </div>
      ),
      "send-email": (
        <div className={visualStyles.container}>
          <div className={`${visualStyles.box} border-green-500`}>
            <div className="text-4xl mb-2">⚙️</div>
            <div className="text-sm font-semibold">API</div>
            <div className="text-xs text-gray-600">Nodemailer</div>
          </div>
          <ChevronRight className={visualStyles.arrow} size={40} />
          <div className={`${visualStyles.box} border-purple-500`}>
            <Mail className="text-purple-500 mb-2" size={40} />
            <div className="text-sm font-semibold">Email Sent</div>
            <div className="text-xs text-gray-600">to: user@example.com</div>
          </div>
        </div>
      ),
      "user-clicks": (
        <div className={visualStyles.container}>
          <div className={`${visualStyles.box} border-purple-500 max-w-sm`}>
            <Mail className="text-purple-500 mb-2 mx-auto" size={40} />
            <div className="text-sm font-semibold mb-3 text-center">Email Inbox</div>
            <div className="bg-white border-2 border-gray-300 rounded p-3">
              <div className="text-xs font-semibold mb-2">Reset Your Password</div>
              <div className="bg-blue-500 text-white px-4 py-2 rounded text-xs w-full text-center animate-pulse">
                Click to Reset Password →
              </div>
            </div>
          </div>
        </div>
      ),
      "page-loads": (
        <div className={visualStyles.container}>
          <div className={`${visualStyles.box} border-orange-500 max-w-md`}>
            <div className="text-4xl mb-2 text-center">🌐</div>
            <div className="text-sm font-semibold text-center mb-3">Browser Navigates</div>
            <div className="bg-gray-100 p-2 rounded text-xs font-mono break-all mb-2">
              localhost:3000/auth/forget-password?token=eyJhbG...
            </div>
            <div className="text-xs text-center text-gray-600">
              ✓ Page extracts token from URL
            </div>
          </div>
        </div>
      ),
      "verify-token": (
        <div className={visualStyles.container}>
          <div className={`${visualStyles.box} border-orange-500`}>
            <div className="text-4xl mb-2">📄</div>
            <div className="text-sm font-semibold">Confirm Page</div>
            <div className="text-xs text-gray-600">Sends token</div>
          </div>
          <ChevronRight className={visualStyles.arrow} size={40} />
          <div className={`${visualStyles.box} border-green-500`}>
            <div className="text-4xl mb-2">⚙️</div>
            <div className="text-sm font-semibold">API</div>
            <div className="text-xs text-gray-600">Verifies token</div>
          </div>
        </div>
      ),
      "token-verified": (
        <div className={visualStyles.container}>
          <div className={`${visualStyles.box} border-green-500 max-w-md`}>
            <div className="text-4xl mb-2 text-center">🔓</div>
            <div className="text-sm font-semibold text-center mb-3">Token Verified!</div>
            <div className="bg-green-50 border-2 border-green-500 p-3 rounded">
              <div className="text-xs mb-1"><span className="font-semibold">Email:</span> user@example.com</div>
              <div className="text-xs mb-1"><span className="font-semibold">Permission:</span> Reset Password</div>
              <div className="text-xs"><span className="font-semibold">Status:</span> ✓ Valid</div>
            </div>
          </div>
        </div>
      ),
      "success": (
        <div className={visualStyles.container}>
          <div className={`${visualStyles.box} border-green-500 max-w-md`}>
            <CheckCircle className="text-green-500 mb-3 mx-auto" size={60} />
            <div className="text-xl font-bold text-center mb-2 text-green-600">Success!</div>
            <div className="text-sm text-center text-gray-700">
              Permission confirmed successfully
            </div>
            <div className="mt-4 bg-green-50 p-3 rounded">
              <div className="text-xs text-center">
                User can now reset their password
              </div>
            </div>
          </div>
        </div>
      )
    };

    return visuals[type] || null;
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setCurrentStep(0);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const reset = () => {
    setCurrentStep(0);
    setIsPlaying(false);
  };

  React.useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        if (currentStep < steps.length - 1) {
          setCurrentStep(prev => prev + 1);
        } else {
          setIsPlaying(false);
        }
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentStep]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-2">
            Password Reset Email Flow Tutorial
          </h1>
          <p className="text-slate-600">
            Understanding how the permission confirmation system works
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
          {/* Progress Bar */}
          <div className="bg-slate-100 px-6 py-3">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-semibold text-slate-700">
                Step {currentStep + 1} of {steps.length}
              </div>
              <div className="text-sm text-slate-600">
                {Math.round(((currentStep + 1) / steps.length) * 100)}% Complete
              </div>
            </div>
            <div className="w-full bg-slate-300 rounded-full h-2">
              <div 
                className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Step Content */}
          <div className="p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-800 mb-2">
                {steps[currentStep].title}
              </h2>
              <p className="text-slate-600">
                {steps[currentStep].description}
              </p>
            </div>

            {/* Visual */}
            <Visual type={steps[currentStep].visual} />

            {/* Explanation */}
            <div className="mt-6 bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
              <div className="flex items-start">
                <div className="text-2xl mr-3">💡</div>
                <div>
                  <div className="font-semibold text-blue-900 mb-1">What's happening?</div>
                  <div className="text-blue-800 text-sm">
                    {steps[currentStep].explanation}
                  </div>
                </div>
              </div>
            </div>

            {/* Code Display */}
            <div className="mt-6">
              <button
                onClick={() => setShowCode(!showCode)}
                className="flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700 mb-3"
              >
                <Code size={18} />
                {showCode ? 'Hide' : 'Show'} Code Example
              </button>
              
              {showCode && (
                <div className="bg-slate-900 text-slate-100 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                  <pre>{steps[currentStep].code}</pre>
                </div>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="bg-slate-50 px-8 py-6 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <button
                onClick={prevStep}
                disabled={currentStep === 0}
                className="px-6 py-2 bg-slate-200 text-slate-700 rounded-lg font-semibold hover:bg-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                ← Previous
              </button>

              <div className="flex gap-3">
                <button
                  onClick={reset}
                  className="p-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-all"
                  title="Reset"
                >
                  <RotateCcw size={20} />
                </button>
                
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all"
                  title={isPlaying ? "Pause" : "Auto Play"}
                >
                  {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                </button>
              </div>

              <button
                onClick={nextStep}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-all"
              >
                {currentStep === steps.length - 1 ? 'Restart' : 'Next →'}
              </button>
            </div>
          </div>
        </div>

        {/* Key Points */}
        <div className="mt-8 grid md:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-3xl mb-3">🔐</div>
            <h3 className="font-bold mb-2">Two API Calls</h3>
            <p className="text-sm text-slate-600">
              First to send email, second to verify token
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-3xl mb-3">⏱️</div>
            <h3 className="font-bold mb-2">Token Expires</h3>
            <p className="text-sm text-slate-600">
              JWT tokens automatically expire after 7 days
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-3xl mb-3">🔗</div>
            <h3 className="font-bold mb-2">URL Parameter</h3>
            <p className="text-sm text-slate-600">
              Token is passed via ?token= in the URL
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}