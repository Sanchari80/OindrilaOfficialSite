import React, { useState, useEffect, useCallback } from 'react';

const PHOTOS = [
  '/oinz123.png',
  '/oinzz.png',
  '/oinzz1.png',
  '/sen.jpg',
];

const INTERVAL = 4000;

/* ══ Info Data ══ */
const INFO = {
  personal: [
    { label: 'Full Name',       value: 'Oindrila Sen' },
    { label: 'Birthday',        value: '31st March' },
    { label: 'Birthplace',      value: 'Kolkata, India' },
    { label: 'Religion',        value: 'Hinduism' },
    { label: 'Marital Status',  value: 'Unmarried' },
    { label: 'Hobbies',         value: 'Cooking, Shopping, Gymming' },
    { label: 'Debut Film',      value: 'Bondhon (2000) — as Child Artist' },
    { label: 'Popular Serials', value: 'Sat Pake Bandha · Phagun Bou' },
    { label: 'Sat Pake Bandha', value: 'Played lead role — one of the most beloved Bengali TV serials' },
    { label: 'Phagun Bou',      value: 'Played lead role Tuni — iconic character in Bengali television' },
  ],
  favourites: [
    { label: 'Favourite Food',        value: "Dahi Chicken, Potato Cheese Nuggets, Omelette" },
    { label: 'Favourite Actor',       value: 'Aamir Khan and Ranvir Kappor' },
    { label: 'Favourite Actress',     value: 'Hema Malini' },
    { label: 'Favourite Film',        value: "Bollywood — Raaz · Hollywood — A Walk to Remember" },
    { label: 'Favourite Colour',      value: 'Black' },
    { label: 'Favourite Destination', value: 'Switchzerland' },
  ],
  family: [
    { label: 'Father',  value: 'Shantanu Sen' },
    { label: 'Mother',  value: 'Kasturi Sen' },
    { label: 'Partner', value: 'Ankush Hazra (Actor)' },
  ],
};

const FontImport = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Special+Elite&display=swap');

    @keyframes curtainLeft  { from{transform:scaleX(1) translateX(0);} to{transform:scaleX(0) translateX(-100%);} }
    @keyframes curtainRight { from{transform:scaleX(1) translateX(0);} to{transform:scaleX(0) translateX(100%);} }
    @keyframes fadeIn       { from{opacity:0;} to{opacity:1;} }
    @keyframes slideUp      { from{opacity:0;transform:translateY(20px);} to{opacity:1;transform:translateY(0);} }
    @keyframes pulse        { 0%,100%{opacity:0.4;} 50%{opacity:1;} }
    @keyframes shimmer      { 0%{background-position:-200% center;} 100%{background-position:200% center;} }
    @keyframes tickerScroll { from{transform:translateX(100%);} to{transform:translateX(-100%);} }

    .info-row:hover { background: rgba(201,168,76,0.06) !important; }
    .tab-btn:hover  { color: #c9a84c !important; }

    ::-webkit-scrollbar       { width:4px; }
    ::-webkit-scrollbar-track { background:#0a0a08; }
    ::-webkit-scrollbar-thumb { background:rgba(201,168,76,0.3); border-radius:2px; }
  `}</style>
);

/* ══ Sprocket strip ══ */
const SprocketStrip = ({ count = 10, vertical = false }) => (
  <div style={{
    display:'flex',
    flexDirection: vertical ? 'column' : 'row',
    alignItems:'center',
    justifyContent:'space-around',
    padding: vertical ? '8px 0' : '0 8px',
    gap: vertical ? 6 : 0,
    ...(vertical ? { height:'100%' } : {}),
  }}>
    {Array.from({ length: count }).map((_,i) => (
      <div key={i} style={{
        width:  vertical ? 7 : 11,
        height: vertical ? 11 : 7,
        background:'#080806',
        border:'1px solid rgba(201,168,76,0.22)',
        borderRadius:2, flexShrink:0,
      }} />
    ))}
  </div>
);

/* ══ Cinema Screen Slideshow ══ */
const CinemaScreen = () => {
  const [current, setCurrent]   = useState(0);
  const [fading,  setFading]    = useState(false);
  const [opened,  setOpened]    = useState(false);

  // Open curtains on mount
  useEffect(() => {
    const t = setTimeout(() => setOpened(true), 600);
    return () => clearTimeout(t);
  }, []);

  const next = useCallback(() => {
    setFading(true);
    setTimeout(() => {
      setCurrent(c => (c + 1) % PHOTOS.length);
      setFading(false);
    }, 500);
  }, []);

  useEffect(() => {
    const id = setInterval(next, INTERVAL);
    return () => clearInterval(id);
  }, [next]);

  return (
    <div style={{ position:'relative', width:'100%' }}>

      {/* ── Projector beam ── */}
      <div style={{
        position:'absolute', top:-60, left:'50%', transform:'translateX(-50%)',
        width:0, height:0,
        borderLeft:'60px solid transparent',
        borderRight:'60px solid transparent',
        borderTop:'60px solid rgba(201,168,76,0.04)',
        zIndex:0, pointerEvents:'none',
        filter:'blur(8px)',
      }} />

      {/* ── Screen frame ── */}
      <div style={{
        position:'relative',
        border:'3px solid rgba(201,168,76,0.5)',
        borderRadius:4,
        overflow:'hidden',
        boxShadow:'0 0 60px rgba(201,168,76,0.1), inset 0 0 30px rgba(0,0,0,0.6)',
        background:'#0a0a08',
      }}>

        {/* top film strip */}
        <div style={{ background:'#111109', borderBottom:'1px solid rgba(201,168,76,0.2)', padding:'5px 0' }}>
          <SprocketStrip count={12} />
        </div>

        {/* screen with curtains */}
        <div style={{ position:'relative', height: 420, overflow:'hidden' }}>

          {/* photo */}
          <img
            src={PHOTOS[current]}
            alt="Oindrila Sen"
            style={{
              width:'100%', height:'100%', objectFit:'cover', display:'block',
              filter:'sepia(0.15) contrast(1.1) brightness(0.9)',
              opacity: fading ? 0 : 1,
              transition:'opacity 0.5s ease',
            }}
          />

          {/* vignette */}
          <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse at center, transparent 35%, rgba(0,0,0,0.6) 100%)', pointerEvents:'none' }} />

          {/* bottom gradient */}
          <div style={{ position:'absolute', bottom:0, left:0, right:0, height:80, background:'linear-gradient(transparent, rgba(0,0,0,0.75))', pointerEvents:'none' }} />

          {/* name overlay */}
          <div style={{ position:'absolute', bottom:14, left:0, right:0, textAlign:'center', pointerEvents:'none' }}>
            <p style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'1.4rem', letterSpacing:'0.35em', color:'rgba(201,168,76,0.9)', margin:0, textShadow:'0 2px 12px rgba(0,0,0,0.8)' }}>
              OINDRILA SEN
            </p>
          </div>

          {/* ── Curtains ── */}
          <div style={{
            position:'absolute', inset:0, display:'flex', pointerEvents:'none',
          }}>
            {/* left curtain */}
            <div style={{
              width:'50%', height:'100%',
              background:'linear-gradient(to right, #1a0a04, #2d1208)',
              transformOrigin:'left center',
              transform: opened ? 'scaleX(0) translateX(-100%)' : 'scaleX(1)',
              transition:'transform 1.2s cubic-bezier(0.77,0,0.18,1)',
              borderRight:'2px solid rgba(201,168,76,0.3)',
              zIndex:5,
            }}>
              {/* curtain folds */}
              {[...Array(5)].map((_,i) => (
                <div key={i} style={{ position:'absolute', top:0, bottom:0, left:`${i*22}%`, width:3, background:'rgba(0,0,0,0.3)', borderRadius:2 }} />
              ))}
            </div>
            {/* right curtain */}
            <div style={{
              width:'50%', height:'100%',
              background:'linear-gradient(to left, #1a0a04, #2d1208)',
              transformOrigin:'right center',
              transform: opened ? 'scaleX(0) translateX(100%)' : 'scaleX(1)',
              transition:'transform 1.2s cubic-bezier(0.77,0,0.18,1)',
              borderLeft:'2px solid rgba(201,168,76,0.3)',
              zIndex:5,
            }}>
              {[...Array(5)].map((_,i) => (
                <div key={i} style={{ position:'absolute', top:0, bottom:0, right:`${i*22}%`, width:3, background:'rgba(0,0,0,0.3)', borderRadius:2 }} />
              ))}
            </div>
          </div>

          {/* frame number */}
          <div style={{ position:'absolute', top:8, left:10, fontFamily:'monospace', fontSize:'0.45rem', color:'rgba(201,168,76,0.35)', letterSpacing:'0.2em', zIndex:6 }}>
            ◈ FRAME {String(current + 1).padStart(2,'0')}/{PHOTOS.length}
          </div>
        </div>

        {/* dot indicators */}
        <div style={{ display:'flex', justifyContent:'center', gap:5, padding:'8px 0', background:'#0d0d0b', borderTop:'1px solid rgba(201,168,76,0.12)' }}>
          {PHOTOS.map((_,i) => (
            <div key={i} onClick={() => { setFading(true); setTimeout(()=>{ setCurrent(i); setFading(false); }, 400); }}
              style={{ width: i===current ? 18 : 5, height:4, borderRadius:2, cursor:'pointer', background: i===current ? '#c9a84c' : 'rgba(201,168,76,0.2)', transition:'all 0.3s' }}
            />
          ))}
        </div>

        {/* bottom film strip */}
        <div style={{ background:'#111109', borderTop:'1px solid rgba(201,168,76,0.2)', padding:'5px 0' }}>
          <SprocketStrip count={12} />
        </div>
      </div>

      {/* corner L-brackets */}
      {[['top','left'],['top','right'],['bottom','left'],['bottom','right']].map(([v,h],i) => (
        <span key={i} style={{
          position:'absolute',
          [v]: -10, [h]: -10,
          width:16, height:16,
          borderTop:    v==='top'    ? '2px solid rgba(201,168,76,0.5)' : 'none',
          borderBottom: v==='bottom' ? '2px solid rgba(201,168,76,0.5)' : 'none',
          borderLeft:   h==='left'   ? '2px solid rgba(201,168,76,0.5)' : 'none',
          borderRight:  h==='right'  ? '2px solid rgba(201,168,76,0.5)' : 'none',
        }} />
      ))}
    </div>
  );
};

/* ══ Info Section ══ */
const InfoRow = ({ label, value, delay = 0 }) => (
  <div className="info-row" style={{
    display:'flex', gap:12, padding:'9px 14px',
    borderBottom:'1px solid rgba(201,168,76,0.07)',
    background:'transparent', transition:'background 0.2s',
    animation:`slideUp 0.4s ${delay}s ease both`,
  }}>
    <span style={{
      fontFamily:"'Bebas Neue', sans-serif", fontSize:'0.68rem',
      letterSpacing:'0.22em', color:'rgba(201,168,76,0.55)',
      textTransform:'uppercase', minWidth:160, flexShrink:0,
      lineHeight:1.5,
    }}>{label}</span>
    <span style={{
      fontFamily:"'Special Elite', monospace", fontSize:'0.78rem',
      color:'rgba(255,255,255,0.7)', lineHeight:1.5, flex:1,
    }}>{value}</span>
  </div>
);

const SectionBox = ({ title, icon, rows }) => (
  <div style={{
    border:'1px solid rgba(201,168,76,0.15)',
    borderRadius:4, overflow:'hidden',
    background:'rgba(255,255,255,0.015)',
    marginBottom:14,
  }}>
    {/* section header */}
    <div style={{
      display:'flex', alignItems:'center', gap:10,
      padding:'8px 14px',
      background:'rgba(201,168,76,0.06)',
      borderBottom:'1px solid rgba(201,168,76,0.15)',
    }}>
      <span style={{ fontSize:'0.9rem' }}>{icon}</span>
      <span style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'0.78rem', letterSpacing:'0.28em', color:'#c9a84c', textTransform:'uppercase' }}>{title}</span>
      {/* divider line */}
      <div style={{ flex:1, height:1, background:'linear-gradient(to right, rgba(201,168,76,0.3), transparent)' }} />
    </div>
    {rows.map((r,i) => <InfoRow key={i} label={r.label} value={r.value} delay={i*0.04} />)}
  </div>
);

/* ══ Birthday countdown ══ */
const BirthdayCountdown = () => {
  const [days, setDays] = useState(0);

  useEffect(() => {
    const calc = () => {
      const now   = new Date();
      const bday  = new Date(now.getFullYear(), 2, 31);
      if (now > bday) bday.setFullYear(now.getFullYear() + 1);
      const diff  = Math.ceil((bday - now) / (1000*60*60*24));
      setDays(diff === 0 ? 0 : diff);
    };
    calc();
    const id = setInterval(calc, 60000);
    return () => clearInterval(id);
  }, []);

  const isToday = days === 0;

  return (
    <div style={{
      display:'flex', alignItems:'center', gap:12,
      padding:'12px 16px', marginBottom:16,
      background: isToday ? 'rgba(201,168,76,0.12)' : 'rgba(201,168,76,0.05)',
      border:`1px solid ${isToday ? 'rgba(201,168,76,0.6)' : 'rgba(201,168,76,0.2)'}`,
      borderRadius:4,
    }}>
      <span style={{ fontSize:'1.6rem' }}>🎂</span>
      <div>
        <p style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'0.75rem', letterSpacing:'0.25em', color:'#c9a84c', margin:0, textTransform:'uppercase' }}>
          {isToday ? '🎉 Happy Birthday Oindrila!' : 'Birthday · 31st March'}
        </p>
        <p style={{ fontFamily:'monospace', fontSize:'0.6rem', color:'rgba(255,255,255,0.45)', margin:'3px 0 0', letterSpacing:'0.1em' }}>
          {isToday ? '🎉 Happy Birthday Oindrila!' : ` ${days} days left!`}
        </p>
      </div>
      {!isToday && (
        <div style={{ marginLeft:'auto', textAlign:'center', padding:'6px 12px', background:'rgba(201,168,76,0.1)', border:'1px solid rgba(201,168,76,0.25)', borderRadius:3 }}>
          <p style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'1.6rem', color:'#c9a84c', margin:0, lineHeight:1 }}>{days}</p>
          <p style={{ fontFamily:'monospace', fontSize:'0.45rem', color:'rgba(201,168,76,0.5)', margin:'2px 0 0', letterSpacing:'0.15em', textTransform:'uppercase' }}>days</p>
        </div>
      )}
    </div>
  );
};

/* ══ News Ticker ══ */
const NewsTicker = () => (
  <div style={{ overflow:'hidden', background:'rgba(201,168,76,0.06)', borderTop:'1px solid rgba(201,168,76,0.15)', borderBottom:'1px solid rgba(201,168,76,0.15)', padding:'5px 0' }}>
    <p style={{ whiteSpace:'nowrap', animation:'tickerScroll 22s linear infinite', fontFamily:"'Bebas Neue', sans-serif", fontSize:'0.65rem', letterSpacing:'0.25em', color:'rgba(201,168,76,0.55)', margin:0 }}>
      ◈ OINDRILA SEN ◆ Bengali Film Actress ◆ Born 31st March ◆ Kolkata, India ◆ Favourite Film: Raaz · A Walk to Remember ◆ Partner: Ankush Hazra ◆ Hobbies: Cooking · Shopping · Gymming ◆ Favourite Colour: Black ◆ Dream Destination: London ◆
    </p>
  </div>
);

/* ══════════════════════════
   MAIN ProfilePage
══════════════════════════ */
const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState('personal');

  const tabs = [
    { key:'personal',   label:'Personal',   icon:'🎭' },
    { key:'favourites', label:'Favourites', icon:'⭐' },
    { key:'family',     label:'Family',     icon:'🎬' },
  ];

  return (
    <div style={{ minHeight:'100vh', color:'#f2ead8', paddingBottom:40 }}>
      <FontImport />

      {/* ── Page header ── */}
      <div style={{ textAlign:'center', padding:'28px 20px 20px' }}>
        <p style={{ fontFamily:'monospace', fontSize:'0.5rem', letterSpacing:'0.4em', color:'rgba(201,168,76,0.35)', margin:'0 0 6px', textTransform:'uppercase' }}>
          ◈ Official Profile ◈
        </p>
        <h1 style={{
          fontFamily:"'Bebas Neue', sans-serif",
          fontSize:'clamp(2.2rem, 6vw, 4rem)',
          letterSpacing:'0.2em', margin:0, lineHeight:1,
          background:'linear-gradient(135deg, #f2ead8 30%, #c9a84c 70%)',
          WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
          backgroundClip:'text',
        }}>
          OINDRILA SEN
        </h1>
        <p style={{ fontFamily:"'Special Elite', monospace", fontSize:'0.75rem', color:'rgba(201,168,76,0.45)', letterSpacing:'0.2em', margin:'8px 0 0' }}>
          Bengali Film & Television Actress
        </p>
        {/* divider */}
        <div style={{ display:'flex', alignItems:'center', gap:10, maxWidth:300, margin:'12px auto 0' }}>
          <div style={{ flex:1, height:1, background:'linear-gradient(to right, transparent, rgba(201,168,76,0.4))' }} />
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none">
            <circle cx="12" cy="12" r="10" stroke="rgba(201,168,76,0.5)" strokeWidth="1"/>
            <circle cx="12" cy="12" r="3" fill="rgba(201,168,76,0.4)"/>
            {[0,60,120,180,240,300].map((d,i)=>{const r=d*Math.PI/180;return<circle key={i} cx={12+7*Math.cos(r)} cy={12+7*Math.sin(r)} r="1.2" fill="rgba(201,168,76,0.3)"/>})}
          </svg>
          <div style={{ flex:1, height:1, background:'linear-gradient(to left, transparent, rgba(201,168,76,0.4))' }} />
        </div>
      </div>

      <NewsTicker />

      {/* ── Main layout ── */}
      <div style={{ maxWidth:960, margin:'0 auto', padding:'20px 16px', display:'flex', gap:24, alignItems:'flex-start', flexWrap:'wrap' }}>

        {/* LEFT: Cinema screen */}
        <div style={{ flex:'0 0 320px', minWidth:260, maxWidth:340 }}>
          <CinemaScreen />

          {/* quick stats below screen */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginTop:14 }}>
            {[
              { label:'From',      value:'Kolkata' },
              { label:'Colour',    value:'Black' },
              { label:'Status',    value:'Unmarried' },
              { label:'Debut',     value:'Bondhon (2000)' },
            ].map((s,i) => (
              <div key={i} style={{ padding:'8px 10px', background:'rgba(201,168,76,0.05)', border:'1px solid rgba(201,168,76,0.15)', borderRadius:3, textAlign:'center' }}>
                <p style={{ fontFamily:'monospace', fontSize:'0.45rem', color:'rgba(201,168,76,0.45)', letterSpacing:'0.2em', margin:'0 0 3px', textTransform:'uppercase' }}>{s.label}</p>
                <p style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'0.8rem', letterSpacing:'0.15em', color:'#f2ead8', margin:0 }}>{s.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: Info */}
        <div style={{ flex:1, minWidth:280 }}>

          {/* Tabs */}
          <div style={{ display:'flex', marginBottom:14, border:'1px solid rgba(201,168,76,0.15)', borderRadius:4, overflow:'hidden' }}>
            {tabs.map(tab => (
              <button key={tab.key} className="tab-btn" onClick={() => setActiveTab(tab.key)} style={{
                flex:1, padding:'9px 6px', cursor:'pointer',
                fontFamily:"'Bebas Neue', sans-serif", fontSize:'0.72rem', letterSpacing:'0.2em',
                background: activeTab === tab.key ? 'rgba(201,168,76,0.12)' : 'transparent',
                color: activeTab === tab.key ? '#c9a84c' : 'rgba(201,168,76,0.35)',
                border:'none',
                borderBottom: activeTab === tab.key ? '2px solid #c9a84c' : '2px solid transparent',
                transition:'all 0.2s', textTransform:'uppercase',
              }}>
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          {/* Info rows */}
          {activeTab === 'personal'   && <SectionBox title="Personal Info"    icon="🎭" rows={INFO.personal} />}
          {activeTab === 'favourites' && <SectionBox title="Favourite Things" icon="⭐" rows={INFO.favourites} />}
          {activeTab === 'family'     && <SectionBox title="Family & Affairs" icon="🎬" rows={INFO.family} />}

          {/* Social links placeholder */}
          <div style={{ display:'flex', gap:8, marginTop:6 }}>
            {[
              { label:'Instagram', url:'https://www.instagram.com/love_oindrila?igsh=ODMzZTVybDJzeXVw', icon:'📸' },
              { label:'Facebook',  url:'https://www.facebook.com/share/18MXV7G6LR/', icon:'👤' },
            ].map(s => (
              <a key={s.label} href={s.url} target="_blank" rel="noreferrer" style={{
                flex:1, padding:'8px', textAlign:'center',
                background:'rgba(201,168,76,0.06)', border:'1px solid rgba(201,168,76,0.2)',
                borderRadius:3, fontFamily:"'Bebas Neue', sans-serif", fontSize:'0.65rem',
                letterSpacing:'0.2em', color:'rgba(201,168,76,0.6)',
                textDecoration:'none', display:'flex', alignItems:'center',
                justifyContent:'center', gap:5, transition:'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background='rgba(201,168,76,0.15)'; e.currentTarget.style.color='#c9a84c'; e.currentTarget.style.borderColor='rgba(201,168,76,0.45)'; }}
              onMouseLeave={e => { e.currentTarget.style.background='rgba(201,168,76,0.06)'; e.currentTarget.style.color='rgba(201,168,76,0.6)'; e.currentTarget.style.borderColor='rgba(201,168,76,0.2)'; }}
              >
                {s.icon} {s.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;