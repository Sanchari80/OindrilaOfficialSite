import React, { useState, useEffect, useRef } from 'react';
import { db } from '../../firebase/firebaseConfig';
import {
  collection, addDoc, getDocs, deleteDoc, doc,
  serverTimestamp, query, orderBy, Timestamp,
  updateDoc, onSnapshot, where
} from 'firebase/firestore';
import { Trash2, ListFilter, Image as ImageIcon, Clock, Calendar, Film as FilmIcon, Music, Video, Archive } from 'lucide-react';
import toast from 'react-hot-toast';
import { io } from 'socket.io-client';
import CustomInput from '../../components/UI/CustomInput';
import CustomButton from '../../components/UI/CustomButton';

const SOCKET_URL = 'https://oindrilaofficialsite.onrender.com';
const CLOUD_NAME    = "danbshghf";
const UPLOAD_PRESET = "danbshghf";
const ADMIN_PASS    = import.meta.env.VITE_ADMIN_PASS;

const FontImport = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Special+Elite&display=swap');
    @keyframes modalFadeIn  { from { opacity:0; transform:scale(0.96); } to { opacity:1; transform:scale(1); } }
    @keyframes modalSlideUp { from { opacity:0; transform:translateY(30px); } to { opacity:1; transform:translateY(0); } }
    @keyframes flyerPop {
      0%   { opacity:0; transform:translate(0,0) rotate(0deg) scale(0.4); }
      20%  { opacity:1; }
      80%  { opacity:0.7; transform:translate(var(--tx),var(--ty)) rotate(var(--rot)) scale(1); }
      100% { opacity:0; transform:translate(calc(var(--tx)*1.2),calc(var(--ty)*1.3)) rotate(calc(var(--rot)*1.5)) scale(0.5); }
    }
    @keyframes eventCardIn { from{opacity:0;transform:translateY(12px);} to{opacity:1;transform:translateY(0);} }
    @keyframes livePulse { 0%,100%{opacity:1;} 50%{opacity:0.3;} }
  `}</style>
);

/* ══ Admin Lock Screen ══ */
const AdminLock = ({ onUnlock }) => {
  const [input,  setInput]  = useState('');
  const [shake,  setShake]  = useState(false);
  const [show,   setShow]   = useState(false);
  const [tries,  setTries]  = useState(0);
  const inputRef = useRef(null);

  useEffect(() => { setTimeout(() => inputRef.current?.focus(), 200); }, []);

  const handleSubmit = () => {
    if (input === ADMIN_PASS) {
      onUnlock();
    } else {
      setShake(true);
      setTries(t => t + 1);
      setInput('');
      setTimeout(() => setShake(false), 600);
    }
  };

  return (
    <div style={{
      minHeight:'100vh', background:'#080806',
      display:'flex', alignItems:'center', justifyContent:'center',
      fontFamily:"'Bebas Neue', sans-serif",
    }}>
      <style>{`
        @keyframes lockShake {
          0%,100%{transform:translateX(0);}
          20%{transform:translateX(-8px);}
          40%{transform:translateX(8px);}
          60%{transform:translateX(-5px);}
          80%{transform:translateX(5px);}
        }
        @keyframes lockFadeIn { from{opacity:0;transform:translateY(20px);} to{opacity:1;transform:translateY(0);} }
      `}</style>

      <div style={{
        width:'100%', maxWidth:360, padding:'40px 32px',
        background:'#0e0e0b', border:'1px solid rgba(201,168,76,0.2)',
        borderRadius:8, boxShadow:'0 20px 60px rgba(0,0,0,0.8)',
        animation:'lockFadeIn 0.5s ease',
      }}>
        {/* Sprocket strip top */}
        <div style={{ display:'flex', justifyContent:'space-around', marginBottom:24 }}>
          {Array.from({length:8}).map((_,i) => (
            <div key={i} style={{ width:10, height:7, background:'#0a0a08', border:'1px solid rgba(201,168,76,0.2)', borderRadius:2 }} />
          ))}
        </div>

        {/* Lock icon */}
        <div style={{ textAlign:'center', marginBottom:20 }}>
          <div style={{ fontSize:'2.2rem', marginBottom:8 }}>🎬</div>
          <h1 style={{ fontSize:'1.4rem', letterSpacing:'0.25em', color:'#c9a84c', margin:'0 0 4px' }}>CONTROL PANEL</h1>
          <p style={{ fontFamily:'monospace', fontSize:'0.5rem', letterSpacing:'0.2em', color:'rgba(201,168,76,0.3)', textTransform:'uppercase', margin:0 }}>
            Restricted Access · Oindrila Official
          </p>
        </div>

        {/* Input */}
        <div style={{ animation: shake ? 'lockShake 0.5s ease' : 'none', marginBottom:16 }}>
          <div style={{ position:'relative' }}>
            <input
              ref={inputRef}
              type={show ? 'text' : 'password'}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              placeholder="Enter password..."
              style={{
                width:'100%', padding:'12px 44px 12px 16px',
                background:'rgba(201,168,76,0.05)',
                border:`1px solid ${shake ? 'rgba(192,57,43,0.6)' : 'rgba(201,168,76,0.25)'}`,
                borderRadius:4, color:'#f2ead8',
                fontFamily:'monospace', fontSize:'0.85rem',
                outline:'none', boxSizing:'border-box',
                transition:'border-color 0.2s',
              }}
              onFocus={e => e.target.style.borderColor='rgba(201,168,76,0.5)'}
              onBlur={e  => e.target.style.borderColor= shake ? 'rgba(192,57,43,0.6)' : 'rgba(201,168,76,0.25)'}
            />
            {/* show/hide toggle */}
            <button
              type="button"
              onClick={() => setShow(s => !s)}
              style={{
                position:'absolute', right:12, top:'50%', transform:'translateY(-50%)',
                background:'none', border:'none', cursor:'pointer',
                color:'rgba(201,168,76,0.4)', fontSize:'0.75rem', fontFamily:'monospace',
                letterSpacing:'0.1em', padding:0,
              }}
            >{show ? 'HIDE' : 'SHOW'}</button>
          </div>

          {tries > 0 && (
            <p style={{ fontFamily:'monospace', fontSize:'0.48rem', color:'rgba(192,57,43,0.7)', letterSpacing:'0.15em', textTransform:'uppercase', margin:'6px 0 0', textAlign:'center' }}>
              ✕ Incorrect password{tries > 2 ? ` (${tries} attempts)` : ''}
            </p>
          )}
        </div>

        {/* Submit button */}
        <button
          onClick={handleSubmit}
          style={{
            width:'100%', padding:'12px',
            background:'rgba(201,168,76,0.12)',
            border:'1px solid rgba(201,168,76,0.35)',
            borderRadius:4, color:'#c9a84c', cursor:'pointer',
            fontFamily:"'Bebas Neue', sans-serif",
            fontSize:'0.9rem', letterSpacing:'0.25em',
            transition:'all 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background='#c9a84c'; e.currentTarget.style.color='#0a0a08'; }}
          onMouseLeave={e => { e.currentTarget.style.background='rgba(201,168,76,0.12)'; e.currentTarget.style.color='#c9a84c'; }}
        >
          ENTER
        </button>

        {/* Sprocket strip bottom */}
        <div style={{ display:'flex', justifyContent:'space-around', marginTop:24 }}>
          {Array.from({length:8}).map((_,i) => (
            <div key={i} style={{ width:10, height:7, background:'#0a0a08', border:'1px solid rgba(201,168,76,0.2)', borderRadius:2 }} />
          ))}
        </div>
      </div>
    </div>
  );
};

/* ══ Cloudinary upload helper ══ */
const uploadToCloudinary = async (file, resourceType = 'image') => {
  const fd = new FormData();
  fd.append('file', file);
  fd.append('upload_preset', UPLOAD_PRESET);
  const res  = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`, { method:'POST', body:fd });
  const data = await res.json();
  if (!data.secure_url) throw new Error('Cloudinary upload failed');
  return data.secure_url;
};

/* ══ SOUNDS ══ */
const playExpandSound = () => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(80, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(520, ctx.currentTime + 0.18);
    osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.4);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, ctx.currentTime);
    g.gain.linearRampToValueAtTime(0.22, ctx.currentTime + 0.06);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
    const noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 0.3, ctx.sampleRate);
    const nd = noiseBuf.getChannelData(0);
    for (let i = 0; i < nd.length; i++) nd[i] = (Math.random()*2-1) * Math.pow(1-i/nd.length, 3) * 0.12;
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuf;
    const nf = ctx.createBiquadFilter();
    nf.type = 'bandpass'; nf.frequency.value = 1200; nf.Q.value = 0.6;
    const ng = ctx.createGain();
    ng.gain.setValueAtTime(0.3, ctx.currentTime);
    ng.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc.connect(g); g.connect(ctx.destination);
    noise.connect(nf); nf.connect(ng); ng.connect(ctx.destination);
    osc.start(); osc.stop(ctx.currentTime + 0.45);
    noise.start(); noise.stop(ctx.currentTime + 0.3);
  } catch (_) {}
};

const playCollapseSound = () => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.25);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.15, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.28);
    osc.connect(g); g.connect(ctx.destination);
    osc.start(); osc.stop(ctx.currentTime + 0.28);
  } catch (_) {}
};

/* ══ FLYER BURST ══ */
const FlyerBurst = ({ active }) => {
  const svgs = [
    <svg viewBox="0 0 60 16" fill="none" width="50" height="14"><rect x="1" y="1" width="58" height="14" rx="1" stroke="#c9a84c" strokeWidth="1"/>{[0,1,2,3,4,5].map(i=><rect key={i} x={4+i*10} y="3" width="5" height="3" rx="0.5" fill="rgba(201,168,76,0.6)"/>)}{[0,1,2,3,4,5].map(i=><rect key={i} x={4+i*10} y="10" width="5" height="3" rx="0.5" fill="rgba(201,168,76,0.6)"/>)}</svg>,
    <svg viewBox="0 0 30 30" fill="none" width="26" height="26"><circle cx="15" cy="15" r="13" stroke="#c9a84c" strokeWidth="1"/><circle cx="15" cy="15" r="3" fill="#c9a84c" opacity="0.7"/>{[0,60,120,180,240,300].map((d,i)=>{const r=d*Math.PI/180;return<circle key={i} cx={15+11*Math.cos(r)} cy={15+11*Math.sin(r)} r="1.8" fill="#0a0a08" stroke="#c9a84c" strokeWidth="0.6"/>})}</svg>,
    <svg viewBox="0 0 24 24" fill="none" width="22" height="22"><polygon points="12,2 14,9 22,9 16,14 18,21 12,17 6,21 8,14 2,9 10,9" stroke="#c9a84c" strokeWidth="1" fill="rgba(201,168,76,0.15)"/></svg>,
    <svg viewBox="0 0 40 28" fill="none" width="36" height="24"><rect x="1" y="8" width="38" height="19" rx="1" stroke="#c9a84c" strokeWidth="1"/><rect x="1" y="1" width="38" height="9" rx="1" stroke="#c9a84c" strokeWidth="1" fill="rgba(201,168,76,0.1)"/>{[0,1,2,3].map(i=><line key={i} x1={4+i*10} y1="1" x2={i*10} y2="10" stroke="rgba(201,168,76,0.6)" strokeWidth="1.5"/>)}</svg>,
  ];
  const particles = [
    { x:-80, y:-120, rot:-25, s:0, delay:0  },
    { x: 60, y:-140, rot: 18, s:1, delay:40 },
    { x:-50, y: -90, rot:-10, s:2, delay:20 },
    { x:100, y:-100, rot: 30, s:3, delay:60 },
    { x:-30, y:-160, rot:-35, s:0, delay:80 },
    { x: 80, y: -70, rot: 15, s:2, delay:10 },
  ];
  if (!active) return null;
  return (
    <div style={{ position:'absolute', top:0, left:'50%', pointerEvents:'none', zIndex:30 }}>
      {particles.map((p,i) => (
        <div key={i} style={{
          position:'absolute', left:0, top:0,
          animation:`flyerPop 0.85s cubic-bezier(0.2,0.8,0.4,1) ${p.delay}ms forwards`,
          '--tx':`${p.x}px`, '--ty':`${p.y}px`, '--rot':`${p.rot}deg`,
        }}>{svgs[p.s]}</div>
      ))}
    </div>
  );
};

/* ══ Sprockets ══ */
const Sprockets = ({ count = 6 }) => (
  <div style={{ display:'flex', flexDirection:'column', justifyContent:'space-around', alignItems:'center', padding:'8px 0', height:'100%' }}>
    {Array.from({ length: count }).map((_,i) => (
      <div key={i} style={{ width:10, height:7, borderRadius:2, margin:'2px 0', flexShrink:0, background:'#0a0a08', border:'1px solid rgba(201,168,76,0.2)', boxShadow:'inset 0 1px 2px rgba(0,0,0,0.8)' }} />
    ))}
  </div>
);

/* ══ Expiry countdown helper ══ */
const getExpiryInfo = (expiresAt) => {
  if (!expiresAt) return null;
  const expMs = expiresAt.toDate ? expiresAt.toDate().getTime() : new Date(expiresAt).getTime();
  const now   = Date.now();
  const diff  = expMs - now;
  if (diff <= 0) return { expired:true, label:'EXPIRED' };
  const hrs  = Math.floor(diff / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  if (hrs >= 24) return { expired:false, label:`${Math.floor(hrs/24)}d ${hrs%24}h left` };
  if (hrs > 0)   return { expired:false, label:`${hrs}h ${mins}m left` };
  return { expired:false, label:`${mins}m left` };
};

/* ══ FilmExpandCard (Updates list) ══ */
const FilmExpandCard = ({ item, isOpen, onToggle, onDelete, index }) => {
  const [burst, setBurst] = useState(false);
  const expiryInfo = getExpiryInfo(item.expiresAt);
  const isExpired  = expiryInfo?.expired;
  const frameNum   = String(index + 1).padStart(3, '0');

  const handleToggle = () => {
    if (!isOpen) { playExpandSound(); setBurst(true); setTimeout(() => setBurst(false), 950); }
    else playCollapseSound();
    onToggle();
  };

  return (
    <>
      <div style={{ position:'relative' }}>
        <FlyerBurst active={burst} />
        <div onClick={handleToggle} style={{
          display:'flex', alignItems:'center', gap:10, padding:'10px 14px', cursor:'pointer', userSelect:'none',
          background: isOpen ? '#2e1c0b' : '#1a1208', borderBottom:'1px solid rgba(201,168,76,0.1)',
          position:'relative', overflow:'hidden', transition:'background 0.2s',
        }}>
          <span style={{ position:'absolute', left:0, top:0, bottom:0, width:3, background: isExpired ? '#c0392b' : '#c9a84c', opacity: isOpen?1:0.45, transition:'opacity 0.3s' }} />
          <div style={{ width:32, height:42, flexShrink:0, borderRadius:2, overflow:'hidden', border:'1px solid rgba(201,168,76,0.3)' }}>
            <img src={item.imageUrl} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <p style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'0.95rem', letterSpacing:'0.12em', color: isOpen ? '#e8c97a' : '#f2ead8', textTransform:'uppercase', lineHeight:1.2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', transition:'color 0.3s' }}>{item.title}</p>
            <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:2 }}>
              <span style={{ fontFamily:'monospace', fontSize:'0.5rem', color:'rgba(201,168,76,0.4)', letterSpacing:'0.15em', textTransform:'uppercase' }}>{item.category}</span>
              {expiryInfo && (
                <span style={{ fontFamily:'monospace', fontSize:'0.45rem', letterSpacing:'0.1em', textTransform:'uppercase', padding:'1px 5px', borderRadius:2, display:'flex', alignItems:'center', gap:2, background: isExpired ? 'rgba(192,57,43,0.25)' : 'rgba(201,168,76,0.1)', border:`1px solid ${isExpired ? 'rgba(192,57,43,0.5)' : 'rgba(201,168,76,0.3)'}`, color: isExpired ? '#e74c3c' : '#c9a84c' }}>
                  <Clock size={7}/> {expiryInfo.label}
                </span>
              )}
            </div>
          </div>
          <span style={{ fontFamily:'monospace', fontSize:'0.5rem', letterSpacing:'0.15em', textTransform:'uppercase', padding:'2px 6px', borderRadius:2, flexShrink:0, background: item.type==='Announcement' ? '#c0392b' : 'rgba(201,168,76,0.2)', border: item.type!=='Announcement' ? '1px solid rgba(201,168,76,0.35)' : 'none', color: item.type!=='Announcement' ? '#c9a84c' : '#fff' }}>{item.category || item.type}</span>
          <span style={{ width:18, height:18, borderRadius:'50%', flexShrink:0, border:`1px solid ${isOpen ? '#c9a84c' : 'rgba(201,168,76,0.25)'}`, display:'flex', alignItems:'center', justifyContent:'center', color:'#c9a84c', fontSize:'0.55rem', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition:'transform 0.4s cubic-bezier(0.34,1.56,0.64,1)' }}>▼</span>
        </div>
      </div>

      {isOpen && (
        <div style={{ position:'fixed', inset:0, zIndex:200, background:'rgba(0,0,0,0.88)', display:'flex', alignItems:'center', justifyContent:'center', animation:'modalFadeIn 0.25s ease', padding:'20px' }} onClick={handleToggle}>
          <div onClick={e => e.stopPropagation()} style={{ width:'100%', maxWidth:520, maxHeight:'90vh', overflowY:'auto', background:'#0a0a08', border:'1px solid rgba(201,168,76,0.55)', borderRadius:4, boxShadow:'0 0 80px rgba(201,168,76,0.1), 0 30px 60px rgba(0,0,0,0.8)', animation:'modalSlideUp 0.3s cubic-bezier(0.34,1.56,0.64,1)', scrollbarWidth:'thin', scrollbarColor:'rgba(201,168,76,0.2) #0a0a08', position:'relative' }}>
            <button onClick={handleToggle} style={{ position:'absolute', top:10, right:10, zIndex:10, width:28, height:28, borderRadius:'50%', cursor:'pointer', background:'rgba(0,0,0,0.7)', border:'1px solid rgba(201,168,76,0.3)', color:'#c9a84c', fontSize:'0.75rem', display:'flex', alignItems:'center', justifyContent:'center', transition:'all 0.2s' }} onMouseEnter={e => { e.currentTarget.style.background='#c9a84c'; e.currentTarget.style.color='#0a0a08'; }} onMouseLeave={e => { e.currentTarget.style.background='rgba(0,0,0,0.7)'; e.currentTarget.style.color='#c9a84c'; }}>✕</button>
            <div style={{ display:'flex', height:'100%' }}>
              <div style={{ width:24, background:'#1a1a15', borderRight:'1px solid rgba(201,168,76,0.12)', flexShrink:0, minHeight:400 }}><Sprockets count={14} /></div>
              <div style={{ flex:1, background:'#141410', overflow:'hidden' }}>
                <div style={{ width:'100%', position:'relative' }}>
                  <img src={item.imageUrl} alt={item.title} style={{ width:'100%', display:'block', maxHeight:'55vh', objectFit:'contain', background:'#0a0a08', filter:'sepia(0.1) contrast(1.05)' }} />
                  {isExpired && <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.55)', display:'flex', alignItems:'center', justifyContent:'center' }}><span style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'2rem', color:'#e74c3c', letterSpacing:'0.3em' }}>EXPIRED</span></div>}
                  <div style={{ position:'absolute', bottom:0, left:0, right:0, height:80, background:'linear-gradient(transparent, #141410)' }} />
                </div>
                <div style={{ display:'flex', alignItems:'center', flexWrap:'wrap', gap:6, padding:'5px 14px', background:'#1a1a15', borderTop:'1px solid rgba(201,168,76,0.1)', borderBottom:'1px solid rgba(201,168,76,0.1)', fontFamily:'monospace', fontSize:'0.52rem', letterSpacing:'0.22em', color:'rgba(201,168,76,0.4)' }}>
                  <span style={{ color:'#c9a84c' }}>FRAME {frameNum}</span>
                  <span>◆</span><span>{item.type?.toUpperCase()}</span>
                  <span>◆</span><span>{item.category?.toUpperCase()}</span>
                  {expiryInfo && <><span>◆</span><span style={{ color: isExpired ? '#e74c3c' : '#c9a84c' }}>{expiryInfo.label}</span></>}
                </div>
                <div style={{ padding:'16px 18px 20px' }}>
                  <span style={{ display:'block', width:14, height:14, marginBottom:10, borderTop:'2px solid rgba(201,168,76,0.4)', borderLeft:'2px solid rgba(201,168,76,0.4)' }} />
                  <h3 style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'1.8rem', letterSpacing:'0.1em', lineHeight:1.05, color:'#e8c97a', marginBottom:10, textShadow:'0 0 30px rgba(201,168,76,0.3)' }}>{item.title}</h3>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:12 }}>
                    <span style={{ fontFamily:'monospace', fontSize:'0.55rem', letterSpacing:'0.18em', textTransform:'uppercase', padding:'3px 8px', borderRadius:2, background: item.type==='Announcement' ? '#c0392b' : 'rgba(201,168,76,0.18)', border: item.type!=='Announcement' ? '1px solid rgba(201,168,76,0.35)' : 'none', color: item.type!=='Announcement' ? '#c9a84c' : '#fff' }}>{item.type}</span>
                    <span style={{ fontFamily:'monospace', fontSize:'0.55rem', letterSpacing:'0.18em', textTransform:'uppercase', padding:'3px 8px', borderRadius:2, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', color:'#f2ead8' }}>{item.category}</span>
                  </div>
                  {expiryInfo && <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:12, padding:'7px 10px', background: isExpired ? 'rgba(192,57,43,0.12)' : 'rgba(201,168,76,0.06)', border:`1px solid ${isExpired ? 'rgba(192,57,43,0.3)' : 'rgba(201,168,76,0.2)'}`, borderRadius:3 }}><Clock size={12} style={{ color: isExpired ? '#e74c3c' : '#c9a84c', flexShrink:0 }} /><span style={{ fontFamily:'monospace', fontSize:'0.6rem', letterSpacing:'0.15em', color: isExpired ? '#e74c3c' : '#c9a84c', textTransform:'uppercase' }}>{isExpired ? 'This post has expired' : `Expires in: ${expiryInfo.label}`}</span></div>}
                  {item.link && <div style={{ marginBottom:14, padding:'8px 10px', background:'rgba(0,0,0,0.4)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:3 }}><p style={{ fontFamily:'monospace', fontSize:'0.5rem', color:'rgba(201,168,76,0.45)', letterSpacing:'0.2em', textTransform:'uppercase', marginBottom:4 }}>Action Link:</p><a href={item.link} target="_blank" rel="noreferrer" style={{ fontSize:'0.7rem', color:'#60a5fa', textDecoration:'underline', fontStyle:'italic', wordBreak:'break-all' }}>{item.link}</a></div>}
                  <button onClick={(e) => { e.stopPropagation(); onDelete(item.id); }} style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'center', gap:6, padding:'10px', borderRadius:2, cursor:'pointer', transition:'all 0.2s', fontFamily:'monospace', fontSize:'0.65rem', letterSpacing:'0.2em', textTransform:'uppercase', background:'rgba(192,57,43,0.12)', border:'1px solid rgba(192,57,43,0.3)', color:'#e74c3c' }} onMouseEnter={e => { e.currentTarget.style.background='#c0392b'; e.currentTarget.style.color='#fff'; e.currentTarget.style.borderColor='#c0392b'; }} onMouseLeave={e => { e.currentTarget.style.background='rgba(192,57,43,0.12)'; e.currentTarget.style.color='#e74c3c'; e.currentTarget.style.borderColor='rgba(192,57,43,0.3)'; }}><Trash2 size={13}/> Remove Content</button>
                  <span style={{ display:'block', width:14, height:14, marginTop:14, marginLeft:'auto', borderBottom:'2px solid rgba(201,168,76,0.4)', borderRight:'2px solid rgba(201,168,76,0.4)' }} />
                </div>
              </div>
              <div style={{ width:24, background:'#1a1a15', borderLeft:'1px solid rgba(201,168,76,0.12)', flexShrink:0 }}><Sprockets count={14} /></div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

/* ══ EXPIRY OPTIONS ══ */
const EXPIRY_OPTIONS = [
  { label:'No Limit', value:0   },
  { label:'1 Hour',   value:1   },
  { label:'6 Hours',  value:6   },
  { label:'12 Hours', value:12  },
  { label:'24 Hours', value:24  },
  { label:'3 Days',   value:72  },
  { label:'7 Days',   value:168 },
  { label:'30 Days',  value:720 },
];

/* ══ EVENT CATEGORIES ══ */
const EVENT_CATEGORIES = ['Film Release','Web Series','Award Show','Fan Meet','Press Conference','Birthday','Other'];

/* ══ Section Divider ══ */
const SectionDivider = ({ title, icon }) => (
  <div style={{ display:'flex', alignItems:'center', gap:14, margin:'40px 0 24px' }}>
    <div style={{ display:'flex', flexDirection:'column', gap:3, flexShrink:0 }}>
      <div style={{ width:16, height:2, background:'rgba(201,168,76,0.6)' }} />
      <div style={{ width:10, height:2, background:'rgba(201,168,76,0.25)' }} />
    </div>
    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
      <span style={{ color:'#c9a84c', opacity:0.7 }}>{icon}</span>
      <h2 style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'clamp(1.4rem,3.5vw,2rem)', letterSpacing:'0.2em', color:'#e8c97a', margin:0, lineHeight:1 }}>{title}</h2>
    </div>
    <div style={{ flex:1, height:1, background:'linear-gradient(to right, rgba(201,168,76,0.3), transparent)' }} />
  </div>
);

/* ══ File upload button ══ */
const FileUploadBtn = ({ label, accept, file, onChange, icon }) => (
  <label style={{
    display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
    width:'100%', height:90, border:'2px dashed rgba(201,168,76,0.25)', borderRadius:6,
    background:'rgba(201,168,76,0.02)', cursor:'pointer', transition:'all 0.2s', gap:6,
  }}
    onMouseEnter={e => { e.currentTarget.style.background='rgba(201,168,76,0.07)'; e.currentTarget.style.borderColor='rgba(201,168,76,0.45)'; }}
    onMouseLeave={e => { e.currentTarget.style.background='rgba(201,168,76,0.02)'; e.currentTarget.style.borderColor='rgba(201,168,76,0.25)'; }}
  >
    {file ? (
      <div style={{ display:'flex', alignItems:'center', gap:8, padding:'0 12px', textAlign:'center' }}>
        <span style={{ color:'#c9a84c', flexShrink:0 }}>{icon}</span>
        <span style={{ fontFamily:'monospace', fontSize:'0.6rem', color:'#e8c97a', wordBreak:'break-all', lineHeight:1.3 }}>{file.name}</span>
      </div>
    ) : (
      <>
        <span style={{ color:'rgba(201,168,76,0.4)' }}>{icon}</span>
        <span style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'0.65rem', letterSpacing:'0.22em', color:'rgba(201,168,76,0.45)' }}>{label}</span>
      </>
    )}
    <input type="file" className="hidden" accept={accept} onChange={onChange} style={{ display:'none' }} />
  </label>
);

/* ══ Event Row Card (admin list) ══ */
const EventRowCard = ({ event, onDelete, onMoveToHistory }) => {
  const [historyFile, setHistoryFile] = useState(null);
  const [uploading,   setUploading]   = useState(false);
  const [expanded,    setExpanded]    = useState(false);

  const eventDate = event.eventDate?.toDate ? event.eventDate.toDate() : new Date(event.eventDate);
  const isPast    = eventDate < new Date();

  const handleMoveToHistory = async () => {
    if (!historyFile) return toast.error('Please select a history photo first!');
    setUploading(true);
    try {
      const url = await uploadToCloudinary(historyFile, 'image');
      await onMoveToHistory(event.id, url);
      toast.success('Moved to history!');
    } catch { toast.error('Upload failed!'); }
    finally { setUploading(false); }
  };

  return (
    <div style={{ borderBottom:'1px solid rgba(201,168,76,0.08)', animation:'eventCardIn 0.4s ease both' }}>
      {/* Row */}
      <div onClick={() => setExpanded(o => !o)} style={{
        display:'flex', alignItems:'center', gap:10, padding:'10px 14px', cursor:'pointer',
        background: expanded ? '#1e1608' : '#141008', transition:'background 0.2s',
        position:'relative',
      }}>
        <span style={{ position:'absolute', left:0, top:0, bottom:0, width:3, background: event.status==='history' ? '#888' : isPast ? '#e74c3c' : '#c9a84c', opacity:0.7 }} />

        {/* Poster thumb */}
        <div style={{ width:36, height:50, flexShrink:0, borderRadius:2, overflow:'hidden', border:'1px solid rgba(201,168,76,0.25)', background:'#0a0806' }}>
          {event.mediaUrl && event.mediaType !== 'video'
            ? <img src={event.mediaUrl} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
            : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center' }}><FilmIcon size={14} style={{ color:'rgba(201,168,76,0.3)' }} /></div>
          }
        </div>

        <div style={{ flex:1, minWidth:0 }}>
          <p style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'0.92rem', letterSpacing:'0.1em', color:'#f2ead8', margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{event.title}</p>
          <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:2, flexWrap:'wrap' }}>
            <span style={{ fontFamily:'monospace', fontSize:'0.44rem', color:'rgba(201,168,76,0.4)', letterSpacing:'0.15em', textTransform:'uppercase' }}>{event.category}</span>
            <span style={{ fontFamily:'monospace', fontSize:'0.44rem', color:'rgba(255,255,255,0.25)', letterSpacing:'0.12em' }}>
              {eventDate.toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}
            </span>
          </div>
        </div>

        {/* Status badge */}
        <span style={{
          fontFamily:'monospace', fontSize:'0.44rem', letterSpacing:'0.18em', textTransform:'uppercase',
          padding:'2px 7px', borderRadius:2, flexShrink:0,
          background: event.status==='history' ? 'rgba(100,100,100,0.2)' : isPast ? 'rgba(192,57,43,0.2)' : 'rgba(201,168,76,0.12)',
          border:`1px solid ${event.status==='history' ? 'rgba(100,100,100,0.4)' : isPast ? 'rgba(192,57,43,0.4)' : 'rgba(201,168,76,0.3)'}`,
          color: event.status==='history' ? '#888' : isPast ? '#e74c3c' : '#c9a84c',
          display:'flex', alignItems:'center', gap:4,
        }}>
          {event.status==='history' ? <><Archive size={8}/> History</> : isPast ? <>🔴 Past</> : <><span style={{ width:5, height:5, borderRadius:'50%', background:'#c9a84c', display:'inline-block', animation:'livePulse 1.2s infinite' }} /> Live</>}
        </span>

        <span style={{ width:16, height:16, borderRadius:'50%', flexShrink:0, border:`1px solid ${expanded ? '#c9a84c' : 'rgba(201,168,76,0.2)'}`, display:'flex', alignItems:'center', justifyContent:'center', color:'#c9a84c', fontSize:'0.5rem', transform: expanded ? 'rotate(180deg)' : 'rotate(0)', transition:'transform 0.3s' }}>▼</span>
      </div>

      {/* Expanded actions */}
      {expanded && (
        <div style={{ padding:'14px 20px 16px', background:'#0e0b07', borderTop:'1px solid rgba(201,168,76,0.08)' }}>
          {event.description && (
            <p style={{ fontFamily:"'Crimson Pro',Georgia,serif", fontSize:'0.78rem', color:'rgba(255,255,255,0.4)', fontStyle:'italic', marginBottom:12, lineHeight:1.5 }}>{event.description}</p>
          )}

          <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:12 }}>
            {event.musicUrl && (
              <span style={{ fontFamily:'monospace', fontSize:'0.44rem', letterSpacing:'0.15em', padding:'2px 8px', borderRadius:2, background:'rgba(201,168,76,0.08)', border:'1px solid rgba(201,168,76,0.2)', color:'#c9a84c', display:'flex', alignItems:'center', gap:4 }}>
                <Music size={8}/> Has Music
              </span>
            )}
            {event.mediaType === 'video' && (
              <span style={{ fontFamily:'monospace', fontSize:'0.44rem', letterSpacing:'0.15em', padding:'2px 8px', borderRadius:2, background:'rgba(201,168,76,0.08)', border:'1px solid rgba(201,168,76,0.2)', color:'#c9a84c', display:'flex', alignItems:'center', gap:4 }}>
                <Video size={8}/> Video Clip
              </span>
            )}
          </div>

          {/* Move to history (only for active events) */}
          {event.status === 'active' && (
            <div style={{ background:'rgba(201,168,76,0.04)', border:'1px solid rgba(201,168,76,0.1)', borderRadius:4, padding:'12px 14px', marginBottom:10 }}>
              <p style={{ fontFamily:'monospace', fontSize:'0.5rem', letterSpacing:'0.2em', color:'rgba(201,168,76,0.5)', textTransform:'uppercase', marginBottom:8, display:'flex', alignItems:'center', gap:5 }}>
                <Archive size={9}/> Move to Event History
              </p>
              <div style={{ display:'flex', gap:8, alignItems:'flex-start', flexWrap:'wrap' }}>
                <div style={{ flex:1, minWidth:180 }}>
                  <FileUploadBtn
                    label="SELECT HISTORY PHOTO"
                    accept="image/*"
                    file={historyFile}
                    onChange={e => setHistoryFile(e.target.files[0])}
                    icon={<ImageIcon size={16}/>}
                  />
                </div>
                <button
                  onClick={handleMoveToHistory}
                  disabled={!historyFile || uploading}
                  style={{
                    flexShrink:0, padding:'8px 14px', borderRadius:3, cursor: (!historyFile||uploading) ? 'not-allowed' : 'pointer',
                    background: (!historyFile||uploading) ? 'rgba(201,168,76,0.05)' : 'rgba(201,168,76,0.15)',
                    border:`1px solid ${(!historyFile||uploading) ? 'rgba(201,168,76,0.1)' : 'rgba(201,168,76,0.4)'}`,
                    color: (!historyFile||uploading) ? 'rgba(201,168,76,0.25)' : '#c9a84c',
                    fontFamily:'monospace', fontSize:'0.52rem', letterSpacing:'0.18em', textTransform:'uppercase',
                    transition:'all 0.2s', alignSelf:'stretch', display:'flex', alignItems:'center', gap:5,
                  }}>
                  <Archive size={11}/> {uploading ? 'Saving...' : 'Archive'}
                </button>
              </div>
            </div>
          )}

          {/* Delete */}
          <button onClick={() => onDelete(event.id)} style={{
            width:'100%', padding:'8px', borderRadius:2, cursor:'pointer', transition:'all 0.2s',
            fontFamily:'monospace', fontSize:'0.6rem', letterSpacing:'0.18em', textTransform:'uppercase',
            display:'flex', alignItems:'center', justifyContent:'center', gap:6,
            background:'rgba(192,57,43,0.1)', border:'1px solid rgba(192,57,43,0.25)', color:'#e74c3c',
          }}
            onMouseEnter={e => { e.currentTarget.style.background='#c0392b'; e.currentTarget.style.color='#fff'; }}
            onMouseLeave={e => { e.currentTarget.style.background='rgba(192,57,43,0.1)'; e.currentTarget.style.color='#e74c3c'; }}
          ><Trash2 size={11}/> Delete Event</button>
        </div>
      )}
    </div>
  );
};

/* ══════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════ */
const ManageUpdates = () => {
  const [unlocked, setUnlocked] = useState(false);
  if (!unlocked) return <AdminLock onUnlock={() => setUnlocked(true)} />;

  /* ── Updates state ── */
  const [title,       setTitle]       = useState('');
  const [link,        setLink]        = useState('');
  const [category,    setCategory]    = useState('Film');
  const [type,        setType]        = useState('Project');
  const [imageFile,   setImageFile]   = useState(null);
  const [uploading,   setUploading]   = useState(false);
  const [allUpdates,  setAllUpdates]  = useState([]);
  const [expandedId,  setExpandedId]  = useState(null);
  const [expiryHours, setExpiryHours] = useState(0);

  /* ── Event state ── */
  const [evTitle,       setEvTitle]       = useState('');
  const [evDesc,        setEvDesc]        = useState('');
  const [evCategory,    setEvCategory]    = useState('Film Release');
  const [evDate,        setEvDate]        = useState('');
  const [evMediaFile,   setEvMediaFile]   = useState(null);
  const [evMediaType,   setEvMediaType]   = useState('image'); // 'image' | 'video'
  const [evMusicFile,   setEvMusicFile]   = useState(null);
  const [evUploading,   setEvUploading]   = useState(false);
  const [allEvents,     setAllEvents]     = useState([]);
  const [evTab,         setEvTab]         = useState('active'); // 'active' | 'history'

  const socketRef = useRef(null);

  /* ── Socket.io connect ── */
  useEffect(() => {
    const s = io(SOCKET_URL, { transports:['websocket'] });
    socketRef.current = s;
    return () => s.disconnect();
  }, []);

  /* ── Fetch updates ── */
  const fetchUpdates = async () => {
    const q    = query(collection(db, 'updates'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    setAllUpdates(snap.docs.map(d => ({ ...d.data(), id:d.id })));
  };
  useEffect(() => { fetchUpdates(); }, []);

  /* ── Auto-delete expired updates ── */
  useEffect(() => {
    const now = Date.now();
    allUpdates.forEach(async item => {
      if (!item.expiresAt) return;
      const expMs = item.expiresAt.toDate ? item.expiresAt.toDate().getTime() : new Date(item.expiresAt).getTime();
      if (expMs < now) { await deleteDoc(doc(db, 'updates', item.id)); fetchUpdates(); }
    });
  }, [allUpdates]);

  /* ── Realtime events ── */
  useEffect(() => {
    const status = evTab === 'active' ? 'active' : 'history';
    const q = query(collection(db, 'events'), where('status','==',status), orderBy('eventDate', evTab==='active' ? 'asc' : 'desc'));
    const unsub = onSnapshot(q, snap => setAllEvents(snap.docs.map(d => ({ ...d.data(), id:d.id }))));
    return () => unsub();
  }, [evTab]);

  /* ── Publish update ── */
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!title)     return toast.error('Title required!');
    if (!imageFile) return toast.error('Poster required!');
    setUploading(true);
    try {
      const imageUrl  = await uploadToCloudinary(imageFile, 'image');
      const expiresAt = expiryHours > 0 ? Timestamp.fromDate(new Date(Date.now() + expiryHours * 3600000)) : null;
      await addDoc(collection(db, 'updates'), {
        title, type, category, link: link || '',
        imageUrl, createdAt: serverTimestamp(),
        ...(expiresAt && { expiresAt }),
      });
      toast.success(`Published! ${expiryHours > 0 ? `Expires in ${expiryHours}h` : 'No expiry set'}`);
      setTitle(''); setLink(''); setImageFile(null); setExpiryHours(0);
      fetchUpdates();
    } catch (err) { toast.error('Upload Error!'); console.error(err); }
    finally { setUploading(false); }
  };

  /* ── Delete update ── */
  const handleDelete = async (id) => {
    if (!window.confirm('Delete content?')) return;
    try { await deleteDoc(doc(db, 'updates', id)); toast.success('Deleted!'); fetchUpdates(); }
    catch { toast.error('Failed!'); }
  };

  /* ── Publish event ── */
  const handleEventPublish = async (e) => {
    e.preventDefault();
    if (!evTitle)    return toast.error('Event title required!');
    if (!evDate)     return toast.error('Event date required!');
    if (!evMediaFile) return toast.error('Poster or video clip required!');
    setEvUploading(true);
    try {
      const mediaUrl  = await uploadToCloudinary(evMediaFile, evMediaType === 'video' ? 'video' : 'image');
      let musicUrl    = null;
      if (evMusicFile) musicUrl = await uploadToCloudinary(evMusicFile, 'video'); // Cloudinary accepts audio as 'video'

      const eventDate = Timestamp.fromDate(new Date(evDate));

      const eventData = {
        title:     evTitle,
        description: evDesc || '',
        category:  evCategory,
        eventDate,
        mediaUrl,
        mediaType: evMediaType,
        status:    'active',
        createdAt: serverTimestamp(),
        ...(musicUrl && { musicUrl }),
      };

      const docRef = await addDoc(collection(db, 'events'), eventData);

      // Notify via socket
      socketRef.current?.emit('event:create', { id: docRef.id, ...eventData, eventDate: new Date(evDate).toISOString() });

      toast.success('Event published! Fans will be notified.');
      setEvTitle(''); setEvDesc(''); setEvDate(''); setEvMediaFile(null); setEvMusicFile(null); setEvCategory('Film Release'); setEvMediaType('image');
    } catch (err) { toast.error('Event publish failed!'); console.error(err); }
    finally { setEvUploading(false); }
  };

  /* ── Delete event ── */
  const handleEventDelete = async (id) => {
    if (!window.confirm('Delete this event permanently?')) return;
    try { await deleteDoc(doc(db, 'events', id)); toast.success('Event deleted!'); }
    catch { toast.error('Failed to delete event!'); }
  };

  /* ── Move event to history ── */
  const handleMoveToHistory = async (id, historyImageUrl) => {
    await updateDoc(doc(db, 'events', id), { status:'history', historyImageUrl });
  };

  /* ════════════════════════════════════ RENDER ════════════════════════════════════ */
  return (
    <div className="min-h-screen w-full relative flex flex-col font-sans text-white">
      <FontImport />
      <div className="fixed inset-0 z-0 bg-black/70 backdrop-blur-sm" />

      <main className="relative z-10 w-full max-w-4xl mx-auto p-4 md:py-16">

        {/* ── PAGE HEADER ── */}
        <header className="mb-10 text-center">
          <h1 style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'clamp(2.5rem, 6vw, 4.5rem)', letterSpacing:'0.18em', textTransform:'uppercase', color:'#fff', textShadow:'0 0 40px rgba(201,168,76,0.15)' }}>
            CONTROL <span style={{ color:'#c9a84c' }}>PANEL</span>
          </h1>
        </header>

        {/* ══════════════════════════════════
            SECTION 1 — PUBLISH UPDATE
        ══════════════════════════════════ */}
        <SectionDivider title="Publish Update" icon={<ImageIcon size={18}/>} />

        <div className="flex justify-center mb-8">
          <form onSubmit={handleUpload} className="w-full max-w-xl space-y-8 bg-white/5 p-8 rounded-[2rem] border border-white/10 shadow-2xl">

            <CustomInput label="WHERE TO SHOW?" isSelect value={type} onChange={e => setType(e.target.value)}>
              <option value="Project">My Works Section</option>
              <option value="Announcement">Latest News Section</option>
            </CustomInput>

            <CustomInput label="CONTENT TITLE" value={title} onChange={e => setTitle(e.target.value)} placeholder="Title likhun..." />

            <div>
              <label style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', width:'100%', maxWidth:440, height:100, border:'2px dashed rgba(201,168,76,0.3)', borderRadius:6, background:'rgba(201,168,76,0.03)', cursor:'pointer', transition:'background 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.background='rgba(201,168,76,0.07)'}
                onMouseLeave={e => e.currentTarget.style.background='rgba(201,168,76,0.03)'}>
                {imageFile ? (
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}><ImageIcon style={{ color:'#c9a84c' }} size={16}/><span style={{ fontSize:'0.7rem', color:'#f2ead8', fontFamily:'monospace' }}>{imageFile.name}</span></div>
                ) : (
                  <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:5 }}><span style={{ fontSize:'1.3rem' }}>🎞️</span><span style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'0.7rem', letterSpacing:'0.22em', color:'rgba(201,168,76,0.55)' }}>SELECT POSTER</span></div>
                )}
                <input type="file" className="hidden" accept="image/*" onChange={e => setImageFile(e.target.files[0])} style={{ display:'none' }} />
              </label>
            </div>

            <CustomInput label="CATEGORY" isSelect value={category} onChange={e => setCategory(e.target.value)}>
              <option value="Film">Film</option>
              <option value="Web Series">Web Series</option>
              <option value="Serial">Serial</option>
              <option value="News">News</option>
            </CustomInput>

            <CustomInput label="ACTION LINK (URL)" value={link} onChange={e => setLink(e.target.value)} placeholder="https://..." />

            {/* Expiry */}
            <div style={{ maxWidth:440 }}>
              <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:8 }}>
                <span style={{ width:8, height:8, borderTop:'1.5px solid rgba(201,168,76,0.5)', borderLeft:'1.5px solid rgba(201,168,76,0.5)', display:'inline-block', flexShrink:0 }} />
                <span style={{ fontFamily:"'Bebas Neue', monospace", fontSize:'0.65rem', letterSpacing:'0.28em', textTransform:'uppercase', color:'rgba(201,168,76,0.7)' }}>POST EXPIRY TIME</span>
                <span style={{ width:8, height:8, borderTop:'1.5px solid rgba(201,168,76,0.5)', borderRight:'1.5px solid rgba(201,168,76,0.5)', display:'inline-block', flexShrink:0 }} />
              </div>
              <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                {EXPIRY_OPTIONS.map(opt => (
                  <button key={opt.value} type="button" onClick={() => setExpiryHours(opt.value)} style={{ fontFamily:"'Special Elite', monospace", fontSize:'0.6rem', letterSpacing:'0.15em', textTransform:'uppercase', padding:'5px 10px', borderRadius:2, cursor:'pointer', transition:'all 0.2s', background: expiryHours===opt.value ? '#c9a84c' : 'rgba(201,168,76,0.06)', border:`1px solid ${expiryHours===opt.value ? '#c9a84c' : 'rgba(201,168,76,0.2)'}`, color: expiryHours===opt.value ? '#0a0a08' : 'rgba(201,168,76,0.55)', fontWeight: expiryHours===opt.value ? 'bold' : 'normal' }}>{opt.label}</button>
                ))}
              </div>
              {expiryHours > 0 && <p style={{ fontFamily:'monospace', fontSize:'0.55rem', color:'rgba(201,168,76,0.45)', letterSpacing:'0.15em', marginTop:6, display:'flex', alignItems:'center', gap:4 }}><Clock size={9} /> Auto-delete after {expiryHours >= 24 ? `${expiryHours/24} day(s)` : `${expiryHours} hour(s)`}</p>}
              <div style={{ height:1, background:'linear-gradient(to right, transparent, rgba(201,168,76,0.2), transparent)', marginTop:8 }} />
            </div>

            <div className="flex justify-start"><CustomButton loading={uploading} type="submit">PUBLISH NOW</CustomButton></div>
          </form>
        </div>

        {/* Live Updates list */}
        <div style={{ background:'#0a0a08', border:'1px solid rgba(201,168,76,0.15)', borderRadius:16, overflow:'hidden', boxShadow:'0 8px 40px rgba(0,0,0,0.6)', marginBottom:8 }}>
          <div style={{ padding:'14px 20px', borderBottom:'1px solid rgba(201,168,76,0.12)', background:'rgba(201,168,76,0.04)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <h2 style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'0.9rem', letterSpacing:'0.25em', color:'rgba(201,168,76,0.6)', textTransform:'uppercase' }}>Live Updates ({allUpdates.length})</h2>
            <ListFilter size={16} style={{ color:'#c9a84c' }} />
          </div>
          <div style={{ maxHeight:600, overflowY:'auto', scrollbarWidth:'thin', scrollbarColor:'rgba(201,168,76,0.3) #0a0a08' }}>
            {allUpdates.length === 0
              ? <div style={{ padding:40, textAlign:'center', color:'rgba(255,255,255,0.2)', fontFamily:'monospace', fontSize:'0.7rem', letterSpacing:'0.2em', textTransform:'uppercase' }}>No items published yet</div>
              : allUpdates.map((item, index) => (
                  <div key={item.id} style={{ borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
                    <FilmExpandCard item={item} index={index} isOpen={expandedId===item.id} onToggle={() => setExpandedId(expandedId===item.id ? null : item.id)} onDelete={handleDelete} />
                  </div>
                ))
            }
          </div>
        </div>

        {/* ══════════════════════════════════
            SECTION 2 — CREATE EVENT
        ══════════════════════════════════ */}
        <SectionDivider title="Create Event" icon={<Calendar size={18}/>} />

        <div className="flex justify-center mb-8">
          <form onSubmit={handleEventPublish} className="w-full max-w-xl space-y-6 bg-white/5 p-8 rounded-[2rem] border border-white/10 shadow-2xl">

            {/* Title */}
            <CustomInput label="EVENT TITLE" value={evTitle} onChange={e => setEvTitle(e.target.value)} placeholder="e.g. New Film Release..." />

            {/* Description */}
            <div>
              <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:8 }}>
                <span style={{ width:8, height:8, borderTop:'1.5px solid rgba(201,168,76,0.5)', borderLeft:'1.5px solid rgba(201,168,76,0.5)', display:'inline-block', flexShrink:0 }} />
                <span style={{ fontFamily:"'Bebas Neue',monospace", fontSize:'0.65rem', letterSpacing:'0.28em', textTransform:'uppercase', color:'rgba(201,168,76,0.7)' }}>SHORT DESCRIPTION</span>
              </div>
              <textarea
                value={evDesc}
                onChange={e => setEvDesc(e.target.value)}
                placeholder="Event description (optional)..."
                rows={3}
                style={{
                  width:'100%', background:'rgba(201,168,76,0.07)', border:'1px solid rgba(201,168,76,0.3)',
                  borderRadius:4, color:'#f2ead8', fontFamily:"'Crimson Pro',Georgia,serif",
                  fontSize:'0.82rem', padding:'10px 12px', resize:'vertical',
                  outline:'none', transition:'all 0.2s', lineHeight:1.5,
                  boxShadow:'inset 0 2px 8px rgba(0,0,0,0.5)',
                }}
                onFocus={e => e.target.style.borderColor='rgba(201,168,76,0.5)'}
                onBlur={e  => e.target.style.borderColor='rgba(201,168,76,0.2)'}
              />
            </div>

            {/* Category */}
            <div>
              <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:8 }}>
                <span style={{ width:8, height:8, borderTop:'1.5px solid rgba(201,168,76,0.5)', borderLeft:'1.5px solid rgba(201,168,76,0.5)', display:'inline-block', flexShrink:0 }} />
                <span style={{ fontFamily:"'Bebas Neue',monospace", fontSize:'0.65rem', letterSpacing:'0.28em', textTransform:'uppercase', color:'rgba(201,168,76,0.7)' }}>EVENT CATEGORY</span>
              </div>
              <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                {EVENT_CATEGORIES.map(cat => (
                  <button key={cat} type="button" onClick={() => setEvCategory(cat)} style={{ fontFamily:"'Special Elite',monospace", fontSize:'0.6rem', letterSpacing:'0.12em', textTransform:'uppercase', padding:'5px 10px', borderRadius:2, cursor:'pointer', transition:'all 0.2s', background: evCategory===cat ? '#c9a84c' : 'rgba(201,168,76,0.06)', border:`1px solid ${evCategory===cat ? '#c9a84c' : 'rgba(201,168,76,0.18)'}`, color: evCategory===cat ? '#0a0a08' : 'rgba(201,168,76,0.5)', fontWeight: evCategory===cat ? 'bold' : 'normal' }}>{cat}</button>
                ))}
              </div>
            </div>

            {/* Event Date */}
            <div>
              <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:8 }}>
                <span style={{ width:8, height:8, borderTop:'1.5px solid rgba(201,168,76,0.5)', borderLeft:'1.5px solid rgba(201,168,76,0.5)', display:'inline-block', flexShrink:0 }} />
                <span style={{ fontFamily:"'Bebas Neue',monospace", fontSize:'0.65rem', letterSpacing:'0.28em', textTransform:'uppercase', color:'rgba(201,168,76,0.7)' }}>EVENT DATE & TIME</span>
              </div>
              <input
                type="datetime-local"
                value={evDate}
                onChange={e => setEvDate(e.target.value)}
                style={{
                  background:'rgba(0,0,0,0.4)', border:'1px solid rgba(201,168,76,0.2)',
                  borderRadius:4, color:'#f2ead8', fontFamily:'monospace', fontSize:'0.72rem',
                  padding:'9px 12px', outline:'none', transition:'border-color 0.2s',
                  colorScheme:'dark', width:'100%',
                }}
                onFocus={e => e.target.style.borderColor='rgba(201,168,76,0.5)'}
                onBlur={e  => e.target.style.borderColor='rgba(201,168,76,0.2)'}
              />
            </div>

            {/* Media type toggle */}
            <div>
              <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:8 }}>
                <span style={{ width:8, height:8, borderTop:'1.5px solid rgba(201,168,76,0.5)', borderLeft:'1.5px solid rgba(201,168,76,0.5)', display:'inline-block', flexShrink:0 }} />
                <span style={{ fontFamily:"'Bebas Neue',monospace", fontSize:'0.65rem', letterSpacing:'0.28em', textTransform:'uppercase', color:'rgba(201,168,76,0.7)' }}>MEDIA TYPE</span>
              </div>
              <div style={{ display:'flex', gap:6, marginBottom:10 }}>
                {[{ v:'image', l:'Poster / Photo', icon:<ImageIcon size={13}/> }, { v:'video', l:'Video Clip', icon:<Video size={13}/> }].map(opt => (
                  <button key={opt.v} type="button" onClick={() => setEvMediaType(opt.v)} style={{ display:'flex', alignItems:'center', gap:6, fontFamily:'monospace', fontSize:'0.55rem', letterSpacing:'0.15em', textTransform:'uppercase', padding:'7px 14px', borderRadius:2, cursor:'pointer', transition:'all 0.2s', background: evMediaType===opt.v ? 'rgba(201,168,76,0.18)' : 'transparent', border:`1px solid ${evMediaType===opt.v ? 'rgba(201,168,76,0.5)' : 'rgba(201,168,76,0.15)'}`, color: evMediaType===opt.v ? '#c9a84c' : 'rgba(201,168,76,0.35)' }}>{opt.icon}{opt.l}</button>
                ))}
              </div>
              <FileUploadBtn
                label={evMediaType==='image' ? 'SELECT POSTER / PHOTO' : 'SELECT VIDEO CLIP'}
                accept={evMediaType==='image' ? 'image/*' : 'video/*'}
                file={evMediaFile}
                onChange={e => setEvMediaFile(e.target.files[0])}
                icon={evMediaType==='image' ? <ImageIcon size={18}/> : <Video size={18}/>}
              />
            </div>

            {/* Music upload */}
            <div>
              <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:8 }}>
                <span style={{ width:8, height:8, borderTop:'1.5px solid rgba(201,168,76,0.5)', borderLeft:'1.5px solid rgba(201,168,76,0.5)', display:'inline-block', flexShrink:0 }} />
                <span style={{ fontFamily:"'Bebas Neue',monospace", fontSize:'0.65rem', letterSpacing:'0.28em', textTransform:'uppercase', color:'rgba(201,168,76,0.7)' }}>BACKGROUND MUSIC <span style={{ fontSize:'0.5rem', opacity:0.5 }}>(OPTIONAL)</span></span>
              </div>
              <FileUploadBtn
                label="SELECT MUSIC FILE"
                accept="audio/*"
                file={evMusicFile}
                onChange={e => setEvMusicFile(e.target.files[0])}
                icon={<Music size={18}/>}
              />
            </div>

            <div style={{ height:1, background:'linear-gradient(to right, transparent, rgba(201,168,76,0.2), transparent)' }} />
            <div className="flex justify-start"><CustomButton loading={evUploading} type="submit">PUBLISH EVENT</CustomButton></div>
          </form>
        </div>

        {/* ── Event List ── */}
        <div style={{ background:'#0a0a08', border:'1px solid rgba(201,168,76,0.15)', borderRadius:16, overflow:'hidden', boxShadow:'0 8px 40px rgba(0,0,0,0.6)' }}>
          {/* Tabs */}
          <div style={{ padding:'12px 20px', borderBottom:'1px solid rgba(201,168,76,0.12)', background:'rgba(201,168,76,0.04)', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:8 }}>
            <h2 style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'0.9rem', letterSpacing:'0.25em', color:'rgba(201,168,76,0.6)', textTransform:'uppercase', margin:0 }}>All Events ({allEvents.length})</h2>
            <div style={{ display:'flex', gap:4 }}>
              {[{ k:'active', l:'Active' }, { k:'history', l:'History' }].map(t => (
                <button key={t.k} onClick={() => setEvTab(t.k)} style={{ fontFamily:'monospace', fontSize:'0.48rem', letterSpacing:'0.2em', textTransform:'uppercase', padding:'4px 10px', borderRadius:2, cursor:'pointer', transition:'all 0.2s', background: evTab===t.k ? 'rgba(201,168,76,0.16)' : 'transparent', border:`1px solid ${evTab===t.k ? 'rgba(201,168,76,0.45)' : 'rgba(201,168,76,0.12)'}`, color: evTab===t.k ? '#c9a84c' : 'rgba(201,168,76,0.3)' }}>{t.l}</button>
              ))}
            </div>
          </div>

          <div style={{ maxHeight:600, overflowY:'auto', scrollbarWidth:'thin', scrollbarColor:'rgba(201,168,76,0.3) #0a0a08' }}>
            {allEvents.length === 0
              ? <div style={{ padding:40, textAlign:'center', color:'rgba(255,255,255,0.18)', fontFamily:'monospace', fontSize:'0.7rem', letterSpacing:'0.2em', textTransform:'uppercase' }}>No {evTab} events</div>
              : allEvents.map(ev => (
                  <EventRowCard key={ev.id} event={ev} onDelete={handleEventDelete} onMoveToHistory={handleMoveToHistory} />
                ))
            }
          </div>
        </div>

      </main>
    </div>
  );
};

export default ManageUpdates;