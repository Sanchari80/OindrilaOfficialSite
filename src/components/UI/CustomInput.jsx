import React, { useRef } from 'react';

// ── Typewriter keyboard click sound (Web Audio API — no file needed) ──
const playKeySound = () => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const buf = ctx.createBuffer(1, ctx.sampleRate * 0.04, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / data.length, 6);
    }
    const src = ctx.createBufferSource();
    src.buffer = buf;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 800 + Math.random() * 400;
    filter.Q.value = 0.8;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

    src.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    src.start();
    src.stop(ctx.currentTime + 0.04);
  } catch (_) {}
};

const CustomInput = ({ label, value, onChange, isSelect, children, placeholder }) => {
  const isFirstKey = useRef(true);

  const handleKey = () => {
    // small delay variation for realism
    setTimeout(playKeySound, Math.random() * 18);
  };

  const baseWrapStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    width: '100%',
    maxWidth: 320,   // ← narrow width
  };

  const labelStyle = {
    fontFamily: "'Bebas Neue', monospace",
    fontSize: '0.65rem',
    letterSpacing: '0.28em',
    textTransform: 'uppercase',
    color: 'rgba(201,168,76,0.7)',
    paddingLeft: 2,
    userSelect: 'none',
  };

  const sharedInputStyle = {
    width: '100%',
    padding: '10px 14px',
    borderRadius: 3,
    outline: 'none',
    fontFamily: "'Special Elite', monospace",
    fontSize: '0.78rem',
    letterSpacing: '0.12em',
    color: '#f2ead8',
    background: 'rgba(255,255,255,0.04)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    border: '1px solid rgba(201,168,76,0.25)',
    boxShadow: 'inset 0 1px 8px rgba(0,0,0,0.4), 0 0 0 0 rgba(201,168,76,0)',
    transition: 'border-color 0.25s, box-shadow 0.25s, background 0.25s',
  };

  const focusHandlers = {
    onFocus: e => {
      e.target.style.borderColor = 'rgba(201,168,76,0.75)';
      e.target.style.boxShadow = 'inset 0 1px 8px rgba(0,0,0,0.4), 0 0 12px rgba(201,168,76,0.12)';
      e.target.style.background = 'rgba(201,168,76,0.06)';
    },
    onBlur: e => {
      e.target.style.borderColor = 'rgba(201,168,76,0.25)';
      e.target.style.boxShadow = 'inset 0 1px 8px rgba(0,0,0,0.4), 0 0 0 0 rgba(201,168,76,0)';
      e.target.style.background = 'rgba(255,255,255,0.04)';
    },
  };

  return (
    <div style={baseWrapStyle}>
      {/* Google fonts inline (loads once per page fine) */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Special+Elite&display=swap');
        input::placeholder, textarea::placeholder { color: rgba(201,168,76,0.28); letter-spacing: 0.1em; }
        select option { background: #1a1208; color: #f2ead8; }
      `}</style>

      {/* Label with film-frame corner marks */}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 8 }}>
        {/* left corner accent */}
        <span style={{
          display: 'inline-block', width: 8, height: 8,
          borderTop: '1.5px solid rgba(201,168,76,0.5)',
          borderLeft: '1.5px solid rgba(201,168,76,0.5)',
          flexShrink: 0,
        }} />
        <span style={labelStyle}>{label}</span>
        <span style={{
          display: 'inline-block', width: 8, height: 8,
          borderTop: '1.5px solid rgba(201,168,76,0.5)',
          borderRight: '1.5px solid rgba(201,168,76,0.5)',
          flexShrink: 0,
        }} />
      </div>

      {/* Input or Select */}
      {isSelect ? (
        <select
          value={value}
          onChange={onChange}
          style={{ ...sharedInputStyle, cursor: 'pointer', appearance: 'none', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='rgba(201,168,76,0.5)'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center' }}
          {...focusHandlers}
        >
          {children}
        </select>
      ) : (
        <input
          type="text"
          value={value}
          onChange={onChange}
          onKeyDown={handleKey}
          placeholder={placeholder || ''}
          style={sharedInputStyle}
          {...focusHandlers}
        />
      )}

      {/* bottom rule */}
      <div style={{ height: 1, background: 'linear-gradient(to right, transparent, rgba(201,168,76,0.2), transparent)' }} />
    </div>
  );
};

export default CustomInput;