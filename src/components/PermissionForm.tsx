// app/components/PermissionForm.tsx
'use client';

import { useState } from 'react';

export default function PermissionForm() {
  const [email, setEmail] = useState('');
  const [permission, setPermission] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/send-permission', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, permission }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage('Permission email sent successfully!');
        setEmail('');
        setPermission('');
      } else {
        setMessage('Failed to send email. Please try again.');
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: '400px', margin: '0 auto' }}>
      <div style={{ marginBottom: '15px' }}>
        <label>Email:</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ width: '100%', padding: '8px' }}
        />
      </div>
      <div style={{ marginBottom: '15px' }}>
        <label>Permission:</label>
        <input
          type="text"
          value={permission}
          onChange={(e) => setPermission(e.target.value)}
          required
          style={{ width: '100%', padding: '8px' }}
        />
      </div>
      <button 
        type="submit" 
        disabled={loading}
        style={{ width: '100%', padding: '10px' }}
      >
        {loading ? 'Sending...' : 'Send Permission Request'}
      </button>
      {message && <p style={{ marginTop: '15px' }}>{message}</p>}
    </form>
  );
}
