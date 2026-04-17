'use client';

import React, { useState } from 'react';

interface HistoryItem {
  dateStr: string;
  dayIndex: number;
  score: number;
}

interface AnalyticsData {
  globalPercentage: number;
  streak: number;
  history: HistoryItem[];
  totalTasks: number;
}

interface Props {
  data: AnalyticsData;
}

export default function HabitsAnalytics({ data }: Props) {
  const [period, setPeriod] = useState<'weekly' | 'monthly'>('weekly');

  const daysToShow = period === 'weekly' ? 7 : 28;
  const historyMap = data.history.slice(-daysToShow);
  
  // Recalculate average for the specific period selected
  const activeSum = historyMap.reduce((acc, curr) => acc + curr.score, 0);
  const periodPercentage = data.totalTasks > 0 ? (activeSum / daysToShow) * 100 : 0;

  const getHeatmapColor = (score: number) => {
    if (score < 0.2) return 'rgba(255, 255, 255, 0.05)';
    if (score < 0.5) return 'rgba(255, 255, 255, 0.2)';
    if (score < 0.8) return 'var(--color-text-muted)';
    return 'var(--color-text)'; // full completion
  };

  const dayLabels = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  // Calculate generic SVG points for Line Chart
  // Y goes from 0 (bottom) to 100 (top).
  const graphWidth = 1000;
  const graphHeight = 150;
  
  const generateLinePath = () => {
    if (historyMap.length === 0) return '';
    const points = historyMap.map((d, index) => {
      const x = (index / (daysToShow - 1)) * graphWidth;
      const y = graphHeight - (d.score * graphHeight);
      return `${x},${y}`;
    });
    return `M ${points.join(' L ')}`;
  };

  return (
    <div style={{ marginTop: '3rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 600, letterSpacing: '-0.05em' }}>
          Estadísticas de Cumplimiento
        </h2>
        <div style={{ display: 'flex', gap: '4px', background: 'rgba(255,255,255,0.05)', padding: '4px', borderRadius: 'var(--radius-sm)' }}>
          <button 
            onClick={() => setPeriod('weekly')}
            style={{ 
              background: period === 'weekly' ? 'var(--color-text)' : 'transparent',
              color: period === 'weekly' ? 'var(--color-bg)' : 'var(--color-text)',
              border: 'none', padding: '6px 16px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s'
            }}
          >
            Semanal
          </button>
          <button 
            onClick={() => setPeriod('monthly')}
            style={{ 
              background: period === 'monthly' ? 'var(--color-text)' : 'transparent',
              color: period === 'monthly' ? 'var(--color-bg)' : 'var(--color-text)',
              border: 'none', padding: '6px 16px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s'
            }}
          >
            Mensual
          </button>
        </div>
      </div>

      <div className="bento-grid">

        {/* Global Percentage Widget */}
        <div className="glass-panel bento-item col-span-1" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
          <span style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Progreso del Periodo</span>
          <div style={{ position: 'relative', width: '120px', height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="120" height="120" viewBox="0 0 120 120" style={{ position: 'absolute', transform: 'rotate(-90deg)' }}>
              {/* Background Circle */}
              <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
              {/* Progress Circle */}
              <circle cx="60" cy="60" r="50" fill="none" stroke="var(--color-text)" strokeWidth="10" 
                      strokeDasharray="314" strokeDashoffset={314 - (314 * periodPercentage / 100)} style={{ transition: 'stroke-dashoffset 1s ease-in-out' }} />
            </svg>
            <span style={{ fontSize: '2rem', fontWeight: 700 }}>{Math.round(periodPercentage)}<span style={{ fontSize: '1rem' }}>%</span></span>
          </div>
          <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '1rem', textAlign: 'center' }}>
            {data.totalTasks === 0 ? "Añade hábitos para iniciar." : "Rendimiento promedio activo."}
          </span>
        </div>

        {/* Heatmap Widget */}
        <div className="glass-panel bento-item col-span-2" style={{ padding: '2rem', display: 'flex', flexDirection: 'column' }}>
           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 600 }}>Frecuencia de Hábitos</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Últimos {daysToShow} días</p>
              </div>
              <div style={{ background: 'var(--glass-bg-hover)', padding: '6px 14px', borderRadius: 'var(--radius-full)', fontSize: '0.8rem', fontWeight: 600 }}>
                {data.streak} días en racha 🔥
              </div>
           </div>

           {/* Heatmap Grid */}
           <div style={{ 
             display: 'grid', gridTemplateColumns: `repeat(${daysToShow > 7 ? 14 : 7}, 1fr)`, gap: '6px', flex: 1,
             alignItems: 'center', alignContent: 'center'
           }}>
             {historyMap.map((day, i) => (
                <div key={i} title={`${Math.round(day.score * 100)}% - ${day.dateStr}`} style={{
                  aspectRatio: '1',
                  background: getHeatmapColor(day.score),
                  borderRadius: '4px',
                  transition: 'transform 0.2s',
                  cursor: 'crosshair'
                }} 
                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                />
             ))}
           </div>
        </div>

        {/* AI Insight Widget */}
        <div className="glass-panel bento-item col-span-1" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
          {/* Subtle decoration */}
          <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: '100px', height: '100px', background: 'var(--bg-gradient-3)', borderRadius: '50%', filter: 'blur(40px)', opacity: 0.3 }}></div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
            <span style={{ fontSize: '1.2rem' }}>✨</span>
            <span style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>Axion Insight</span>
          </div>

          <p style={{ fontSize: '1.2rem', fontWeight: 500, lineHeight: 1.4, color: 'var(--color-text)' }}>
             Estoy aprendiendo de ti.
          </p>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '0.5rem', lineHeight: 1.5 }}>
            Acumula más días de historial para generar comparativas y descubrir patrones en tu rendimiento.
          </p>
        </div>

        {/* Line Chart Widget */}
        <div className="glass-panel bento-item col-span-4" style={{ padding: '2rem' }}>
          <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 600 }}>Curva de Desempeño</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Tendencia de cumplimiento {period === 'weekly' ? 'Semanal' : 'Mensual'}</p>
            </div>
          </div>

          {data.totalTasks === 0 ? (
             <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                Sin datos que graficar aún.
             </div>
          ) : (
            <div style={{ position: 'relative', height: '200px', width: '100%', display: 'flex', flexDirection: 'column' }}>
              {/* Dynamic SVG Sparkline */}
              <div style={{ flex: 1, position: 'relative', width: '100%', height: '100%' }}>
                <svg width="100%" height="100%" viewBox={`0 0 ${graphWidth} ${graphHeight}`} preserveAspectRatio="none" style={{ overflow: 'visible' }}>
                  {/* Grid Lines */}
                  {[0, 0.5, 1].map((p, i) => (
                    <line key={i} x1="0" y1={graphHeight * p} x2={graphWidth} y2={graphHeight * p} stroke="rgba(255,255,255,0.05)" strokeWidth="2" />
                  ))}
                  
                  {/* Fill Area */}
                  <path d={`M 0,${graphHeight} L ${generateLinePath().replace('M ', '')} L ${graphWidth},${graphHeight} Z`} fill="url(#gradientFill)" />
                  
                  {/* Stroke Line */}
                  <path d={generateLinePath()} fill="none" stroke="var(--color-text)" strokeWidth="4" strokeLinejoin="round" />
                  
                  {/* Plot Dots */}
                  {historyMap.map((d, i) => {
                    const cx = (i / (daysToShow - 1)) * graphWidth;
                    const cy = graphHeight - (d.score * graphHeight);
                    return (
                      <circle key={i} cx={cx} cy={cy} r="6" fill="var(--color-bg)" stroke="var(--color-text)" strokeWidth="3" 
                        style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                        onMouseOver={(e) => {
                          e.currentTarget.setAttribute('r', '10');
                          e.currentTarget.setAttribute('fill', 'var(--color-text)');
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.setAttribute('r', '6');
                          e.currentTarget.setAttribute('fill', 'var(--color-bg)');
                        }}
                      >
                        <title>{d.dateStr} - {Math.round(d.score * 100)}%</title>
                      </circle>
                    );
                  })}
                  
                  <defs>
                    <linearGradient id="gradientFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-text)" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="var(--color-text)" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              
              {/* X Axis Labels */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
                {historyMap.filter((_, i) => daysToShow === 7 ? true : i % 4 === 0).map((d, index) => (
                  <span key={index} style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>
                    {daysToShow === 7 ? dayLabels[d.dayIndex] : d.dateStr.split('-').slice(1).join('/')}
                  </span>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
