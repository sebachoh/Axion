'use client';

import React from 'react';

interface Props {
  title: string;
}

export default function DeleteCareerButton({ title }: Props) {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!confirm(`¿Eliminar la especialización "${title}"? Esta acción no se puede deshacer.`)) {
      e.preventDefault();
    }
  };

  return (
    <button
      type="submit"
      onClick={handleClick}
      style={{
        background: 'rgba(255,107,107,0.12)', 
        border: '1px solid rgba(255,107,107,0.35)',
        color: '#ff6b6b', 
        padding: '7px 16px', 
        borderRadius: '8px',
        cursor: 'pointer', 
        fontSize: '0.8rem', 
        fontWeight: 700
      }}
    >
      🗑 Eliminar Carrera
    </button>
  );
}
