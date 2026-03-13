import React, { useEffect, useState, useRef } from 'react';
import { db } from '../firebase/firebaseConfig';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { Megaphone, LayoutGrid, ExternalLink } from 'lucide-react';

const FontImport = () => (
  <style>{`@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Special+Elite&display=swap');`}</style>
);

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
      <style>{`
        @keyframes flyerPop {
          0%   { opacity:0; transform:translate(0,0) rotate(0deg) scale(0.4); }
          20%  { opacity:1; }
          80%  { opacity:0.7; transform:translate(var(--tx),var(--ty)) rotate(var(--rot)) scale(1); }
          100% { opacity:0; transform:translate(calc(var(--tx)*1.2),calc(var(--ty)*1.3)) rotate(calc(var(--rot)*1.5)) scale(0.5); }
        }
      `}</style>
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

/* ══ SPROCKETS ══ */
const Sprockets = ({ count = 7 }) => (
  <div style={{ display:'flex', flexDirection:'column', justifyContent:'space-around', alignItems:'center', padding:'8px 0', height:'100%' }}>
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} style={{ width:14, height:10, background:'#0a0a08', border:'1px solid rgba(201,168,76,0.2)', borderRadius:3, margin:'2px 0', flexShrink:0, boxShadow:'inset 0 1px 3px rgba(0,0,0,0.8)' }} />
    ))}
  </div>
);

/* ══ FILM ANNOUNCEMENT CARD — fullscreen modal like ManageUpdates ══ */
const FilmAnnouncementCard = ({ item, index }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [burst,  setBurst]  = useState(false);
  const frameNum = String(index + 1).padStart(3, '0');

  const handleToggle = () => {
    if (!isOpen) { playExpandSound(); setBurst(true); setTimeout(() => setBurst(false), 950); }
    else { playCollapseSound(); }
    setIsOpen(o => !o);
  };

  return (
    <>
      {/* ── Compact row ── */}
      <div style={{ position:'relative' }}>
        <FlyerBurst active={burst} />
        <button onClick={handleToggle}
          style={{
            width:'100%', display:'flex', alignItems:'center', gap:12, padding:'12px 16px',
            cursor:'pointer', userSelect:'none', textAlign:'left',
            background: isOpen ? '#2e1c0b' : '#1e1508',
            border:`1px solid ${isOpen ? 'rgba(201,168,76,0.7)' : 'rgba(201,168,76,0.2)'}`,
            borderRadius: isOpen ? '4px 4px 0 0' : '4px',
            borderBottom: isOpen ? 'none' : undefined,
            position:'relative', overflow:'hidden', transition:'all 0.2s',
          }}>
          {/* left accent bar */}
          <span style={{ position:'absolute', left:0, top:0, bottom:0, width:4, background:'#c9a84c', opacity: isOpen?1:0.5, transition:'opacity 0.3s' }} />

          {/* thumb */}
          <div style={{ width:36, height:46, flexShrink:0, borderRadius:2, overflow:'hidden', border:'1px solid rgba(201,168,76,0.3)', marginLeft:6 }}>
            <img src={item.imageUrl} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
          </div>

          <span style={{ fontSize:'1.1rem', flexShrink:0 }}>📢</span>

          <span style={{ flex:1, fontFamily:"'Bebas Neue', sans-serif", fontSize:'1.1rem', letterSpacing:'0.14em', color: isOpen?'#e8c97a':'#f2ead8', textTransform:'uppercase', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', transition:'color 0.3s' }}>
            {item.title}
          </span>

          <span style={{ fontFamily:'monospace', fontSize:'0.55rem', letterSpacing:'0.2em', textTransform:'uppercase', padding:'2px 8px', borderRadius:2, flexShrink:0, background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', color:'#f2ead8' }}>
            {item.category}
          </span>

          <span style={{ width:22, height:22, borderRadius:'50%', flexShrink:0, border:`1px solid ${isOpen?'#c9a84c':'rgba(201,168,76,0.3)'}`, display:'flex', alignItems:'center', justifyContent:'center', color:'#c9a84c', fontSize:'0.6rem', transform: isOpen?'rotate(180deg)':'rotate(0deg)', transition:'transform 0.4s cubic-bezier(0.34,1.56,0.64,1)' }}>▼</span>
        </button>
      </div>

      {/* ══ FULLSCREEN MODAL ══ */}
      {isOpen && (
        <div style={{ position:'fixed', inset:0, zIndex:200, background:'rgba(0,0,0,0.9)', display:'flex', alignItems:'center', justifyContent:'center', padding:'20px', animation:'hmFadeIn 0.25s ease' }}
          onClick={handleToggle}>
          <style>{`
            @keyframes hmFadeIn  { from { opacity:0; } to { opacity:1; } }
            @keyframes hmSlideUp { from { opacity:0; transform:translateY(28px); } to { opacity:1; transform:translateY(0); } }
          `}</style>

          <div onClick={e => e.stopPropagation()} style={{
            width:'100%', maxWidth:540,
            maxHeight:'90vh', overflowY:'auto',
            background:'#0a0a08',
            border:'1px solid rgba(201,168,76,0.6)',
            borderRadius:4,
            boxShadow:'0 0 80px rgba(201,168,76,0.12), 0 30px 60px rgba(0,0,0,0.9)',
            animation:'hmSlideUp 0.3s cubic-bezier(0.34,1.56,0.64,1)',
            scrollbarWidth:'thin', scrollbarColor:'rgba(201,168,76,0.2) #0a0a08',
            position:'relative',
          }}>
            {/* Close */}
            <button onClick={handleToggle} style={{ position:'absolute', top:10, right:10, zIndex:10, width:28, height:28, borderRadius:'50%', cursor:'pointer', background:'rgba(0,0,0,0.7)', border:'1px solid rgba(201,168,76,0.3)', color:'#c9a84c', fontSize:'0.75rem', display:'flex', alignItems:'center', justifyContent:'center', transition:'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.background='#c9a84c'; e.currentTarget.style.color='#0a0a08'; }}
              onMouseLeave={e => { e.currentTarget.style.background='rgba(0,0,0,0.7)'; e.currentTarget.style.color='#c9a84c'; }}>✕</button>

            <div style={{ display:'flex' }}>
              {/* Left sprockets */}
              <div style={{ width:26, background:'#1a1a15', borderRight:'1px solid rgba(201,168,76,0.12)', flexShrink:0, minHeight:380 }}>
                <Sprockets count={14} />
              </div>

              {/* Main content */}
              <div style={{ flex:1, background:'#141410', overflow:'hidden' }}>

                {/* FULL POSTER — objectFit contain, no crop */}
                <div style={{ width:'100%', position:'relative', background:'#0a0a08' }}>
                  <img src={item.imageUrl} alt={item.title}
                    style={{ width:'100%', display:'block', maxHeight:'55vh', objectFit:'contain', filter:'sepia(0.1) contrast(1.05)' }} />
                  <div style={{ position:'absolute', bottom:0, left:0, right:0, height:70, background:'linear-gradient(transparent, #141410)' }} />
                </div>

                {/* Frame strip */}
                <div style={{ display:'flex', alignItems:'center', flexWrap:'wrap', gap:8, padding:'5px 16px', background:'#1a1a15', borderTop:'1px solid rgba(201,168,76,0.1)', borderBottom:'1px solid rgba(201,168,76,0.1)', fontFamily:'monospace', fontSize:'0.55rem', letterSpacing:'0.22em', color:'rgba(201,168,76,0.45)' }}>
                  <span style={{ color:'#c9a84c' }}>FRAME {frameNum}</span>
                  <span>◆</span><span>ANNOUNCEMENT</span>
                  <span>◆</span><span>{item.category?.toUpperCase()}</span>
                </div>

                {/* Text */}
                <div style={{ padding:'18px 20px 28px' }}>
                  <span style={{ display:'block', width:14, height:14, marginBottom:12, borderTop:'2px solid rgba(201,168,76,0.4)', borderLeft:'2px solid rgba(201,168,76,0.4)' }} />

                  <h3 style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'1.9rem', letterSpacing:'0.1em', lineHeight:1.05, color:'#e8c97a', marginBottom:12, textShadow:'0 0 30px rgba(201,168,76,0.3)' }}>
                    {item.title}
                  </h3>

                  <span style={{ fontFamily:'monospace', fontSize:'0.58rem', letterSpacing:'0.2em', textTransform:'uppercase', padding:'3px 10px', borderRadius:2, background:'rgba(201,168,76,0.15)', border:'1px solid rgba(201,168,76,0.3)', color:'#c9a84c', display:'inline-block', marginBottom:18 }}>
                    {item.category}
                  </span>

                  {item.link && (
                    <div>
                      <a href={item.link} target="_blank" rel="noreferrer"
                        style={{ display:'inline-flex', alignItems:'center', gap:7, fontFamily:"'Bebas Neue', sans-serif", letterSpacing:'0.18em', fontSize:'0.95rem', padding:'10px 26px', background:'#c9a84c', color:'#0a0a08', borderRadius:2, textDecoration:'none', transition:'background 0.2s' }}
                        onMouseEnter={e => e.currentTarget.style.background='#e8c97a'}
                        onMouseLeave={e => e.currentTarget.style.background='#c9a84c'}>
                        See more <ExternalLink size={13} />
                      </a>
                    </div>
                  )}

                  <span style={{ display:'block', width:14, height:14, marginTop:20, marginLeft:'auto', borderBottom:'2px solid rgba(201,168,76,0.4)', borderRight:'2px solid rgba(201,168,76,0.4)' }} />
                </div>
              </div>

              {/* Right sprockets */}
              <div style={{ width:26, background:'#1a1a15', borderLeft:'1px solid rgba(201,168,76,0.12)', flexShrink:0 }}>
                <Sprockets count={14} />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

/* ══ FILM REEL WATCH BUTTON ══ */
const FilmWatchButton = ({ href }) => {
  const [spinning, setSpinning] = useState(false);

  const handleClick = () => {
    setSpinning(true);
    setTimeout(() => setSpinning(false), 600);
    // clapper sound
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const buf = ctx.createBuffer(1, ctx.sampleRate * 0.12, ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = (Math.random()*2-1) * Math.pow(1-i/d.length, 2) * 0.35;
      const src = ctx.createBufferSource();
      src.buffer = buf;
      const g = ctx.createGain();
      g.gain.setValueAtTime(1, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
      src.connect(g); g.connect(ctx.destination);
      src.start();
    } catch(_) {}
  };

  return (
    <a href={href} target="_blank" rel="noreferrer" onClick={handleClick}
      style={{
        display:'inline-flex', alignItems:'center', gap:0, flexShrink:0,
        textDecoration:'none', position:'relative',
      }}>
      {/* left sprocket tape */}
      <div style={{ display:'flex', flexDirection:'column', gap:3, padding:'4px 3px', background:'#1a1208', border:'1px solid rgba(201,168,76,0.35)', borderRight:'none', borderRadius:'3px 0 0 3px' }}>
        {[0,1,2].map(i => <div key={i} style={{ width:6, height:4, background:'#0a0a08', border:'1px solid rgba(201,168,76,0.3)', borderRadius:1 }} />)}
      </div>

      {/* center body */}
      <div style={{
        display:'flex', alignItems:'center', gap:6, padding:'6px 12px',
        background:'#c9a84c', color:'#0a0a08',
        transition:'background 0.2s',
      }}
        onMouseEnter={e => e.currentTarget.style.background='#e8c97a'}
        onMouseLeave={e => e.currentTarget.style.background='#c9a84c'}
      >
        {/* reel SVG */}
        <svg viewBox="0 0 18 18" width="14" height="14" style={{ transform: spinning ? 'rotate(60deg)' : 'rotate(0deg)', transition:'transform 0.3s' }}>
          <circle cx="9" cy="9" r="8" stroke="#0a0a08" strokeWidth="1.2" fill="none"/>
          <circle cx="9" cy="9" r="2.5" fill="#0a0a08"/>
          {[0,60,120,180,240,300].map((deg,i)=>{
            const r=deg*Math.PI/180;
            return <circle key={i} cx={9+5.5*Math.cos(r)} cy={9+5.5*Math.sin(r)} r="1.4" fill="#0a0a08"/>;
          })}
        </svg>
        <span style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'0.75rem', letterSpacing:'0.22em', whiteSpace:'nowrap' }}>WATCH</span>
      </div>

      {/* right sprocket tape */}
      <div style={{ display:'flex', flexDirection:'column', gap:3, padding:'4px 3px', background:'#1a1208', border:'1px solid rgba(201,168,76,0.35)', borderLeft:'none', borderRadius:'0 3px 3px 0' }}>
        {[0,1,2].map(i => <div key={i} style={{ width:6, height:4, background:'#0a0a08', border:'1px solid rgba(201,168,76,0.3)', borderRadius:1 }} />)}
      </div>
    </a>
  );
};

/* ══ MAIN HOME ══ */
const Home = () => {
  const [updates, setUpdates]     = useState([]);
  const [activeTab, setActiveTab] = useState('All');

  useEffect(() => {
    const q = query(collection(db, "updates"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snap) => {
      const arr = [];
      snap.forEach(d => arr.push({ ...d.data(), id: d.id }));
      setUpdates(arr);
    });
    return () => unsubscribe();
  }, []);

  const announcements = updates.filter(i => i.type === 'Announcement');
  const works = updates.filter(i => (activeTab === 'All' || i.category === activeTab) && i.type !== 'Announcement');

  return (
    <div className="min-h-screen w-full text-white relative overflow-x-hidden flex flex-col font-sans">
      <FontImport />

      <main className="relative z-10 flex-grow w-full max-w-[560px] mx-auto p-4 md:p-8 space-y-12">

        {/* ── HEADER ── */}
        <header className="text-center py-8">
          <h1 style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'clamp(3rem, 8vw, 6rem)', letterSpacing:'0.15em', color:'#f2ead8', textShadow:'0 0 40px rgba(201,168,76,0.2)', lineHeight:1 }}>
            OINDRILA <span style={{ color:'#c9a84c' }}>SEN</span>
          </h1>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:12, marginTop:10 }}>
            <div style={{ height:1, width:60, background:'linear-gradient(to right, transparent, rgba(201,168,76,0.4))' }} />
            <p style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'0.75rem', letterSpacing:'0.55em', color:'rgba(201,168,76,0.6)', textTransform:'uppercase' }}>
              Official Dashboard
            </p>
            <div style={{ height:1, width:60, background:'linear-gradient(to left, transparent, rgba(201,168,76,0.4))' }} />
          </div>
        </header>

        {/* ── LATEST NEWS ── */}
        <section style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(201,168,76,0.12)', borderRadius:20, padding:'28px 28px' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:10, marginBottom:20 }}>
            <div style={{ height:1, flex:1, background:'linear-gradient(to right, transparent, rgba(201,168,76,0.25))' }} />
            <h3 style={{ display:'flex', alignItems:'center', gap:8, fontFamily:"'Bebas Neue', sans-serif", fontSize:'1.2rem', letterSpacing:'0.3em', color:'#c9a84c', textTransform:'uppercase', whiteSpace:'nowrap' }}>
              <Megaphone size={18} /> Latest News
            </h3>
            <div style={{ height:1, flex:1, background:'linear-gradient(to left, transparent, rgba(201,168,76,0.25))' }} />
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {announcements.length === 0 ? (
              <p style={{ textAlign:'center', color:'rgba(255,255,255,0.2)', fontFamily:'monospace', fontSize:'0.7rem', fontStyle:'italic', letterSpacing:'0.15em' }}>No news published yet...</p>
            ) : (
              announcements.map((post, index) => (
                <FilmAnnouncementCard key={post.id} item={post} index={index} />
              ))
            )}
          </div>
        </section>

        {/* ── MY WORKS ── */}
        <section style={{ paddingBottom:80 }}>
          {/* section header */}
          <div style={{ display:'flex', flexDirection:'column', gap:14, marginBottom:24 }}>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <div style={{ height:1, flex:1, background:'linear-gradient(to right, transparent, rgba(201,168,76,0.2))' }} />
              <h3 style={{ display:'flex', alignItems:'center', gap:8, fontFamily:"'Bebas Neue', sans-serif", fontSize:'1.2rem', letterSpacing:'0.3em', color:'#c9a84c', textTransform:'uppercase', whiteSpace:'nowrap' }}>
                <LayoutGrid size={18} /> My Works
              </h3>
              <div style={{ height:1, flex:1, background:'linear-gradient(to left, transparent, rgba(201,168,76,0.2))' }} />
            </div>

            {/* Tab filters — film strip style */}
            <div style={{ display:'flex', justifyContent:'center' }}>
              <div style={{ display:'flex', background:'#0f0f0d', border:'1px solid rgba(201,168,76,0.2)', borderRadius:4, overflow:'hidden', position:'relative' }}>
                {/* sprocket holes top */}
                {['All', 'Film', 'Web Series', 'Serial'].map(t => (
                  <button key={t} onClick={() => setActiveTab(t)} style={{
                    padding:'7px 16px', cursor:'pointer', transition:'all 0.2s',
                    fontFamily:"'Bebas Neue', sans-serif", fontSize:'0.75rem', letterSpacing:'0.25em', textTransform:'uppercase',
                    background: activeTab === t ? '#c9a84c' : 'transparent',
                    color: activeTab === t ? '#0a0a08' : 'rgba(201,168,76,0.5)',
                    borderRight:'1px solid rgba(201,168,76,0.12)',
                    borderLeft:'none', borderTop:'none', borderBottom:'none',
                  }}>{t}</button>
                ))}
              </div>
            </div>
          </div>

          {/* Works list */}
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {works.length === 0 ? (
              <p style={{ textAlign:'center', color:'rgba(255,255,255,0.15)', fontFamily:'monospace', fontSize:'0.7rem', fontStyle:'italic', letterSpacing:'0.15em', padding:'40px 0' }}>No works published yet...</p>
            ) : (
              works.map((item) => (
                <div key={item.id} style={{
                  display:'flex', alignItems:'center', gap:14,
                  background:'rgba(255,255,255,0.03)', padding:'12px 16px',
                  borderRadius:8, border:'1px solid rgba(201,168,76,0.08)',
                  transition:'border-color 0.2s',
                }}
                  onMouseEnter={e => e.currentTarget.style.borderColor='rgba(201,168,76,0.2)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor='rgba(201,168,76,0.08)'}
                >
                  {/* poster thumb */}
                  <div style={{ width:44, height:58, flexShrink:0, overflow:'hidden', borderRadius:4, border:'1px solid rgba(201,168,76,0.2)', boxShadow:'0 4px 12px rgba(0,0,0,0.4)' }}>
                    <img src={item.imageUrl} alt="poster" style={{ width:'100%', height:'100%', objectFit:'cover', transition:'transform 0.5s' }}
                      onMouseEnter={e => e.currentTarget.style.transform='scale(1.1)'}
                      onMouseLeave={e => e.currentTarget.style.transform='scale(1)'} />
                  </div>

                  {/* info */}
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'1rem', letterSpacing:'0.1em', textTransform:'uppercase', color:'#f2ead8', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', marginBottom:4 }}>
                      {item.title}
                    </p>
                    <span style={{ fontFamily:'monospace', fontSize:'0.55rem', letterSpacing:'0.18em', textTransform:'uppercase', padding:'2px 7px', borderRadius:2, background:'rgba(201,168,76,0.1)', border:'1px solid rgba(201,168,76,0.25)', color:'rgba(201,168,76,0.7)' }}>
                      {item.category}
                    </span>
                  </div>

                  {/* Film reel Watch button */}
                  <FilmWatchButton href={item.link} />
                </div>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Home;