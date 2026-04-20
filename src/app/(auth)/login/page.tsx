'use client';

import React, { useState } from 'react';
import { signIn } from "next-auth/react";
import { motion, AnimatePresence } from 'framer-motion';
import { registerUser, authenticate } from '@/app/actions/authActions';

type Lang = 'es' | 'en' | 'fr';

const TRANSLATIONS = {
  es: {
    title: 'Axion',
    login: 'Ingresar',
    signup: 'Crear Cuenta',
    email: 'Email',
    password: 'Contraseña',
    name: 'Nombre',
    google: 'Continuar con Google',
    toSignup: '¿No tienes cuenta? Regístrate',
    toLogin: '¿Ya tienes cuenta? Inicia Sesión',
    footer: 'AXION SYSTEM v2.0',
    processing: 'Procesando...',
  },
  en: {
    title: 'Axion',
    login: 'Access System',
    signup: 'Sign Up',
    email: 'Email',
    password: 'Password',
    name: 'Name',
    google: 'Continue with Google',
    toSignup: 'New to Axion? Create Account',
    toLogin: 'Already have an account? Login',
    footer: 'AXION SYSTEM v2.0',
    processing: 'Processing...',
  },
  fr: {
    title: 'Axion',
    login: 'Connexion',
    signup: "S'inscrire",
    email: 'E-mail',
    password: 'Mot de passe',
    name: 'Nom',
    google: 'Continuer avec Google',
    toSignup: 'Nouveau sur Axion ? Créer un compte',
    toLogin: 'Vous avez déjà un compte ? Connexion',
    footer: 'AXION SYSTEM v2.0',
    processing: 'Traitement...',
  }
};

export default function LoginPage() {
  const [lang, setLang] = useState<Lang>('es');
  const t = TRANSLATIONS[lang];

  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

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
      try {
        const res = await authenticate(formData);
        if (res?.error) {
          setError(res.error);
        }
      } catch (err: any) {
        // En Next.js 15, signIn en Server Actions lanza un error para redireccionar
        // Si llegamos aquí y no es un error de redirección, es un fallo inesperado
        if (err.message !== 'NEXT_REDIRECT') {
          setError("Error inesperado al iniciar sesión.");
        }
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
      background: 'radial-gradient(circle at center, #1a1a1a 0%, #000 100%)',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      {/* Background Polish */}
      <div style={{ 
        position: 'absolute', 
        inset: 0, 
        background: 'linear-gradient(135deg, rgba(255,255,255,0.02) 0%, transparent 50%, rgba(0,0,0,0.5) 100%)', 
        zIndex: 1 
      }} />

      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        style={{ 
          width: '100%', 
          maxWidth: '440px', 
          padding: '4rem 3.5rem', 
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          gap: '3rem',
          zIndex: 10,
          background: 'rgba(255, 255, 255, 0.01)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          borderRadius: '32px',
          boxShadow: '0 50px 100px -20px rgba(0,0,0,0.9)',
          backdropFilter: 'blur(30px)'
        }}
      >
        <header style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
          <motion.img 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            src="/LogoBlanco.png" 
            alt="Axion Logo" 
            style={{ width: '32px', height: '32px', objectFit: 'contain', opacity: 0.9 }} 
          />
          <h1 style={{ fontSize: '2.2rem', fontWeight: 700, letterSpacing: '-0.04em', color: '#fff', margin: 0 }}>{t.title}</h1>
          
          {/* Language Switcher with Flags */}
          <div style={{ display: 'flex', gap: '1rem', marginTop: '-0.5rem' }}>
            {(['es', 'en', 'fr'] as Lang[]).map((l) => {
              const flags = { es: '🇪🇸', en: '🇬🇧', fr: '🇫🇷' };
              return (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  style={{
                    background: 'none', 
                    border: 'none', 
                    fontSize: '1.2rem', 
                    cursor: 'pointer',
                    opacity: lang === l ? 1 : 0.3,
                    filter: lang === l ? 'none' : 'grayscale(1)',
                    transition: 'all 0.2s ease',
                    padding: '4px'
                  }}
                >
                  {flags[l]}
                </button>
              );
            })}
          </div>
        </header>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <AnimatePresence mode="wait">
            {isRegistering && (
              <motion.div
                key="name-container"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
              >
                <input
                  type="text"
                  name="name"
                  placeholder={t.name}
                  required
                  style={{
                    width: '100%', padding: '16px 20px', borderRadius: '16px', background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)', color: '#fff', fontSize: '0.9rem', outline: 'none'
                  }}
                />
                <div style={{ width: '30px', height: '1px', background: 'rgba(255,255,255,0.1)', margin: '0.5rem auto' }} />
              </motion.div>
            )}
          </AnimatePresence>

          <input
            type="email"
            name="email"
            placeholder={t.email}
            required
            style={{
              width: '100%', padding: '16px 20px', borderRadius: '16px', background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)', color: '#fff', fontSize: '0.9rem', outline: 'none'
            }}
          />
          
          <div style={{ position: 'relative' }}>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder={t.password}
              required
              style={{
                width: '100%', padding: '16px 20px', borderRadius: '16px', background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)', color: '#fff', fontSize: '0.9rem', outline: 'none'
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '15px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: 'rgba(255,255,255,0.3)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                padding: '5px'
              }}
            >
              {showPassword ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
              )}
            </button>
          </div>

          {error && <p style={{ color: '#ff6b6b', fontSize: '0.8rem', fontWeight: 500, margin: '0.5rem 0' }}>{error}</p>}
          {message && <p style={{ color: '#1dd1a1', fontSize: '0.8rem', fontWeight: 500, margin: '0.5rem 0' }}>{message}</p>}

          <button 
            type="submit"
            disabled={loading}
            style={{ 
              marginTop: '1.5rem', padding: '18px', background: '#fff', color: '#000', fontWeight: 700,
              fontSize: '0.9rem', borderRadius: '16px', transition: 'all 0.2s ease', cursor: loading ? 'wait' : 'pointer',
              border: 'none'
            }}
          >
            {loading ? t.processing : (isRegistering ? t.signup : t.login)}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '1rem 0' }}>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.05)' }} />
            <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.15)', fontWeight: 700, textTransform: 'uppercase' }}>or</span>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.05)' }} />
          </div>

          <button 
            type="button"
            onClick={() => signIn('google', { callbackUrl: '/' })}
            style={{ 
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
              padding: '16px', background: 'transparent', color: 'rgba(255,255,255,0.5)', fontWeight: 600,
              fontSize: '0.85rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', transition: 'all 0.2s ease', cursor: 'pointer'
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.909 3.33-1.848 4.41-1.332 1.332-3.09 2.45-6 2.45-5.1 0-9-3.9-9-9s3.9-9 9-9c2.82 0 4.68 1.1 5.94 2.22l2.31-2.31C18.3 1.25 15.65 0 12.18 0 5.48 0 0 5.48 0 12.18s5.48 12.18 12.18 12.18c3.5 0 6.13-1.15 8.16-3.23 2.1-2.1 2.77-5.07 2.77-7.44 0-.74-.06-1.42-.18-2.07l-10.45.3z" fill="currentColor"/>
            </svg>
            {t.google}
          </button>
        </form>

        <footer style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <button 
            type="button"
            onClick={() => setIsRegistering(!isRegistering)}
            style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', cursor: 'pointer', transition: 'color 0.2s' }}
          >
            {isRegistering ? t.toLogin : t.toSignup}
          </button>
          <p style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.1)', letterSpacing: '0.2em', marginTop: '1.5rem', fontWeight: 600 }}>{t.footer}</p>
        </footer>
      </motion.div>
    </div>
  );
}
