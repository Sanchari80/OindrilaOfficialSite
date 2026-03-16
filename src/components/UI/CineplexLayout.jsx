import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import CineplexBackground from './CineplexBackground';

const PHOTOS = [
  '/download.jpg',
  '/images.jpg',
  '/Oindrila bck.png',
  '/oindrila.png',
  '/oinz.png',
  '/sen.jpg',
];
const INTERVAL = 5000;

/* ══ Device hook ══ */
const useDevice = () => {
  const [w, setW] = useState(window.innerWidth);
  useEffect(() => {
    const h = () => setW(window.innerWidth);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);
  if (w < 768)  return 'mobile';
  if (w < 1024) return 'tablet';
  return 'desktop';
};

/* ══ Desktop Sidebar Slideshow ══ */
const Sidebar = ({ side }) => {
  const [current, setCurrent] = useState(side === 'right' ? 3 : 0);
  const [visible, setVisible] = useState(true);
  const [running, setRunning] = useState(true);
  const [fading,  setFading]  = useState(false);

  const next = useCallback(() => {
    setFading(true);
    setTimeout(() => { setCurrent(c => (c + 1) % PHOTOS.length); setFading(false); }, 600);
  }, []);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(next, INTERVAL);
    return () => clearInterval(id);
  }, [running, next]);

  return (
    <div style={{
      position: 'fixed', top: '50%',
      [side === 'left' ? 'left' : 'right']: 28,
      transform: 'translateY(-50%)',
      zIndex: 20,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', gap: 8,
    }}>
      {visible && (
        <div style={{
          position: 'relative', width: 135,
          border: '1px solid rgba(201,168,76,0.5)', borderRadius: 2,
          overflow: 'hidden', background: '#0f0f0c',
          boxShadow: '0 0 30px rgba(201,168,76,0.12), inset 0 0 20px rgba(0,0,0,0.5)',
        }}>
          <div style={{ height: 14, background: '#1c1409', borderBottom: '1px solid rgba(201,168,76,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'space-around', padding: '0 6px' }}>
            {[...Array(5)].map((_,i) => <div key={i} style={{ width: 10, height: 7, background: '#2a1a08', borderRadius: 1, border: '1px solid rgba(201,168,76,0.35)' }} />)}
          </div>
          <div style={{ position: 'relative', height: 200, overflow: 'hidden' }}>
            <img src={PHOTOS[current]} alt="Oindrila Sen" style={{
              width: '100%', height: '100%',
              objectFit: 'cover', objectPosition: 'center 20%',
              display: 'block',
              filter: 'sepia(0.2) contrast(1.08) brightness(0.92)',
              opacity: fading ? 0 : 1, transition: 'opacity 0.6s ease',
            }} />
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.55) 100%)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 40, background: 'linear-gradient(transparent, rgba(0,0,0,0.6))', pointerEvents: 'none' }} />
          </div>
          <div style={{ background: '#0f0f0c', borderTop: '1px solid rgba(201,168,76,0.2)', padding: '4px 6px', textAlign: 'center' }}>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '0.6rem', letterSpacing: '0.25em', color: 'rgba(201,168,76,0.6)', textTransform: 'uppercase' }}>Oindrila Sen</div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 3, marginTop: 4 }}>
              {PHOTOS.map((_, i) => (
                <div key={i}
                  onClick={() => { setFading(true); setTimeout(() => { setCurrent(i); setFading(false); }, 400); }}
                  style={{ width: i === current ? 12 : 5, height: 3, borderRadius: 2, cursor: 'pointer', background: i === current ? '#c9a84c' : 'rgba(201,168,76,0.25)', transition: 'all 0.3s' }}
                />
              ))}
            </div>
          </div>
          <div style={{ height: 14, background: '#1c1409', borderTop: '1px solid rgba(201,168,76,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'space-around', padding: '0 6px' }}>
            {[...Array(5)].map((_,i) => <div key={i} style={{ width: 10, height: 7, background: '#2a1a08', borderRadius: 1, border: '1px solid rgba(201,168,76,0.35)' }} />)}
          </div>
        </div>
      )}
      <div style={{ display: 'flex', gap: 5 }}>
        <button onClick={() => setRunning(r => !r)}
          style={{ width: 26, height: 26, borderRadius: 2, cursor: 'pointer', background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.3)', color: '#c9a84c', fontSize: '0.6rem', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.background='rgba(201,168,76,0.2)'}
          onMouseLeave={e => e.currentTarget.style.background='rgba(201,168,76,0.08)'}>
          {running ? '⏸' : '▶'}
        </button>
        <button onClick={() => setVisible(v => !v)}
          style={{ width: 26, height: 26, borderRadius: 2, cursor: 'pointer', background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.3)', color: '#c9a84c', fontSize: '0.6rem', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.background='rgba(201,168,76,0.2)'}
          onMouseLeave={e => e.currentTarget.style.background='rgba(201,168,76,0.08)'}>
          {visible ? '🙈' : '👁'}
        </button>
      </div>
    </div>
  );
};

/* ══ Mobile / Tablet Photo Strip ══ */
const MobilePhotoStrip = () => {
  const [current, setCurrent] = useState(0);
  const [fading,  setFading]  = useState(false);
  const [running, setRunning] = useState(true);

  const next = useCallback(() => {
    setFading(true);
    setTimeout(() => { setCurrent(c => (c + 1) % PHOTOS.length); setFading(false); }, 500);
  }, []);

  const prev = () => {
    setFading(true);
    setTimeout(() => { setCurrent(c => (c - 1 + PHOTOS.length) % PHOTOS.length); setFading(false); }, 500);
  };

  useEffect(() => {
    if (!running) return;
    const id = setInterval(next, INTERVAL);
    return () => clearInterval(id);
  }, [running, next]);

  return (
    <div style={{
      width: '100%',
      background: '#0f0d0a',
      borderBottom: '1px solid rgba(201,168,76,0.2)',
      boxSizing: 'border-box',
    }}>

      {/* ── top sprocket — navbar এর bottom strip এর সাথে seamless join ── */}
      <div style={{ height: 10, background: '#1c1409', display: 'flex', alignItems: 'center', justifyContent: 'space-around', padding: '0 8px' }}>
        {[...Array(14)].map((_,i) => <div key={i} style={{ width: 8, height: 5, background: '#2a1a08', borderRadius: 1, border: '1px solid rgba(201,168,76,0.35)' }} />)}
      </div>

      {/* ── photo + nav controls ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px' }}>

        <button onClick={prev} style={{ flexShrink: 0, width: 32, height: 32, borderRadius: 3, background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.3)', color: '#c9a84c', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>‹</button>

        {/* Square photo */}
        <div style={{
          flex: 1,
          position: 'relative',
          aspectRatio: '1 / 1',    /* square — CSS aspect-ratio */
          maxWidth: 160,
          borderRadius: 4,
          overflow: 'hidden',
          border: '1px solid rgba(201,168,76,0.45)',
          background: '#0a0806',
          margin: '0 auto',
        }}>
          <img src={PHOTOS[current]} alt="Oindrila Sen" style={{
            width: '100%', height: '100%',
            objectFit: 'cover',
            objectPosition: 'center 20%',
            filter: 'sepia(0.12) contrast(1.05) brightness(0.9)',
            opacity: fading ? 0 : 1,
            transition: 'opacity 0.5s ease',
            display: 'block',
          }} />
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.35) 100%)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: 7, left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(4px)', padding: '2px 12px', borderRadius: 20, border: '1px solid rgba(201,168,76,0.3)', whiteSpace: 'nowrap' }}>
            <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '0.52rem', letterSpacing: '0.2em', color: 'rgba(201,168,76,0.85)', textTransform: 'uppercase' }}>Oindrila Sen</span>
          </div>
        </div>

        <button onClick={next} style={{ flexShrink: 0, width: 32, height: 32, borderRadius: 3, background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.3)', color: '#c9a84c', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>›</button>

        <button onClick={() => setRunning(r => !r)} style={{ flexShrink: 0, width: 28, height: 28, borderRadius: 3, background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.22)', color: '#c9a84c', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem' }}>
          {running ? '⏸' : '▶'}
        </button>
      </div>

      {/* dots */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 4, paddingBottom: 8 }}>
        {PHOTOS.map((_, i) => (
          <div key={i}
            onClick={() => { setFading(true); setTimeout(() => { setCurrent(i); setFading(false); }, 400); }}
            style={{ width: i === current ? 18 : 5, height: 3, borderRadius: 2, cursor: 'pointer', background: i === current ? '#c9a84c' : 'rgba(201,168,76,0.22)', transition: 'all 0.3s' }}
          />
        ))}
      </div>

      {/* bottom sprocket */}
      <div style={{ height: 10, background: '#1c1409', display: 'flex', alignItems: 'center', justifyContent: 'space-around', padding: '0 8px' }}>
        {[...Array(14)].map((_,i) => <div key={i} style={{ width: 8, height: 5, background: '#2a1a08', borderRadius: 1, border: '1px solid rgba(201,168,76,0.35)' }} />)}
      </div>
    </div>
  );
};

/* ══ LAYOUT CONFIG ══ */
const LAYOUT = {
  mobile:  { sidebar: false, mobileStrip: false,  left: 0,  right: 0   },
  tablet:  { sidebar: false, mobileStrip: true,  left: 16, right: 16  },
  desktop: { sidebar: true,  mobileStrip: false, left: 20, right: 180 },
};

const CineplexLayout = ({ children }) => {
  const location = useLocation();
  const device   = useDevice();

  const fullScreenPages = ['/community', '/notifications', '/fan-zone', '/events'];
  const isFullScreen    = fullScreenPages.includes(location.pathname);

  const cfg         = LAYOUT[device];
  const showSidebar = cfg.sidebar && !isFullScreen;
  const showStrip   = cfg.mobileStrip && !isFullScreen;
  const rightMargin = (isFullScreen && device === 'desktop') ? 20 : cfg.right;

  return (
    <div style={{ minHeight: '100vh', position: 'relative' }}>
      <CineplexBackground />
      {showSidebar && <Sidebar side="right" />}
      <div style={{
        marginLeft:  cfg.left,
        marginRight: rightMargin,
        position: 'relative',
        zIndex: 10,
        minHeight: '100vh',
      }}>
        {showStrip && <MobilePhotoStrip />}
        {children}
      </div>
    </div>
  );
};

export default CineplexLayout;