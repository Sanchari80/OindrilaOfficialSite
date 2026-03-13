import React, { useState, useEffect, useRef } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import {
  collection, query, orderBy, onSnapshot,
  doc, getDoc, updateDoc, arrayUnion, arrayRemove, where
} from 'firebase/firestore';
import { auth, db } from '../../firebase/firebaseConfig';
import { useNavigate } from 'react-router-dom';
import { Bell, BellOff, ExternalLink, Megaphone, X, Trash2, Calendar } from 'lucide-react';
import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:4000';

/* ══ SOUNDS ══ */

// 🔔 Announcement — bright chime + sparkle
const playNotifSound = () => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    // Bright ascending chime
    [[1046,0,0.22,0.22],[1318,0.12,0.25,0.18],[1568,0.22,0.3,0.16],[2093,0.32,0.5,0.12]].forEach(([freq,start,dur,gain]) => {
      const osc = ctx.createOscillator(); const g = ctx.createGain();
      osc.type = 'sine'; osc.frequency.value = freq;
      g.gain.setValueAtTime(0, ctx.currentTime+start);
      g.gain.linearRampToValueAtTime(gain, ctx.currentTime+start+0.03);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime+start+dur);
      osc.connect(g); g.connect(ctx.destination);
      osc.start(ctx.currentTime+start); osc.stop(ctx.currentTime+start+dur);
    });
    // sparkle overtone
    const sp = ctx.createOscillator(); const sg = ctx.createGain();
    sp.type = 'triangle'; sp.frequency.value = 3000;
    sg.gain.setValueAtTime(0.06, ctx.currentTime+0.3);
    sg.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime+0.7);
    sp.connect(sg); sg.connect(ctx.destination);
    sp.start(ctx.currentTime+0.3); sp.stop(ctx.currentTime+0.7);
  } catch(_){}
};

// 🎬 Event — dramatic cinematic fanfare with reverb tail
const playEventSound = () => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    // Epic brass-like fanfare — 5 ascending notes
    [[349,0,0.2,0.2],[440,0.18,0.2,0.22],[523,0.34,0.22,0.24],[659,0.5,0.28,0.26],[880,0.66,0.7,0.28]].forEach(([freq,start,dur,gain]) => {
      const osc = ctx.createOscillator(); const g = ctx.createGain();
      osc.type = 'sawtooth'; osc.frequency.value = freq;
      // soft filter for brass feel
      const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 1200;
      g.gain.setValueAtTime(0, ctx.currentTime+start);
      g.gain.linearRampToValueAtTime(gain, ctx.currentTime+start+0.05);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime+start+dur);
      osc.connect(f); f.connect(g); g.connect(ctx.destination);
      osc.start(ctx.currentTime+start); osc.stop(ctx.currentTime+start+dur);
    });
    // deep cinematic boom
    const boom = ctx.createOscillator(); const bg = ctx.createGain();
    boom.type = 'sine';
    boom.frequency.setValueAtTime(60, ctx.currentTime);
    boom.frequency.exponentialRampToValueAtTime(28, ctx.currentTime+0.8);
    bg.gain.setValueAtTime(0.35, ctx.currentTime);
    bg.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime+0.8);
    boom.connect(bg); bg.connect(ctx.destination);
    boom.start(); boom.stop(ctx.currentTime+0.8);
    // shimmer tail
    const sh = ctx.createOscillator(); const shg = ctx.createGain();
    sh.type = 'sine'; sh.frequency.value = 1760;
    shg.gain.setValueAtTime(0, ctx.currentTime+0.6);
    shg.gain.linearRampToValueAtTime(0.08, ctx.currentTime+0.7);
    shg.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime+1.4);
    sh.connect(shg); shg.connect(ctx.destination);
    sh.start(ctx.currentTime+0.6); sh.stop(ctx.currentTime+1.4);
  } catch(_){}
};

// 🎂 Birthday — playful jingle
const playBirthdaySound = () => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    // Happy bouncy melody
    [[523,0,0.15,0.2],[523,0.16,0.1,0.18],[659,0.28,0.18,0.22],[523,0.48,0.18,0.22],[784,0.68,0.18,0.22],[740,0.88,0.35,0.2]].forEach(([freq,start,dur,gain]) => {
      const osc = ctx.createOscillator(); const g = ctx.createGain();
      osc.type = 'triangle'; osc.frequency.value = freq;
      g.gain.setValueAtTime(0, ctx.currentTime+start);
      g.gain.linearRampToValueAtTime(gain, ctx.currentTime+start+0.02);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime+start+dur);
      osc.connect(g); g.connect(ctx.destination);
      osc.start(ctx.currentTime+start); osc.stop(ctx.currentTime+start+dur);
    });
  } catch(_){}
};

// 🗑 Delete — quick descending swoosh
const playDeleteSound = () => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator(); osc.type = 'sine';
    osc.frequency.setValueAtTime(400, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(60, ctx.currentTime+0.25);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.15, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime+0.25);
    osc.connect(g); g.connect(ctx.destination);
    osc.start(); osc.stop(ctx.currentTime+0.25);
  } catch(_){}
};

const FontImport = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Special+Elite&display=swap');
    @keyframes slideInRight { from{opacity:0;transform:translateX(60px);} to{opacity:1;transform:translateX(0);} }
    @keyframes fadeInUp     { from{opacity:0;transform:translateY(10px);} to{opacity:1;transform:translateY(0);} }
    @keyframes fadeInDown   { from{opacity:0;transform:translateY(-8px);} to{opacity:1;transform:translateY(0);} }
    @keyframes pulse        { 0%,100%{opacity:0.4;} 50%{opacity:1;} }
    @keyframes ringBell     { 0%,100%{transform:rotate(0);} 20%{transform:rotate(15deg);} 40%{transform:rotate(-12deg);} 60%{transform:rotate(8deg);} 80%{transform:rotate(-5deg);} }
    @keyframes birthdayPop  { 0%{transform:scale(0.5) rotate(-10deg);opacity:0;} 70%{transform:scale(1.1) rotate(2deg);} 100%{transform:scale(1) rotate(0);opacity:1;} }
    @keyframes confettiFall { 0%{transform:translateY(-10px) rotate(0deg);opacity:1;} 100%{transform:translateY(60px) rotate(360deg);opacity:0;} }
    @keyframes eventGlow    { 0%,100%{box-shadow:0 0 10px rgba(201,168,76,0.15);} 50%{box-shadow:0 0 28px rgba(201,168,76,0.35);} }
    @keyframes deleteSlide  { from{opacity:1;transform:translateX(0);max-height:200px;} to{opacity:0;transform:translateX(60px);max-height:0;padding:0;margin:0;} }
    @keyframes spin         { to{transform:rotate(360deg)} }
    @keyframes liveDot      { 0%,100%{opacity:1;transform:scale(1);} 50%{opacity:0.3;transform:scale(0.5);} }
    ::-webkit-scrollbar{width:4px;} ::-webkit-scrollbar-track{background:#0a0a08;} ::-webkit-scrollbar-thumb{background:rgba(201,168,76,0.3);border-radius:2px;}
  `}</style>
);

/* ══ Sprockets ══ */
const SprocketRow = ({ count = 10 }) => (
  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-around', padding:'0 8px' }}>
    {Array.from({ length: count }).map((_,i) => (
      <div key={i} style={{ width:11, height:7, background:'#0a0a08', border:'1px solid rgba(201,168,76,0.2)', borderRadius:2 }} />
    ))}
  </div>
);

/* ══ Confetti ══ */
const Confetti = () => (
  <div style={{ position:'absolute', inset:0, overflow:'hidden', pointerEvents:'none', zIndex:0 }}>
    {[...Array(18)].map((_,i) => {
      const colors = ['#c9a84c','#e87c4e','#5b8de8','#4ec9a8','#c94e8d','#fff'];
      return (
        <div key={i} style={{
          position:'absolute',
          left:`${(i * 5.8) % 100}%`, top:`${(i * 13) % 40}%`,
          width: i%3===0 ? 8 : 5, height: i%3===0 ? 8 : 5,
          borderRadius: i%2===0 ? '50%' : 1,
          background: colors[i % colors.length], opacity:0.7,
          animation:`confettiFall ${1.8+(i%4)*0.4}s ${(i%6)*0.3}s ease-in infinite`,
        }} />
      );
    })}
  </div>
);

/* ══ Birthday Card ══ */
const BirthdayCard = ({ daysLeft, isToday }) => {
  useEffect(() => { playBirthdaySound(); }, []);
  return (
  <div style={{
    position:'relative', overflow:'hidden',
    background:'linear-gradient(135deg, #2a1f08, #1a1208)',
    border:'1px solid rgba(201,168,76,0.6)', borderRadius:6, padding:'20px 18px',
    boxShadow:'0 0 30px rgba(201,168,76,0.12)',
    animation:'birthdayPop 0.6s cubic-bezier(0.34,1.56,0.64,1)',
    marginBottom:4, cursor:'pointer',
  }}
  onClick={() => playBirthdaySound()}
  >
    {isToday && <Confetti />}
    <div style={{ position:'relative', zIndex:1 }}>
      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
        <span style={{ fontSize: isToday ? '2rem' : '1.5rem' }}>🎂</span>
        <div>
          <p style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'1.1rem', letterSpacing:'0.2em', color:'#e8c97a', margin:0 }}>
            {isToday ? "HAPPY BIRTHDAY OINDRILA! 🎉" : "BIRTHDAY COUNTDOWN"}
          </p>
          <p style={{ fontFamily:'monospace', fontSize:'0.55rem', letterSpacing:'0.15em', color:'rgba(201,168,76,0.5)', margin:'3px 0 0', textTransform:'uppercase' }}>
            Oindrila Sen · 31st March
          </p>
        </div>
      </div>
      {isToday ? (
        <p style={{ fontFamily:"'Special Elite', monospace", fontSize:'0.85rem', color:'#f2ead8', lineHeight:1.5, margin:0 }}>
          🌟 Today is Queen's Birthday 💛
        </p>
      ) : (
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ textAlign:'center', padding:'8px 14px', background:'rgba(201,168,76,0.1)', border:'1px solid rgba(201,168,76,0.25)', borderRadius:4 }}>
            <p style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'2rem', color:'#c9a84c', margin:0, lineHeight:1 }}>{daysLeft}</p>
            <p style={{ fontFamily:'monospace', fontSize:'0.5rem', color:'rgba(201,168,76,0.5)', letterSpacing:'0.15em', margin:'3px 0 0', textTransform:'uppercase' }}>days left</p>
          </div>
          <p style={{ fontFamily:"'Special Elite', monospace", fontSize:'0.78rem', color:'rgba(255,255,255,0.6)', lineHeight:1.5, margin:0 }}>
            Get ready to celebrate with Oindrila! 🎬✨
          </p>
        </div>
      )}
    </div>
    <div style={{ position:'absolute', bottom:0, left:0, right:0, height:2, background:'linear-gradient(to right, transparent, rgba(201,168,76,0.6), transparent)' }} />
  </div>
  );
};

/* ══ Event Notification Card ══ */
const EventNotifCard = ({ event, isRead, onRead, onDelete }) => {
  const [deleting, setDeleting] = useState(false);

  const eventDate = event.eventDate?.toDate
    ? event.eventDate.toDate()
    : new Date(event.eventDate);
  const now       = new Date();
  const diff      = eventDate - now;
  const isPast    = diff < 0;
  const daysLeft  = Math.ceil(diff / 86400000);

  const dateStr = eventDate.toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' });

  const handleDelete = (e) => {
    e.stopPropagation();
    playDeleteSound();
    setDeleting(true);
    setTimeout(() => onDelete(event.id), 380);
  };

  return (
    <div
      onClick={() => !isRead && onRead(event.id)}
      style={{
        position:'relative', overflow:'hidden',
        background: isRead ? 'rgba(255,255,255,0.02)' : 'rgba(201,168,76,0.05)',
        border:`1px solid ${isRead ? 'rgba(255,255,255,0.06)' : 'rgba(201,168,76,0.35)'}`,
        borderRadius:6, padding:'14px 16px',
        cursor: isRead ? 'default' : 'pointer',
        transition:'all 0.2s',
        animation: deleting ? 'deleteSlide 0.38s ease forwards' : 'fadeInDown 0.4s ease',
        ...(isRead ? {} : { animationName: deleting ? 'deleteSlide' : 'eventGlow, fadeInDown' }),
      }}
      onMouseEnter={e => { if (!isRead) e.currentTarget.style.background='rgba(201,168,76,0.09)'; }}
      onMouseLeave={e => { if (!isRead) e.currentTarget.style.background='rgba(201,168,76,0.05)'; }}
    >
      {/* unread dot */}
      {!isRead && <div style={{ position:'absolute', top:10, right:36, width:7, height:7, borderRadius:'50%', background:'#c9a84c', animation:'pulse 2s infinite' }} />}

      {/* left accent — gold for event */}
      <div style={{ position:'absolute', left:0, top:0, bottom:0, width:3, background:'linear-gradient(to bottom, #e8c97a, #c9a84c)', opacity: isRead ? 0.3 : 1 }} />

      {/* Delete button — always visible */}
      <button
        onClick={handleDelete}
        title="Delete notification"
        style={{
          position:'absolute', top:10, right:10,
          width:22, height:22, borderRadius:'50%',
          background:'rgba(192,57,43,0.0)', border:'1px solid transparent',
          color:'rgba(192,57,43,0.25)', cursor:'pointer',
          display:'flex', alignItems:'center', justifyContent:'center',
          transition:'all 0.2s',
        }}
        onMouseEnter={e => { e.currentTarget.style.background='rgba(192,57,43,0.15)'; e.currentTarget.style.borderColor='rgba(192,57,43,0.4)'; e.currentTarget.style.color='#e74c3c'; }}
        onMouseLeave={e => { e.currentTarget.style.background='rgba(192,57,43,0)'; e.currentTarget.style.borderColor='transparent'; e.currentTarget.style.color='rgba(192,57,43,0.25)'; }}
      >
        <Trash2 size={11}/>
      </button>

      <div style={{ display:'flex', alignItems:'flex-start', gap:12, paddingLeft:6, paddingRight:20 }}>
        {/* Poster thumb */}
        <div style={{ width:38, height:52, flexShrink:0, borderRadius:2, overflow:'hidden', border:'1px solid rgba(201,168,76,0.3)', background:'#0a0806' }}>
          {event.mediaUrl && event.mediaType !== 'video'
            ? <img src={event.mediaUrl} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
            : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.1rem' }}>🎬</div>
          }
        </div>

        <div style={{ flex:1, minWidth:0 }}>
          {/* Type badge */}
          <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:4 }}>
            <span style={{
              fontFamily:'monospace', fontSize:'0.42rem', letterSpacing:'0.22em', textTransform:'uppercase',
              padding:'2px 6px', borderRadius:2,
              background: isPast ? 'rgba(192,57,43,0.15)' : 'rgba(201,168,76,0.12)',
              border:`1px solid ${isPast ? 'rgba(192,57,43,0.35)' : 'rgba(201,168,76,0.3)'}`,
              color: isPast ? '#e74c3c' : '#c9a84c',
              display:'flex', alignItems:'center', gap:3,
            }}>
              {isPast
                ? <>🎬 EVENT</>
                : <><span style={{ width:5, height:5, borderRadius:'50%', background:'#c9a84c', display:'inline-block', animation:'liveDot 1.2s infinite' }}/>UPCOMING</>
              }
            </span>
            {event.category && (
              <span style={{ fontFamily:'monospace', fontSize:'0.42rem', letterSpacing:'0.18em', textTransform:'uppercase', padding:'2px 6px', borderRadius:2, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', color:'rgba(255,255,255,0.35)' }}>
                {event.category}
              </span>
            )}
            {!isRead && (
              <span style={{ fontFamily:'monospace', fontSize:'0.42rem', letterSpacing:'0.15em', textTransform:'uppercase', padding:'1px 6px', borderRadius:2, background:'rgba(201,168,76,0.15)', border:'1px solid rgba(201,168,76,0.4)', color:'#c9a84c' }}>NEW</span>
            )}
          </div>

          <p style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'0.92rem', letterSpacing:'0.1em', color: isRead ? 'rgba(255,255,255,0.4)' : '#f2ead8', textTransform:'uppercase', margin:'0 0 4px', lineHeight:1.2 }}>
            {event.title}
          </p>

          {event.description && (
            <p style={{ fontFamily:"'Special Elite', monospace", fontSize:'0.68rem', color: isRead ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.55)', margin:'0 0 6px', lineHeight:1.4 }}>
              {event.description.slice(0, 90)}{event.description.length > 90 ? '...' : ''}
            </p>
          )}

          <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
            <span style={{ fontFamily:'monospace', fontSize:'0.46rem', letterSpacing:'0.14em', color:'rgba(201,168,76,0.45)', display:'flex', alignItems:'center', gap:4 }}>
              <Calendar size={9}/> {dateStr}
            </span>
            {!isPast && daysLeft > 0 && (
              <span style={{ fontFamily:'monospace', fontSize:'0.44rem', letterSpacing:'0.14em', color: daysLeft <= 2 ? '#e74c3c' : 'rgba(201,168,76,0.5)', fontWeight: daysLeft <= 2 ? 'bold' : 'normal' }}>
                {daysLeft === 1 ? '⚡ Tomorrow!' : `${daysLeft} days left`}
              </span>
            )}
            {isPast && (
              <span style={{ fontFamily:'monospace', fontSize:'0.44rem', letterSpacing:'0.14em', color:'rgba(255,255,255,0.2)' }}>Completed</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ══ Regular Notification Card ══ */
const NotifCard = ({ notif, isRead, onRead, onDelete }) => {
  const [deleting, setDeleting] = useState(false);
  const isBirthday = notif.type === 'birthday';

  const time = notif.createdAt?.toDate
    ? notif.createdAt.toDate().toLocaleString('en-BD', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' })
    : 'Recently';

  const handleDelete = (e) => {
    e.stopPropagation();
    playDeleteSound();
    setDeleting(true);
    setTimeout(() => onDelete(notif.id), 380);
  };

  return (
    <div
      onClick={() => !isRead && onRead(notif.id)}
      style={{
        position:'relative', overflow:'hidden',
        background: isRead ? 'rgba(255,255,255,0.02)' : 'rgba(201,168,76,0.06)',
        border:`1px solid ${isRead ? 'rgba(255,255,255,0.06)' : 'rgba(201,168,76,0.3)'}`,
        borderRadius:6, padding:'14px 16px',
        cursor: isRead ? 'default' : 'pointer',
        transition:'all 0.2s',
        animation: deleting ? 'deleteSlide 0.38s ease forwards' : 'fadeInUp 0.35s ease',
      }}
      onMouseEnter={e => { if (!isRead) e.currentTarget.style.background='rgba(201,168,76,0.1)'; }}
      onMouseLeave={e => { if (!isRead) e.currentTarget.style.background='rgba(201,168,76,0.06)'; }}
    >
      {!isRead && <div style={{ position:'absolute', top:10, right:36, width:7, height:7, borderRadius:'50%', background:'#c9a84c', animation:'pulse 2s infinite' }} />}
      <div style={{ position:'absolute', left:0, top:0, bottom:0, width:3, background: isBirthday ? '#e87c4e' : '#c9a84c', opacity: isRead ? 0.3 : 1 }} />

      {/* Delete button */}
      {notif.type !== 'birthday' && (
        <button
          onClick={handleDelete}
          title="Delete notification"
          style={{
            position:'absolute', top:10, right:10,
            width:22, height:22, borderRadius:'50%',
            background:'rgba(192,57,43,0)', border:'1px solid transparent',
            color:'rgba(192,57,43,0.25)', cursor:'pointer',
            display:'flex', alignItems:'center', justifyContent:'center',
            transition:'all 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background='rgba(192,57,43,0.15)'; e.currentTarget.style.borderColor='rgba(192,57,43,0.4)'; e.currentTarget.style.color='#e74c3c'; }}
          onMouseLeave={e => { e.currentTarget.style.background='rgba(192,57,43,0)'; e.currentTarget.style.borderColor='transparent'; e.currentTarget.style.color='rgba(192,57,43,0.25)'; }}
        >
          <Trash2 size={11}/>
        </button>
      )}

      <div style={{ display:'flex', alignItems:'flex-start', gap:12, paddingLeft:6, paddingRight: notif.type !== 'birthday' ? 20 : 6 }}>
        <span style={{ fontSize:'1.3rem', flexShrink:0, marginTop:1 }}>
          {isBirthday ? '🎂' : <Megaphone size={18} style={{ color: isRead ? 'rgba(201,168,76,0.3)' : '#c9a84c', marginTop:2 }} />}
        </span>
        <div style={{ flex:1, minWidth:0 }}>
          <p style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'0.95rem', letterSpacing:'0.12em', color: isRead ? 'rgba(255,255,255,0.4)' : '#f2ead8', textTransform:'uppercase', margin:'0 0 4px', lineHeight:1.2 }}>
            {notif.title}
          </p>
          <p style={{ fontFamily:"'Special Elite', monospace", fontSize:'0.72rem', color: isRead ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.6)', margin:'0 0 8px', lineHeight:1.4 }}>
            {notif.body}
          </p>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:6 }}>
            <div style={{ display:'flex', alignItems:'center', gap:6 }}>
              <span style={{ fontFamily:'monospace', fontSize:'0.5rem', letterSpacing:'0.12em', color:'rgba(255,255,255,0.2)', textTransform:'uppercase' }}>{time}</span>
              {notif.category && (
                <span style={{ fontFamily:'monospace', fontSize:'0.48rem', letterSpacing:'0.15em', textTransform:'uppercase', padding:'1px 6px', borderRadius:2, background:'rgba(201,168,76,0.1)', border:'1px solid rgba(201,168,76,0.2)', color:'rgba(201,168,76,0.5)' }}>
                  {notif.category}
                </span>
              )}
              {!isRead && (
                <span style={{ fontFamily:'monospace', fontSize:'0.45rem', letterSpacing:'0.15em', textTransform:'uppercase', padding:'1px 6px', borderRadius:2, background:'rgba(201,168,76,0.15)', border:'1px solid rgba(201,168,76,0.4)', color:'#c9a84c' }}>NEW</span>
              )}
            </div>
            {notif.link && (
              <a href={notif.link} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}
                style={{ display:'inline-flex', alignItems:'center', gap:5, fontFamily:"'Bebas Neue', sans-serif", fontSize:'0.65rem', letterSpacing:'0.18em', padding:'4px 10px', background:'rgba(201,168,76,0.12)', border:'1px solid rgba(201,168,76,0.3)', borderRadius:2, color:'#c9a84c', textDecoration:'none', transition:'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.background='#c9a84c'; e.currentTarget.style.color='#0a0a08'; }}
                onMouseLeave={e => { e.currentTarget.style.background='rgba(201,168,76,0.12)'; e.currentTarget.style.color='#c9a84c'; }}>
                Wanna See?? <ExternalLink size={10}/>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ══ Toast popup ══ */
const NotifToast = ({ notif, onClose }) => (
  <div style={{
    position:'fixed', bottom:24, left:24, zIndex:999,
    background:'#0e0e0b', border:`1px solid ${notif.type === 'event' ? 'rgba(201,168,76,0.6)' : 'rgba(201,168,76,0.5)'}`,
    borderRadius:6, padding:'12px 14px', maxWidth:300,
    boxShadow:'0 8px 30px rgba(0,0,0,0.7)',
    animation:'slideInRight 0.4s cubic-bezier(0.34,1.56,0.64,1)',
    display:'flex', gap:10, alignItems:'flex-start',
  }}>
    <span style={{ fontSize:'1.2rem', flexShrink:0 }}>
      {notif.type === 'birthday' ? '🎂' : notif.type === 'event' ? '🎬' : '📢'}
    </span>
    <div style={{ flex:1, minWidth:0 }}>
      <p style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'0.8rem', letterSpacing:'0.15em', color:'#c9a84c', margin:'0 0 3px', textTransform:'uppercase' }}>{notif.title}</p>
      <p style={{ fontFamily:'monospace', fontSize:'0.6rem', color:'rgba(255,255,255,0.5)', margin:0, lineHeight:1.4 }}>
        {(notif.body || notif.description || '')?.slice(0,80)}
        {(notif.body || notif.description || '')?.length > 80 ? '...' : ''}
      </p>
    </div>
    <button onClick={onClose} style={{ background:'none', border:'none', color:'rgba(201,168,76,0.4)', cursor:'pointer', flexShrink:0, padding:2 }}><X size={13}/></button>
  </div>
);

/* ══════════════════════════════════════
   MAIN FanNotifications
══════════════════════════════════════ */
const FanNotifications = () => {
  const navigate                             = useNavigate();
  const [user,           setUser]           = useState(null);
  const [authLoading,    setAuthLoading]    = useState(true);
  const [announcements,  setAnnouncements]  = useState([]);
  const [events,         setEvents]         = useState([]);
  const [readIds,        setReadIds]        = useState(new Set());
  const [deletedIds,     setDeletedIds]     = useState(new Set()); // locally deleted
  const [toast,          setToast]          = useState(null);
  const [activeTab,      setActiveTab]      = useState('all');
  const [bellAnim,       setBellAnim]       = useState(false);
  const prevAnnouncCount = useRef(0);
  const prevEventCount   = useRef(0);
  const socketRef        = useRef(null);

  /* ── Birthday calc ── */
  const getBirthdayInfo = () => {
    const now  = new Date();
    const bday = new Date(now.getFullYear(), 2, 31);
    if (now > bday) bday.setFullYear(now.getFullYear() + 1);
    const diff    = Math.ceil((bday - now) / 86400000);
    const isToday = now.getMonth() === 2 && now.getDate() === 31;
    return { daysLeft: isToday ? 0 : diff, isToday };
  };
  const { daysLeft, isToday } = getBirthdayInfo();

  /* ── Auth gate ── */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) { navigate('/fan-zone'); return; }
      setUser(u);
      setAuthLoading(false);
      try {
        const snap = await getDoc(doc(db, 'fans', u.uid));
        if (snap.exists()) {
          const data = snap.data();
          setReadIds(new Set(data.readNotifs || []));
          setDeletedIds(new Set(data.deletedNotifs || []));
        }
      } catch (_) {}
    });
    return () => unsub();
  }, [navigate]);

  /* ── Socket.io ── */
  useEffect(() => {
    const socket = io(SOCKET_URL, {
      transports:['websocket','polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });
    socketRef.current = socket;

    socket.on('connect', () => console.log('🔌 Fan socket connected'));
    socket.on('disconnect', () => console.log('❌ Fan socket disconnected'));

    socket.on('event:new', (ev) => {
      playEventSound();
      setBellAnim(true);
      setTimeout(() => setBellAnim(false), 1500);
      setToast({ ...ev, type:'event' });
      setTimeout(() => setToast(null), 7000);
    });

    socket.on('event:reminder', (ev) => {
      playEventSound();
      setBellAnim(true);
      setTimeout(() => setBellAnim(false), 1500);
      setToast({ ...ev, type:'event', title:`⏰ REMINDER: ${ev.title}` });
      setTimeout(() => setToast(null), 8000);
    });

    return () => socket.disconnect();
  }, []);

  /* ── Realtime announcements ── */
  useEffect(() => {
    if (!user) return;
    let initialized = false;
    const q     = query(collection(db, 'updates'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      const items = snap.docs.map(d => ({
        id: d.id, ...d.data(), type:'announcement',
        body: `New ${d.data().type === 'Announcement' ? 'Announcement' : 'Task'}: ${d.data().category}`,
        link: d.data().link || null,
      }));
      if (!initialized) {
        prevAnnouncCount.current = items.length;
        initialized = true;
      } else if (items.length > prevAnnouncCount.current) {
        playNotifSound();
        setBellAnim(true);
        setTimeout(() => setBellAnim(false), 1000);
        setToast(items[0]);
        setTimeout(() => setToast(null), 5000);
        prevAnnouncCount.current = items.length;
      } else {
        prevAnnouncCount.current = items.length;
      }
      setAnnouncements(items);
    });
    return () => unsub();
  }, [user]);

  /* ── Realtime events ── */
  useEffect(() => {
    if (!user) return;
    let initialized = false;
    const q     = query(collection(db, 'events'), where('status','==','active'), orderBy('eventDate','asc'));
    const unsub = onSnapshot(q, (snap) => {
      const items = snap.docs.map(d => ({ id: d.id, ...d.data(), type:'event' }));
      if (!initialized) {
        // first load — just set count, no sound
        prevEventCount.current = items.length;
        initialized = true;
      } else if (items.length > prevEventCount.current) {
        // new event added after page load
        playEventSound();
        setBellAnim(true);
        setTimeout(() => setBellAnim(false), 1200);
        setToast({ ...items[items.length-1], type:'event' });
        setTimeout(() => setToast(null), 6000);
        prevEventCount.current = items.length;
      } else {
        prevEventCount.current = items.length;
      }
      setEvents(items);
    });
    return () => unsub();
  }, [user]);

  /* ── Mark as read ── */
  const markRead = async (id) => {
    if (readIds.has(id) || !user) return;
    setReadIds(prev => new Set([...prev, id]));
    try { await updateDoc(doc(db, 'fans', user.uid), { readNotifs: arrayUnion(id) }); } catch (_) {}
  };

  const markAllRead = async () => {
    const ids = [...announcements.map(a => a.id), ...events.map(e => e.id)];
    setReadIds(new Set(ids));
    if (!user) return;
    try { await updateDoc(doc(db, 'fans', user.uid), { readNotifs: ids }); } catch (_) {}
  };

  /* ── Delete notification (local only — saves to Firestore so it persists) ── */
  const handleDelete = async (id) => {
    setDeletedIds(prev => new Set([...prev, id]));
    if (!user) return;
    try { await updateDoc(doc(db, 'fans', user.uid), { deletedNotifs: arrayUnion(id) }); } catch (_) {}
  };

  /* ── Birthday notif object ── */
  const birthdayNotif = {
    id: 'birthday-oindrila', type:'birthday',
    title: isToday ? '🎂 HAPPY BIRTHDAY OINDRILA!' : '🎂 Birthday Coming Soon!',
    body:  isToday
      ?  'Today is her birthday! 🎉'
      : `Oindrila Sen's birthday is in ${daysLeft} days! 31st March 🎂`,
    createdAt: null,
  };

  /* ── Visible items (excluding deleted) ── */
  const visibleAnnouncements = announcements.filter(a => !deletedIds.has(a.id));
  const visibleEvents        = events.filter(e => !deletedIds.has(e.id));

  const allNotifs    = [birthdayNotif, ...visibleEvents, ...visibleAnnouncements];
  const unreadCount  = allNotifs.filter(n => !readIds.has(n.id)).length;

  const filtered =
    activeTab === 'unread'   ? allNotifs.filter(n => !readIds.has(n.id)) :
    activeTab === 'events'   ? visibleEvents :
    activeTab === 'birthday' ? [birthdayNotif] :
    allNotifs;

  if (authLoading) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#080806' }}>
      <div style={{ width:28, height:28, border:'2px solid #c9a84c', borderTopColor:'transparent', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div style={{ minHeight:'100vh', background:'#080806', color:'#f2ead8', display:'flex', flexDirection:'column' }}>
      <FontImport />

      {/* ══ HEADER ══ */}
      <div style={{ background:'#0e0e0b', borderBottom:'1px solid rgba(201,168,76,0.15)', flexShrink:0 }}>
        <div style={{ padding:'5px 0', borderBottom:'1px solid rgba(201,168,76,0.08)' }}>
          <SprocketRow count={12} />
        </div>

        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 20px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ position:'relative' }}>
              <Bell size={22} style={{ color:'#c9a84c', animation: bellAnim ? 'ringBell 0.7s ease' : 'none' }} />
              {unreadCount > 0 && (
                <div style={{ position:'absolute', top:-5, right:-5, width:16, height:16, borderRadius:'50%', background:'#c0392b', border:'1.5px solid #080806', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <span style={{ fontFamily:'monospace', fontSize:'0.45rem', color:'#fff', fontWeight:'bold' }}>{unreadCount > 9 ? '9+' : unreadCount}</span>
                </div>
              )}
            </div>
            <div>
              <h1 style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'1.3rem', letterSpacing:'0.2em', color:'#c9a84c', margin:0, lineHeight:1 }}>NOTIFICATIONS</h1>
              <p style={{ fontFamily:'monospace', fontSize:'0.5rem', letterSpacing:'0.18em', color:'rgba(201,168,76,0.35)', margin:'3px 0 0', textTransform:'uppercase' }}>Fan Zone · Oindrila Sen</p>
            </div>
          </div>
          {unreadCount > 0 && (
            <button onClick={markAllRead} style={{ display:'flex', alignItems:'center', gap:5, padding:'6px 12px', background:'rgba(201,168,76,0.08)', border:'1px solid rgba(201,168,76,0.2)', borderRadius:3, cursor:'pointer', color:'rgba(201,168,76,0.6)', fontFamily:"'Bebas Neue', sans-serif", fontSize:'0.65rem', letterSpacing:'0.2em', transition:'all 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.background='rgba(201,168,76,0.15)'}
              onMouseLeave={e => e.currentTarget.style.background='rgba(201,168,76,0.08)'}>
              <BellOff size={13}/> Mark All Read
            </button>
          )}
        </div>

        {/* Tabs */}
        <div style={{ display:'flex', borderTop:'1px solid rgba(201,168,76,0.08)' }}>
          {[
            { key:'all',      label:`All (${allNotifs.length})` },
            { key:'unread',   label:`Unread (${unreadCount})` },
            { key:'events',   label:`🎬 Events (${visibleEvents.length})` },
            { key:'birthday', label:'🎂 Birthday' },
          ].map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
              flex:1, padding:'9px 4px', cursor:'pointer',
              fontFamily:"'Bebas Neue', sans-serif", fontSize:'0.62rem', letterSpacing:'0.15em', textTransform:'uppercase',
              background: activeTab === tab.key ? 'rgba(201,168,76,0.08)' : 'transparent',
              color: activeTab === tab.key ? '#c9a84c' : 'rgba(201,168,76,0.3)',
              border:'none', borderBottom: activeTab === tab.key ? '2px solid #c9a84c' : '2px solid transparent',
              transition:'all 0.2s',
            }}>{tab.label}</button>
          ))}
        </div>
      </div>

      {/* ══ CONTENT ══ */}
      <div style={{ flex:1, overflowY:'auto', padding:'16px 16px 40px', maxWidth:680, width:'100%', margin:'0 auto' }}>

        {/* Birthday card */}
        {(activeTab === 'all' || activeTab === 'birthday') && (
          <div style={{ marginBottom:16 }}>
            <BirthdayCard daysLeft={daysLeft} isToday={isToday} />
          </div>
        )}

        {/* List */}
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {filtered.filter(n => n.id !== 'birthday-oindrila').length === 0 && activeTab !== 'birthday' ? (
            <div style={{ textAlign:'center', padding:'40px 0' }}>
              <Bell size={32} style={{ color:'rgba(201,168,76,0.15)', marginBottom:12, display:'block', margin:'0 auto 12px' }} />
              <p style={{ fontFamily:'monospace', fontSize:'0.65rem', color:'rgba(255,255,255,0.15)', letterSpacing:'0.15em', textTransform:'uppercase' }}>
                {activeTab === 'unread' ? 'No unread notification' : activeTab === 'events' ? 'No events' : 'No notifications'}
              </p>
            </div>
          ) : (
            filtered.filter(n => n.id !== 'birthday-oindrila').map(notif =>
              notif.type === 'event'
                ? <EventNotifCard key={notif.id} event={notif} isRead={readIds.has(notif.id)} onRead={markRead} onDelete={handleDelete} />
                : <NotifCard      key={notif.id} notif={notif} isRead={readIds.has(notif.id)} onRead={markRead} onDelete={handleDelete} />
            )
          )}
        </div>
      </div>

      {/* Bottom sprockets */}
      <div style={{ background:'#0e0e0b', padding:'5px 0', borderTop:'1px solid rgba(201,168,76,0.08)', flexShrink:0 }}>
        <SprocketRow count={12} />
      </div>

      {toast && <NotifToast notif={toast} onClose={() => setToast(null)} />}
    </div>
  );
};

export default FanNotifications;