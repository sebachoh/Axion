'use client';

import React, { useState } from 'react';
import { signIn } from "next-auth/react";
import { motion, AnimatePresence } from 'framer-motion';
import { registerUser } from '@/app/actions/authActions';

export default function LoginPage() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    
    if (isRegistering) {
      const res = await registerUser(formData);
      if (res.error) {
        setError(res.error);
      } else {
        setMessage(res.success || null);
        setIsRegistering(false);
      }
    } else {
      const email = formData.get('email') as string;
      const password = formData.get('password') as string;

      try {
        const result = await signIn('credentials', {
           email,
           password,
           redirect: true,
           redirectTo: '/'
        });
      } catch (err: any) {
        // Auth.js throws errors as strings/objects if they fail
        setError("Credenciales inválidas o correo no verificado.");
      }
    }
    setLoading(false);
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '2rem',
      position: 'relative',
      overflow: 'hidden',
      background: '#000'
    }}>
      {/* Immersive Background */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        background: 'url(https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop) center/cover no-repeat',
        opacity: 0.4,
        zIndex: 0
      }} />
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        background: 'radial-gradient(circle at center, transparent 0%, #000 90%)',
        zIndex: 1
      }} />

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="glass-panel" 
        style={{ 
          width: '100%', 
          maxWidth: '480px', 
          padding: '4rem 3rem', 
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          gap: '3rem',
          zIndex: 10,
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 40px 100px -20px rgba(0,0,0,0.8)',
          backdropFilter: 'blur(40px)'
        }}
      >
        <header style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px' }}>
            <div style={{ width: '45px', height: '45px', background: '#fff', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(255,255,255,0.2)' }}>
               <div style={{ width: '22px', height: '22px', background: '#000', borderRadius: '3px' }} />
            </div>
            <h1 style={{ fontSize: '3rem', fontWeight: 900, letterSpacing: '-0.07em', color: '#fff' }}>Axion</h1>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem', letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 600 }}>Soberanía Digital</p>
        </header>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <AnimatePresence mode="wait">
            {isRegistering && (
              <motion.input
                key="name"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                type="text"
                name="name"
                placeholder="Nombre Completo"
                required
                style={{
                  width: '100%', padding: '16px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)', color: '#fff', fontSize: '0.95rem', outline: 'none'
                }}
              />
            )}
          </AnimatePresence>

          <input
            type="email"
            name="email"
            placeholder="Correo Electrónico"
            required
            style={{
              width: '100%', padding: '16px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)', color: '#fff', fontSize: '0.95rem', outline: 'none'
            }}
          />
          
          <input
            type="password"
            name="password"
            placeholder="Contraseña"
            required
            style={{
              width: '100%', padding: '16px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)', color: '#fff', fontSize: '0.95rem', outline: 'none'
            }}
          />

          {error && <p style={{ color: '#ff6b6b', fontSize: '0.85rem', fontWeight: 600 }}>{error}</p>}
          {message && <p style={{ color: '#1dd1a1', fontSize: '0.85rem', fontWeight: 600 }}>{message}</p>}

          <button 
            type="submit"
            disabled={loading}
            className="glass-button"
            style={{ 
              marginTop: '1rem', padding: '18px', background: '#fff', color: '#000', fontWeight: 800,
              fontSize: '1rem', borderRadius: '14px', transition: 'all 0.3s ease', cursor: loading ? 'wait' : 'pointer'
            }}
          >
            {loading ? 'Procesando...' : (isRegistering ? 'Crear Cuenta' : 'Entrar al Sistema')}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '1rem 0' }}>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
            <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.2)', fontWeight: 700 }}>O</span>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
          </div>

          <button 
            type="button"
            onClick={() => signIn('google', { redirectTo: '/' })}
            style={{ 
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
              padding: '16px', background: 'rgba(255,255,255,0.03)', color: '#fff', fontWeight: 600,
              fontSize: '0.9rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', transition: 'all 0.3s ease', cursor: 'pointer'
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
            onMouseOut={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.909 3.33-1.848 4.41-1.332 1.332-3.09 2.45-6 2.45-5.1 0-9-3.9-9-9s3.9-9 9-9c2.82 0 4.68 1.1 5.94 2.22l2.31-2.31C18.3 1.25 15.65 0 12.18 0 5.48 0 0 5.48 0 12.18s5.48 12.18 12.18 12.18c3.5 0 6.13-1.15 8.16-3.23 2.1-2.1 2.77-5.07 2.77-7.44 0-.74-.06-1.42-.18-2.07l-10.45.3z" fill="currentColor"/>
            </svg>
            Google
          </button>
        </form>

        <footer style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <button 
            type="button"
            onClick={() => setIsRegistering(!isRegistering)}
            style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', cursor: 'pointer', textDecoration: 'underline' }}
          >
            {isRegistering ? '¿Ya tienes cuenta? Inicia Sesión' : '¿No tienes cuenta? Regístrate'}
          </button>
          <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.15)', letterSpacing: '0.05em', marginTop: '1rem' }}>AXION ECOSYSTEM © 2026</p>
        </footer>
      </motion.div>
    </div>
  );
}
