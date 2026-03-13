import React, { useState, useRef } from 'react';

const playClapSound = () => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const clackBuf = ctx.createBuffer(1, ctx.sampleRate * 0.06, ctx.sampleRate);
    const clackData = clackBuf.getChannelData(0);
    for (let i = 0; i < clackData.length; i++) {
      const t = i / ctx.sampleRate;
      clackData[i] = (Math.random() * 2 - 1) * Math.pow(1 - t / 0.06, 10) * 0.9;
    }
    const clack = ctx.createBufferSource();
    clack.buffer = clackBuf;
    const clackFilter = ctx.createBiquadFilter();
    clackFilter.type = 'highpass';
    clackFilter.frequency.value = 2400;
    const clackGain = ctx.createGain();
    clackGain.gain.setValueAtTime(1, ctx.currentTime);
    clackGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
    clack.connect(clackFilter);
    clackFilter.connect(clackGain);
    clackGain.connect(ctx.destination);
    clack.start();

    const thudOsc = ctx.createOscillator();
    thudOsc.type = 'sine';
    thudOsc.frequency.setValueAtTime(180, ctx.currentTime);
    thudOsc.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.08);
    const thudGain = ctx.createGain();
    thudGain.gain.setValueAtTime(0.5, ctx.currentTime);
    thudGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
    thudOsc.connect(thudGain);
    thudGain.connect(ctx.destination);
    thudOsc.start();
    thudOsc.stop(ctx.currentTime + 0.1);
  } catch (_) {}
};

const ReelIcon = ({ spinning }) => (
  <svg width="28" height="28" viewBox="0 0 38 38"
    style={{
      flexShrink: 0,
      transform: spinning ? 'rotate(60deg)' : 'rotate(0deg)',
      transition: 'transform 0.35s cubic-bezier(0.34,1.56,0.64,1)',
      filter: 'drop-shadow(0 0 5px rgba(201,168,76,0.4))',
    }}
  >
    <circle cx="19" cy="19" r="17" fill="none" stroke="#c9a84c" strokeWidth="1.5" />
    <circle cx="19" cy="19" r="11" fill="none" stroke="rgba(201,168,76,0.4)" strokeWidth="1" />
    <circle cx="19" cy="19" r="4" fill="#c9a84c" opacity="0.85" />
    <circle cx="19" cy="19" r="2" fill="#0a0a08" />
    {[0,60,120,180,240,300].map((deg, i) => {
      const rad = (deg * Math.PI) / 180;
      return <circle key={i} cx={19 + 13.5 * Math.cos(rad)} cy={19 + 13.5 * Math.sin(rad)} r="2.2" fill="#0a0a08" stroke="#c9a84c" strokeWidth="0.8" />;
    })}
    {[30,90,150,210,270,330].map((deg, i) => {
      const rad = (deg * Math.PI) / 180;
      return <line key={i} x1={19 + 4.5*Math.cos(rad)} y1={19 + 4.5*Math.sin(rad)} x2={19 + 10.5*Math.cos(rad)} y2={19 + 10.5*Math.sin(rad)} stroke="rgba(201,168,76,0.35)" strokeWidth="1" />;
    })}
  </svg>
);

const CustomButton = ({ children, onClick, disabled = false, loading = false, type = 'button' }) => {
  const [clicked, setClicked] = useState(false);
  const timeoutRef = useRef(null);

  const handleClick = (e) => {
    if (disabled || loading) return;
    playClapSound();
    setClicked(true);
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setClicked(false), 420);
    if (onClick) onClick(e);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Special+Elite&display=swap');
        .reel-btn {
          display: inline-flex;
          align-items: center;
          gap: 0;
          border: none;
          padding: 0;
          background: none;
          cursor: pointer;
          outline: none;
          width: auto;
          user-select: none;
          transition: transform 0.15s, filter 0.2s;
          filter: drop-shadow(0 3px 12px rgba(0,0,0,0.6));
        }
        .reel-btn:not(:disabled):hover {
          transform: translateY(-1px);
          filter: drop-shadow(0 5px 18px rgba(201,168,76,0.2));
        }
        .reel-btn:not(:disabled):active { transform: translateY(1px); }
        .reel-btn:disabled { cursor: not-allowed; opacity: 0.45; }

        .reel-tape, .reel-tape-right {
          display: flex;
          flex-direction: column;
          gap: 3px;
          padding: 7px 4px;
          background: #1a1a15;
          border: 1px solid rgba(201,168,76,0.25);
          flex-shrink: 0;
        }
        .reel-tape { border-right: none; border-radius: 3px 0 0 3px; }
        .reel-tape-right { border-left: none; border-radius: 0 3px 3px 0; }
        .reel-hole {
          width: 6px; height: 4px;
          background: #0a0a08;
          border-radius: 1px;
          border: 1px solid rgba(201,168,76,0.2);
        }

        .reel-body {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 7px 14px 7px 10px;
          background: #141410;
          border: 1px solid rgba(201,168,76,0.3);
          position: relative;
          overflow: hidden;
          transition: background 0.2s, border-color 0.25s;
        }
        .reel-btn:not(:disabled):hover .reel-body {
          background: #1e1a0f;
          border-color: rgba(201,168,76,0.65);
        }
        .reel-btn.reel-clicked .reel-body {
          background: #2a1f0a;
          border-color: #c9a84c;
        }
        .reel-body::before {
          content: '';
          position: absolute;
          inset: 0;
          background: repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.07) 3px, rgba(0,0,0,0.07) 4px);
          pointer-events: none;
        }
        .reel-flash {
          position: absolute; inset: 0;
          background: radial-gradient(ellipse at 30% center, rgba(201,168,76,0.15) 0%, transparent 65%);
          opacity: 0; transition: opacity 0.06s; pointer-events: none;
        }
        .reel-btn.reel-clicked .reel-flash { opacity: 1; }

        .reel-label {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 0.88rem;
          letter-spacing: 0.2em;
          color: #f2ead8;
          position: relative; z-index: 1;
          transition: color 0.2s;
          white-space: nowrap;
        }
        .reel-btn:not(:disabled):hover .reel-label { color: #e8c97a; }
        .reel-btn.reel-clicked .reel-label { color: #c9a84c; }

        .reel-underline {
          position: absolute; bottom: 0; left: 0; right: 0; height: 2px;
          background: linear-gradient(to right, transparent, rgba(201,168,76,0.45), transparent);
        }
        .reel-spinner {
          width: 28px; height: 28px;
          border: 2px solid rgba(201,168,76,0.2);
          border-top-color: #c9a84c;
          border-radius: 50%;
          animation: reelSpin 0.65s linear infinite;
          flex-shrink: 0;
        }
        @keyframes reelSpin { to { transform: rotate(360deg); } }
      `}</style>

      <button
        type={type}
        disabled={disabled || loading}
        onClick={handleClick}
        className={`reel-btn${clicked ? ' reel-clicked' : ''}`}
      >
        <div className="reel-tape">
          {[...Array(4)].map((_, i) => <div key={i} className="reel-hole" />)}
        </div>

        <div className="reel-body">
          <div className="reel-flash" />
          {loading ? <div className="reel-spinner" /> : <ReelIcon spinning={clicked} />}
          <span className="reel-label">{loading ? 'PROCESSING...' : children}</span>
          <div className="reel-underline" />
        </div>

        <div className="reel-tape-right">
          {[...Array(4)].map((_, i) => <div key={i} className="reel-hole" />)}
        </div>
      </button>
    </>
  );
};

export default CustomButton;