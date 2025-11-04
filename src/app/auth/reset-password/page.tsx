'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function ConfirmPermission() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      setMessage('Invalid confirmation link');
      return;
    }

    confirmPermission(token);
  }, [searchParams]);

  const confirmPermission = async (token: string) => {
    try {
      const response = await fetch('/api/confirm-permission', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (data.success) {
        setStatus('success');
        setMessage('Permission confirmed successfully!');
      } else {
        setStatus('error');
        setMessage(data.error || 'Failed to confirm permission');
      }
    } catch (error) {
      setStatus('error');
      setMessage('An error occurred. Please try again.');
    }
  };

  return (
    <div style={{ 
      maxWidth: '600px', 
      margin: '50px auto', 
      padding: '20px',
      textAlign: 'center' 
    }}>
      {status === 'loading' && <p>Confirming your permission...</p>}
      {status === 'success' && (
        <div style={{ color: 'green' }}>
          <h2>✓ Success</h2>
          <p>{message}</p>
        </div>
      )}
      {status === 'error' && (
        <div style={{ color: 'red' }}>
          <h2>✗ Error</h2>
          <p>{message}</p>
        </div>
      )}
    </div>
  );
}