'use client'
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';

export default function RejectPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!reason.trim()) {
      setMessage('กรุณาระบุเหตุผล');
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch('/api/reject-reservation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, reason })
      });

      if (response.ok) {
        setMessage('✅ ส่งอีเมลปฏิเสธเรียบร้อยแล้ว');
        setTimeout(() => window.close(), 2000);
      } else {
        setMessage('❌ เกิดข้อผิดพลาด');
      }
    } catch (error) {
      setMessage('❌ เกิดข้อผิดพลาด');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Invalid token</div>;
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        maxWidth: '500px',
        width: '100%',
        overflow: 'hidden',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }}>
        <div style={{
          backgroundColor: '#f44336',
          color: 'white',
          padding: '30px',
          textAlign: 'center'
        }}>
          <h1 style={{ margin: 0, fontSize: '24px' }}>ปฏิเสธการจองห้อง</h1>
        </div>

        <div style={{ padding: '30px' }}>
          {message && (
            <div style={{
              padding: '15px',
              marginBottom: '20px',
              borderRadius: '8px',
              backgroundColor: message.includes('✅') ? '#e8f5e9' : '#ffebee',
              color: message.includes('✅') ? '#2e7d32' : '#c62828'
            }}>
              {message}
            </div>
          )}

          <div style={{
            backgroundColor: '#fff3cd',
            padding: '12px',
            marginBottom: '20px',
            borderRadius: '4px',
            fontSize: '13px'
          }}>
            💡 กรุณาระบุเหตุผลในการปฏิเสธ
          </div>

          <form onSubmit={handleSubmit}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: '600'
            }}>
              เหตุผล *
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              placeholder="เช่น: ห้องถูกจองเต็มแล้ว..."
              style={{
                width: '100%',
                minHeight: '120px',
                padding: '12px',
                border: '2px solid #e0e0e0',
                borderRadius: '8px',
                fontSize: '14px',
                fontFamily: 'inherit'
              }}
            />

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button
                type="button"
                onClick={() => window.close()}
                style={{
                  flex: 1,
                  padding: '14px',
                  border: '2px solid #e0e0e0',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  backgroundColor: 'white'
                }}
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                disabled={loading}
                style={{
                  flex: 1,
                  padding: '14px',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  backgroundColor: loading ? '#ccc' : '#f44336',
                  color: 'white'
                }}
              >
                {loading ? 'กำลังส่ง...' : 'ยืนยันปฏิเสธ'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}