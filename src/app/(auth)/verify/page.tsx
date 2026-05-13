'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { verifyEmail } from '@/app/actions/authActions';
import Link from 'next/link';
import { motion } from 'framer-motion';

function VerifyContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (token) {
      verifyEmail(token).then((res) => {
        if (res.success) {
          setStatus('success');
          setMessage(res.success);
        } else {
          setStatus('error');
          setMessage(res.error || 'Algo salió mal');
        }
      });
    } else {
      setStatus('error');
      setMessage('Token ausente.');
    }
  }, [token]);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-panel"
      style={{ padding: '3rem', textAlign: 'center', maxWidth: '400px', width: '100%' }}
    >
      {status === 'loading' && <p style={{ opacity: 0.5 }}>Verificando tu cuenta...</p>}
      {status === 'success' && (
        <>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1rem' }}>¡Verificado!</h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '2rem' }}>{message}</p>
          <Link href="/login" className="glass-button" style={{ padding: '12px 24px', background: '#fff', color: '#000', fontWeight: 700, borderRadius: '8px' }}>
            Ir al Login
          </Link>
        </>
      )}
      {status === 'error' && (
        <>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1rem', color: '#ff6b6b' }}>Error</h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '2rem' }}>{message}</p>
          <Link href="/login" style={{ color: '#fff', fontSize: '0.9rem', textDecoration: 'underline' }}>
            Volver al Login
          </Link>
        </>
      )}
    </motion.div>
  );
}

export default function VerifyPage() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'radial-gradient(circle at center, #1a1a1a 0%, #000 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem'
    }}>
      <Suspense fallback={<div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', maxWidth: '400px', width: '100%' }}><p style={{ opacity: 0.5 }}>Cargando verificación...</p></div>}>
        <VerifyContent />
      </Suspense>
    </div>
  );
}
