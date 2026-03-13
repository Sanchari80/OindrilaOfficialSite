import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import CineplexBackground from './CineplexBackground';

// ── Oindrila's photos from /public ──
const PHOTOS = [
  '/download.jpg',
  '/images.jpg',
  '/Oindrila bck.png',
  '/oindrila.png',
  '/oinz.png',
  '/sen.jpg',
];

const INTERVAL = 5000; // 5 seconds

// ── Sidebar Slideshow ──
const Sidebar = ({ side }) => {
  const [current, setCurrent]   = useState(side === 'right' ? 3 : 0);
  const [visible, setVisible]   = useState(true);   // hide/show
  const [running, setRunning]   = useState(true);   // play/stop
  const [fading,  setFading]    = useState(false);

  const next = useCallback(() => {
    setFading(true);
    setTimeout(() => {
      setCurrent(c => (c + 1) % PHOTOS.length);
      setFading(false);
    }, 600);
  }, []);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(next, INTERVAL);
    return () => clearInterval(id);
  }, [running, next]);

  const isLeft = side === 'left';

  return (
    <div style={{
      position: 'fixed',
      top: '50%',
      [isLeft ? 'left' : 'right']: 28,
      transform: 'translateY(-50%)',
      zIndex: 20,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 8,
      transition: 'opacity 0.4s',
    }}>

      {/* ── Photo frame ── */}
      {visible && (
        <div style={{
          position: 'relative',
          width: 135,
          border: '1px solid rgba(201,168,76,0.5)',
          borderRadius: 2,
          overflow: 'hidden',
          background: '#0f0f0c',
          boxShadow: '0 0 30px rgba(201,168,76,0.12), inset 0 0 20px rgba(0,0,0,0.5)',
        }}>
          {/* film strip top */}
          <div style={{
            height: 14, background: '#141410',
            borderBottom: '1px solid rgba(201,168,76,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-around', padding: '0 6px',
          }}>
            {[...Array(5)].map((_,i) => (
              <div key={i} style={{ width: 10, height: 7, background: '#060604', borderRadius: 1, border: '1px solid rgba(201,168,76,0.25)' }} />
            ))}
          </div>

          {/* photo */}
          <div style={{ position: 'relative', height: 200, overflow: 'hidden' }}>
            <img
              src={PHOTOS[current]}
              alt="Oindrila Sen"
              style={{
                width: '100%', height: '100%', objectFit: 'cover', display: 'block',
                filter: 'sepia(0.2) contrast(1.08) brightness(0.92)',
                opacity: fading ? 0 : 1,
                transition: 'opacity 0.6s ease',
              }}
            />
            {/* vignette */}
            <div style={{
              position: 'absolute', inset: 0,
              background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.55) 100%)',
              pointerEvents: 'none',
            }} />
            {/* gold shimmer on hover effect */}
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0, height: 40,
              background: 'linear-gradient(transparent, rgba(0,0,0,0.6))',
              pointerEvents: 'none',
            }} />
          </div>

          {/* name strip */}
          <div style={{
            background: '#0f0f0c',
            borderTop: '1px solid rgba(201,168,76,0.2)',
            padding: '4px 6px',
            textAlign: 'center',
          }}>
            <div style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: '0.6rem', letterSpacing: '0.25em',
              color: 'rgba(201,168,76,0.6)', textTransform: 'uppercase',
            }}>
              Oindrila Sen
            </div>
            {/* dot indicators */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 3, marginTop: 4 }}>
              {PHOTOS.map((_, i) => (
                <div key={i} onClick={() => { setFading(true); setTimeout(()=>{ setCurrent(i); setFading(false); }, 400); }}
                  style={{
                    width: i === current ? 12 : 5,
                    height: 3, borderRadius: 2, cursor: 'pointer',
                    background: i === current ? '#c9a84c' : 'rgba(201,168,76,0.25)',
                    transition: 'all 0.3s',
                  }}
                />
              ))}
            </div>
          </div>

          {/* film strip bottom */}
          <div style={{
            height: 14, background: '#141410',
            borderTop: '1px solid rgba(201,168,76,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-around', padding: '0 6px',
          }}>
            {[...Array(5)].map((_,i) => (
              <div key={i} style={{ width: 10, height: 7, background: '#060604', borderRadius: 1, border: '1px solid rgba(201,168,76,0.25)' }} />
            ))}
          </div>
        </div>
      )}

      {/* ── Controls ── */}
      <div style={{ display: 'flex', gap: 5 }}>
        {/* Play / Stop */}
        <button
          onClick={() => setRunning(r => !r)}
          title={running ? 'Stop slideshow' : 'Play slideshow'}
          style={{
            width: 26, height: 26, borderRadius: 2, cursor: 'pointer',
            background: 'rgba(201,168,76,0.08)',
            border: '1px solid rgba(201,168,76,0.3)',
            color: '#c9a84c', fontSize: '0.6rem', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            transition: 'background 0.2s, border-color 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.background='rgba(201,168,76,0.2)'}
          onMouseLeave={e => e.currentTarget.style.background='rgba(201,168,76,0.08)'}
        >
          {running ? '⏸' : '▶'}
        </button>

        {/* Hide / Show */}
        <button
          onClick={() => setVisible(v => !v)}
          title={visible ? 'Hide sidebar' : 'Show sidebar'}
          style={{
            width: 26, height: 26, borderRadius: 2, cursor: 'pointer',
            background: 'rgba(201,168,76,0.08)',
            border: '1px solid rgba(201,168,76,0.3)',
            color: '#c9a84c', fontSize: '0.6rem', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            transition: 'background 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.background='rgba(201,168,76,0.2)'}
          onMouseLeave={e => e.currentTarget.style.background='rgba(201,168,76,0.08)'}
        >
          {visible ? '🙈' : '👁'}
        </button>
      </div>

    </div>
  );
};

// ══════════════════════════════════════
// MAIN LAYOUT WRAPPER — App.jsx এ use করুন
// ══════════════════════════════════════
const CineplexLayout = ({ children }) => {
  const location = useLocation();
  const fullScreenPages = ['/community', '/notifications', '/fan-zone'];
  const isFullScreen = fullScreenPages.includes(location.pathname);

  return (
    <div style={{ minHeight: '100vh', position: 'relative' }}>

      {/* Cineplex BG effects */}
      <CineplexBackground />

      {/* Right sidebar — home/profile only */}
      {!isFullScreen && <Sidebar side="right" />}

      {/* Page content */}
      <div style={{
        marginLeft: 20,
        marginRight: isFullScreen ? 20 : 180,
        position: 'relative',
        zIndex: 10,
        minHeight: '100vh',
      }}>
        {children}
      </div>

    </div>
  );
};

export default CineplexLayout;