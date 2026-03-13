import React, { useState, useEffect, useRef } from 'react';
import { db } from '../../firebase/firebaseConfig';
import {
  collection, query, orderBy, onSnapshot, where
} from 'firebase/firestore';
import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:4000';

/* ══ Fonts & Keyframes ══ */
const FontImport = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Special+Elite&family=Crimson+Pro:ital,wght@0,400;0,600;1,400&display=swap');
    @keyframes countPulse {
      0%,100% { text-shadow: 0 0 20px rgba(201,168,76,0.4), 0 0 60px rgba(201,168,76,0.1); }
      50%      { text-shadow: 0 0 40px rgba(201,168,76,0.8), 0 0 100px rgba(201,168,76,0.3); }
    }
    @keyframes bannerIn {
      from { opacity:0; transform:translateY(30px) scale(0.97); }
      to   { opacity:1; transform:translateY(0) scale(1); }
    }
    @keyframes grainAnim {
      0%   { background-position: 0 0; }
      25%  { background-position: -30px -20px; }
      50%  { background-position: 20px -40px; }
      75%  { background-position: -45px 15px; }
      100% { background-position: 25px 30px; }
    }
    @keyframes toastIn {
      from { opacity:0; transform:translateX(100px); }
      to   { opacity:1; transform:translateX(0); }
    }
    @keyframes curtainLeft {
      from { transform:translateX(0); }
      to   { transform:translateX(-100%); }
    }
    @keyframes curtainRight {
      from { transform:translateX(0); }
      to   { transform:translateX(100%); }
    }
    @keyframes spotPulse {
      0%,100% { opacity:0.15; }
      50%     { opacity:0.28; }
    }
    @keyframes liveDot {
      0%,100% { opacity:1; transform:scale(1); }
      50%     { opacity:0.4; transform:scale(0.6); }
    }
    @keyframes historyReveal {
      from { opacity:0; transform:translateY(20px); }
      to   { opacity:1; transform:translateY(0); }
    }
  `}</style>
);

/* ══ Sprocket strip ══ */
const SprocketStrip = ({ count = 20 }) => (
  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-around', padding:'0 6px', height:14, background:'#0d0b08' }}>
    {Array.from({ length: count }).map((_,i) => (
      <div key={i} style={{ width:10, height:7, background:'#080604', border:'1px solid rgba(201,168,76,0.22)', borderRadius:1.5 }} />
    ))}
  </div>
);

/* ══ Countdown unit ══ */
const CountUnit = ({ value, label }) => (
  <div style={{ display:'flex', flexDirection:'column', alignItems:'center', minWidth:55 }}>
    <div style={{
      fontFamily:"'Bebas Neue', sans-serif",
      fontSize:'clamp(2rem, 5.5vw, 3.6rem)',
      lineHeight:1, color:'#e8c97a',
      animation:'countPulse 2s ease-in-out infinite',
      letterSpacing:'0.05em',
    }}>
      {String(value).padStart(2,'0')}
    </div>
    <div style={{
      fontFamily:'monospace', fontSize:'0.4rem',
      letterSpacing:'0.3em', textTransform:'uppercase',
      color:'rgba(201,168,76,0.45)', marginTop:2,
    }}>{label}</div>
  </div>
);

const Sep = () => (
  <div style={{
    fontFamily:"'Bebas Neue', sans-serif",
    fontSize:'clamp(1.4rem, 3.5vw, 2.6rem)',
    color:'rgba(201,168,76,0.3)', alignSelf:'flex-start',
    paddingTop:2, lineHeight:1,
  }}>:</div>
);

/* ══ Countdown hook ══ */
const useCountdown = (targetDate) => {
  const [time, setTime] = useState({ days:0, hours:0, minutes:0, seconds:0, passed:false });
  useEffect(() => {
    const tick = () => {
      const diff = new Date(targetDate).getTime() - Date.now();
      if (diff <= 0) { setTime({ days:0, hours:0, minutes:0, seconds:0, passed:true }); return; }
      setTime({
        days:    Math.floor(diff / 86400000),
        hours:   Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000)  / 60000),
        seconds: Math.floor((diff % 60000)    / 1000),
        passed:  false,
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetDate]);
  return time;
};

/* ══ Event Banner Card ══ */
const EventBannerCard = ({ event, index }) => {
  const eventDate = event.eventDate?.toDate ? event.eventDate.toDate() : new Date(event.eventDate);
  const countdown = useCountdown(eventDate);
  const [mediaError, setMediaError] = useState(false);
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [curtainOpen, setCurtainOpen] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setCurtainOpen(true), 300 + index * 200);
    return () => clearTimeout(t);
  }, [index]);

  const toggleMusic = () => {
    if (!audioRef.current) return;
    if (playing) { audioRef.current.pause(); setPlaying(false); }
    else { audioRef.current.play().catch(()=>{}); setPlaying(true); }
  };

  const isVideo = event.mediaType === 'video';
  const eventDateStr = eventDate.toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' });

  return (
    <div style={{
      position:'relative', width:'100%', marginBottom:28,
      animation:`bannerIn 0.6s cubic-bezier(0.34,1.56,0.64,1) ${index * 0.15}s both`,
      borderRadius:4, overflow:'hidden',
      border:'1px solid rgba(201,168,76,0.3)',
      boxShadow:'0 8px 50px rgba(0,0,0,0.7), 0 0 0 1px rgba(201,168,76,0.06)',
    }}>
      <SprocketStrip count={24} />

      {/* MEDIA */}
      <div style={{ position:'relative', width:'100%', aspectRatio:'16/9', background:'#08080a', overflow:'hidden' }}>

        {/* Curtain */}
        {!curtainOpen && (
          <>
            <div style={{ position:'absolute', top:0, left:0, width:'50%', height:'100%', background:'linear-gradient(to right,#1a0a00,#2a1400)', zIndex:20, animation:'curtainLeft 0.85s cubic-bezier(0.77,0,0.18,1) forwards' }} />
            <div style={{ position:'absolute', top:0, right:0, width:'50%', height:'100%', background:'linear-gradient(to left,#1a0a00,#2a1400)', zIndex:20, animation:'curtainRight 0.85s cubic-bezier(0.77,0,0.18,1) forwards' }} />
          </>
        )}

        {/* Spotlight */}
        <div style={{
          position:'absolute', inset:0, zIndex:2, pointerEvents:'none',
          background:'radial-gradient(ellipse 70% 60% at 50% 40%, rgba(201,168,76,0.06) 0%, transparent 70%)',
          animation:'spotPulse 3s ease-in-out infinite',
        }} />

        {/* Grain */}
        <div style={{
          position:'absolute', inset:0, zIndex:3, pointerEvents:'none', opacity:0.035,
          backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize:'200px 200px',
          animation:'grainAnim 0.08s steps(1) infinite',
        }} />

        {/* Media */}
        {!mediaError && event.mediaUrl ? (
          isVideo ? (
            <video src={event.mediaUrl} style={{ width:'100%', height:'100%', objectFit:'cover' }} autoPlay muted loop onError={() => setMediaError(true)} />
          ) : (
            <img src={event.mediaUrl} alt={event.title} style={{ width:'100%', height:'100%', objectFit:'contain', background:'#080604', filter:'sepia(0.05) contrast(1.02)' }} onError={() => setMediaError(true)} />
          )
        ) : (
          <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', background:'linear-gradient(135deg,#0e0b07,#1a1208)' }}>
            <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'4rem', color:'rgba(201,168,76,0.08)', letterSpacing:'0.3em' }}>EVENT</span>
          </div>
        )}

        {/* Gradient bottom */}
        <div style={{ position:'absolute', bottom:0, left:0, right:0, height:'65%', zIndex:4, background:'linear-gradient(to top, rgba(8,6,4,0.97) 0%, rgba(8,6,4,0.6) 40%, transparent 100%)' }} />

        {/* LIVE / UPCOMING badge */}
        <div style={{
          position:'absolute', top:14, left:14, zIndex:10,
          display:'flex', alignItems:'center', gap:5,
          background:'rgba(8,6,4,0.85)', border:`1px solid ${countdown.passed ? 'rgba(192,57,43,0.5)' : 'rgba(201,168,76,0.3)'}`,
          padding:'4px 10px', borderRadius:2, backdropFilter:'blur(8px)',
        }}>
          <div style={{ width:6, height:6, borderRadius:'50%', background: countdown.passed ? '#e74c3c' : '#c9a84c', animation:`liveDot ${countdown.passed ? '0.6s' : '1.2s'} ease-in-out infinite` }} />
          <span style={{ fontFamily:'monospace', fontSize:'0.46rem', letterSpacing:'0.3em', color: countdown.passed ? '#e74c3c' : '#c9a84c', textTransform:'uppercase' }}>
            {countdown.passed ? 'NOW LIVE' : 'UPCOMING'}
          </span>
        </div>

        {/* Music button */}
        {event.musicUrl && (
          <>
            <audio ref={audioRef} src={event.musicUrl} loop />
            <button onClick={toggleMusic} title={playing ? 'Pause music' : 'Play music'} style={{
              position:'absolute', top:14, right:14, zIndex:10,
              width:32, height:32, borderRadius:'50%', cursor:'pointer',
              background:'rgba(8,6,4,0.85)', border:'1px solid rgba(201,168,76,0.3)',
              color:'#c9a84c', fontSize:'0.85rem',
              display:'flex', alignItems:'center', justifyContent:'center',
              backdropFilter:'blur(8px)', transition:'all 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.background='rgba(201,168,76,0.2)'; }}
              onMouseLeave={e => { e.currentTarget.style.background='rgba(8,6,4,0.85)'; }}
            >
              {playing ? '⏸' : '♪'}
            </button>
          </>
        )}

        {/* Title + Countdown overlay */}
        <div style={{ position:'absolute', bottom:0, left:0, right:0, zIndex:5, padding:'16px 20px 18px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6, flexWrap:'wrap' }}>
            {event.category && (
              <span style={{
                fontFamily:'monospace', fontSize:'0.46rem', letterSpacing:'0.28em', textTransform:'uppercase',
                padding:'3px 8px', borderRadius:2,
                background:'rgba(201,168,76,0.15)', border:'1px solid rgba(201,168,76,0.3)', color:'#c9a84c',
              }}>{event.category}</span>
            )}
            <span style={{ fontFamily:'monospace', fontSize:'0.42rem', color:'rgba(255,255,255,0.3)', letterSpacing:'0.18em' }}>{eventDateStr}</span>
          </div>

          <h2 style={{
            fontFamily:"'Bebas Neue', sans-serif",
            fontSize:'clamp(1.7rem, 5vw, 3rem)',
            letterSpacing:'0.1em', lineHeight:1.02,
            color:'#f2ead8', margin:'0 0 5px',
            textShadow:'0 2px 20px rgba(0,0,0,0.8)',
          }}>{event.title}</h2>

          {event.description && (
            <p style={{
              fontFamily:"'Crimson Pro', Georgia, serif",
              fontSize:'clamp(0.72rem, 1.8vw, 0.88rem)',
              color:'rgba(242,234,216,0.5)', margin:'0 0 12px',
              fontStyle:'italic', maxWidth:540, lineHeight:1.5,
            }}>{event.description}</p>
          )}

          {/* COUNTDOWN */}
          {!countdown.passed ? (
            <div style={{ display:'flex', alignItems:'flex-start', gap:6, flexWrap:'wrap' }}>
              <CountUnit value={countdown.days}    label="Days"    />
              <Sep /><CountUnit value={countdown.hours}   label="Hours"   />
              <Sep /><CountUnit value={countdown.minutes} label="Mins"    />
              <Sep /><CountUnit value={countdown.seconds} label="Secs"    />
            </div>
          ) : (
            <div style={{
              fontFamily:"'Bebas Neue', sans-serif",
              fontSize:'clamp(1.4rem, 3.5vw, 2.3rem)',
              letterSpacing:'0.22em', color:'#e8c97a',
              textShadow:'0 0 30px rgba(201,168,76,0.5)',
            }}>🎬 THE DAY IS HERE!</div>
          )}
        </div>
      </div>

      <SprocketStrip count={24} />
    </div>
  );
};

/* ══ History Card ══ */
const HistoryCard = ({ event, index }) => (
  <div style={{
    position:'relative', overflow:'hidden',
    background:'#0e0b07', border:'1px solid rgba(201,168,76,0.18)', borderRadius:3,
    animation:`historyReveal 0.5s ease ${index * 0.08}s both`,
    transition:'border-color 0.2s, transform 0.2s',
  }}
    onMouseEnter={e => { e.currentTarget.style.borderColor='rgba(201,168,76,0.4)'; e.currentTarget.style.transform='translateY(-2px)'; }}
    onMouseLeave={e => { e.currentTarget.style.borderColor='rgba(201,168,76,0.18)'; e.currentTarget.style.transform='translateY(0)'; }}
  >
    <div style={{ position:'relative', width:'100%', paddingTop:'130%', background:'#0a0806', overflow:'hidden' }}>
      {event.historyImageUrl ? (
        <img src={event.historyImageUrl} alt={event.title}
          style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', filter:'sepia(0.2) brightness(0.82)' }} />
      ) : (
        <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <span style={{ fontSize:'2rem', opacity:0.25 }}>🎞️</span>
        </div>
      )}
      <div style={{ position:'absolute', bottom:0, left:0, right:0, height:'55%', background:'linear-gradient(to top, rgba(8,6,4,0.95) 0%, transparent 100%)' }} />
      <div style={{ position:'absolute', bottom:8, left:8, right:8 }}>
        <p style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'0.78rem', letterSpacing:'0.1em', color:'#e8c97a', lineHeight:1.1, margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{event.title}</p>
        <p style={{ fontFamily:'monospace', fontSize:'0.4rem', color:'rgba(201,168,76,0.38)', letterSpacing:'0.16em', margin:'3px 0 0', textTransform:'uppercase' }}>
          {(event.eventDate?.toDate ? event.eventDate.toDate() : new Date(event.eventDate)).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}
        </p>
      </div>
      <div style={{
        position:'absolute', top:8, right:8,
        padding:'2px 6px', background:'rgba(0,0,0,0.7)',
        border:'1px solid rgba(192,57,43,0.5)', borderRadius:1,
        fontFamily:'monospace', fontSize:'0.38rem', letterSpacing:'0.18em',
        color:'rgba(192,57,43,0.8)', textTransform:'uppercase', transform:'rotate(4deg)',
      }}>WRAPPED</div>
    </div>
    {event.category && (
      <div style={{ padding:'6px 10px 8px', borderTop:'1px solid rgba(201,168,76,0.08)' }}>
        <span style={{ fontFamily:'monospace', fontSize:'0.38rem', letterSpacing:'0.2em', color:'rgba(201,168,76,0.32)', textTransform:'uppercase' }}>{event.category}</span>
      </div>
    )}
  </div>
);

/* ══ Toast ══ */
const EventToast = ({ event, onClose }) => {
  useEffect(() => {
    const t = setTimeout(onClose, 6000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div style={{
      position:'fixed', bottom:24, right:24, zIndex:500,
      maxWidth:290, background:'#0e0b07',
      border:'1px solid rgba(201,168,76,0.5)', borderRadius:4, overflow:'hidden',
      boxShadow:'0 8px 40px rgba(0,0,0,0.8)',
      animation:'toastIn 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards',
    }}>
      <SprocketStrip count={9} />
      <div style={{ padding:'12px 32px 12px 14px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:5 }}>
          <div style={{ width:6, height:6, borderRadius:'50%', background:'#c9a84c', animation:'liveDot 1s ease-in-out infinite' }} />
          <span style={{ fontFamily:'monospace', fontSize:'0.42rem', letterSpacing:'0.28em', color:'#c9a84c', textTransform:'uppercase' }}>
            {event.isReminder ? 'EVENT REMINDER' : 'NEW EVENT'}
          </span>
        </div>
        <p style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'1rem', letterSpacing:'0.1em', color:'#f2ead8', margin:'0 0 3px' }}>{event.title}</p>
        {event.category && <p style={{ fontFamily:"'Crimson Pro',serif", fontSize:'0.68rem', color:'rgba(255,255,255,0.35)', margin:0, fontStyle:'italic' }}>{event.category}</p>}
      </div>
      <SprocketStrip count={9} />
      <button onClick={onClose} style={{ position:'absolute', top:18, right:10, background:'none', border:'none', color:'rgba(201,168,76,0.4)', cursor:'pointer', fontSize:'0.65rem', lineHeight:1 }}>✕</button>
    </div>
  );
};

/* ══ MAIN ══ */
const FanEvent = () => {
  const [activeEvents,  setActiveEvents]  = useState([]);
  const [historyEvents, setHistoryEvents] = useState([]);
  const [toast,         setToast]         = useState(null);
  const [tab,           setTab]           = useState('upcoming');
  const prevIds = useRef(new Set());

  /* Active events */
  useEffect(() => {
    const q = query(collection(db, 'events'), where('status', '==', 'active'), orderBy('eventDate', 'asc'));
    const unsub = onSnapshot(q, snap => {
      const docs = snap.docs.map(d => ({ ...d.data(), id: d.id }));
      docs.forEach(ev => {
        if (!prevIds.current.has(ev.id) && prevIds.current.size > 0) setToast(ev);
      });
      prevIds.current = new Set(docs.map(d => d.id));
      setActiveEvents(docs);
    });
    return () => unsub();
  }, []);

  /* History events */
  useEffect(() => {
    const q = query(collection(db, 'events'), where('status', '==', 'history'), orderBy('eventDate', 'desc'));
    const unsub = onSnapshot(q, snap => setHistoryEvents(snap.docs.map(d => ({ ...d.data(), id: d.id }))));
    return () => unsub();
  }, []);

  /* Socket.io */
  useEffect(() => {
    const socket = io(SOCKET_URL, { transports:['websocket'] });
    socket.on('event:new',      ev => setToast(ev));
    socket.on('event:reminder', ev => setToast({ ...ev, isReminder:true }));
    return () => socket.disconnect();
  }, []);

  return (
    <div style={{ minHeight:'100vh', background:'#080806', color:'#f2ead8' }}>
      <FontImport />
      {toast && <EventToast event={toast} onClose={() => setToast(null)} />}

      {/* Page Header */}
      <div style={{ background:'#0e0e0b', borderBottom:'1px solid rgba(201,168,76,0.15)' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-around', padding:'0 8px', height:14, background:'#0d0b08', borderBottom:'1px solid rgba(201,168,76,0.08)' }}>
          {Array.from({ length:20 }).map((_,i) => (
            <div key={i} style={{ width:10, height:7, background:'#080604', border:'1px solid rgba(201,168,76,0.2)', borderRadius:1.5 }} />
          ))}
        </div>
        <div style={{ padding:'14px 20px', display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ position:'relative' }}>
            <div style={{ width:36, height:36, borderRadius:3, background:'rgba(201,168,76,0.1)', border:'1px solid rgba(201,168,76,0.3)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.2rem' }}>🎬</div>
            {activeEvents.length > 0 && (
              <div style={{ position:'absolute', top:-4, right:-4, width:14, height:14, borderRadius:'50%', background:'#c9a84c', border:'1.5px solid #080806', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <span style={{ fontFamily:'monospace', fontSize:'0.38rem', color:'#0a0806', fontWeight:'bold' }}>{activeEvents.length}</span>
              </div>
            )}
          </div>
          <div>
            <h1 style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'clamp(1.4rem,4vw,2rem)', letterSpacing:'0.2em', color:'#e8c97a', margin:0, lineHeight:1 }}>EVENTS</h1>
            <p style={{ fontFamily:'monospace', fontSize:'0.42rem', letterSpacing:'0.25em', color:'rgba(201,168,76,0.32)', margin:'3px 0 0', textTransform:'uppercase' }}>Oindrila Sen Official</p>
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-around', padding:'0 8px', height:14, background:'#0d0b08', borderTop:'1px solid rgba(201,168,76,0.08)' }}>
          {Array.from({ length:20 }).map((_,i) => (
            <div key={i} style={{ width:10, height:7, background:'#080604', border:'1px solid rgba(201,168,76,0.2)', borderRadius:1.5 }} />
          ))}
        </div>
      </div>

      <section style={{ width:'100%', maxWidth:860, margin:'0 auto', padding:'28px 16px 48px' }}>

        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:18, padding:'0 2px', flexWrap:'wrap', gap:10 }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ display:'flex', flexDirection:'column', gap:3 }}>
              <div style={{ width:14, height:2, background:'rgba(201,168,76,0.5)' }} />
              <div style={{ width:8,  height:2, background:'rgba(201,168,76,0.22)' }} />
            </div>
            <div>
              <h2 style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'clamp(1.5rem,4vw,2.2rem)', letterSpacing:'0.18em', color:'#e8c97a', margin:0, lineHeight:1 }}>EVENTS</h2>
              <p style={{ fontFamily:'monospace', fontSize:'0.4rem', letterSpacing:'0.28em', color:'rgba(201,168,76,0.32)', margin:0, textTransform:'uppercase' }}>Oindrila Sen Official</p>
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display:'flex', gap:4 }}>
            {[{ key:'upcoming', label:`Upcoming (${activeEvents.length})` }, { key:'history', label:`History (${historyEvents.length})` }].map(t => (
              <button key={t.key} onClick={() => setTab(t.key)} style={{
                fontFamily:'monospace', fontSize:'0.48rem', letterSpacing:'0.2em', textTransform:'uppercase',
                padding:'5px 12px', borderRadius:2, cursor:'pointer', transition:'all 0.2s',
                background: tab === t.key ? 'rgba(201,168,76,0.16)' : 'transparent',
                border:`1px solid ${tab === t.key ? 'rgba(201,168,76,0.45)' : 'rgba(201,168,76,0.14)'}`,
                color: tab === t.key ? '#c9a84c' : 'rgba(201,168,76,0.32)',
              }}>{t.label}</button>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div style={{ height:1, background:'linear-gradient(to right, rgba(201,168,76,0.4), rgba(201,168,76,0.08), transparent)', marginBottom:22 }} />

        {/* Upcoming */}
        {tab === 'upcoming' && (
          activeEvents.length === 0
            ? <div style={{ padding:'40px 20px', textAlign:'center', border:'1px dashed rgba(201,168,76,0.1)', borderRadius:4, fontFamily:'monospace', fontSize:'0.52rem', letterSpacing:'0.24em', color:'rgba(201,168,76,0.2)', textTransform:'uppercase' }}>No upcoming events</div>
            : activeEvents.map((ev, i) => <EventBannerCard key={ev.id} event={ev} index={i} />)
        )}

        {/* History */}
        {tab === 'history' && (
          historyEvents.length === 0
            ? <div style={{ padding:'40px 20px', textAlign:'center', border:'1px dashed rgba(201,168,76,0.1)', borderRadius:4, fontFamily:'monospace', fontSize:'0.52rem', letterSpacing:'0.24em', color:'rgba(201,168,76,0.2)', textTransform:'uppercase' }}>No event history yet</div>
            : <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(145px,1fr))', gap:12 }}>
                {historyEvents.map((ev, i) => <HistoryCard key={ev.id} event={ev} index={i} />)}
              </div>
        )}
      </section>
    </div>
  );
};

export default FanEvent;