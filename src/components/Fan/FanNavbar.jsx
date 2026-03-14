import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import {
  collection, query, orderBy, onSnapshot,
  doc, getDoc
} from 'firebase/firestore';
import { auth, db } from '../../firebase/firebaseConfig';
import {
  Bell, MessageSquare, LogOut, UserPlus, User, Film, Menu, X, Calendar
} from 'lucide-react';

const FontImport = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Special+Elite&display=swap');
    @keyframes pulse       { 0%,100%{opacity:0.4;} 50%{opacity:1;} }
    @keyframes ringBell    { 0%,100%{transform:rotate(0);} 20%{transform:rotate(14deg);} 40%{transform:rotate(-10deg);} 60%{transform:rotate(7deg);} 80%{transform:rotate(-4deg);} }
    @keyframes navSlideDown{ from{opacity:0;transform:translateY(-8px);} to{opacity:1;transform:translateY(0);} }
    @keyframes mobileSlide { from{opacity:0;transform:translateX(100%);} to{opacity:1;transform:translateX(0);} }
  `}</style>
);

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

/* ══ Sprocket strip ══ */
const SprocketStrip = ({ count = 14 }) => (
  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-around', padding:'0 10px', height:5 }}>
    {Array.from({ length: count }).map((_,i) => (
      <div key={i} style={{ width:8, height:3, background:'#1a0f06', border:'1px solid rgba(201,168,76,0.75)', borderRadius:1 }} />
    ))}
  </div>
);

/* ══ NavIcon button — brighter ══ */
const NavIcon = ({ icon, label, onClick, active, badge, danger, animBell, hideLabel }) => {
  const [hovered, setHovered] = useState(false);
  const isActive = active || hovered;

  /* brighter color scheme */
  const color = danger
    ? (isActive ? '#ff5e4a' : 'rgba(220,80,60,0.75)')
    : (isActive ? '#f5d568' : 'rgba(220,185,80,0.88)');   /* ← much brighter gold */

  const bg = danger
    ? (isActive ? 'rgba(192,57,43,0.18)' : 'transparent')
    : (isActive ? 'rgba(201,168,76,0.16)' : 'transparent');

  const border = danger
    ? (isActive ? 'rgba(192,57,43,0.45)' : 'transparent')
    : (isActive ? 'rgba(201,168,76,0.45)' : 'transparent');

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      title={label}
      style={{
        position:'relative', display:'flex', flexDirection:'column',
        alignItems:'center', justifyContent:'center', gap:3,
        padding:'5px 10px', cursor:'pointer',
        background: bg,
        border:`1px solid ${border}`,
        borderRadius:3, transition:'all 0.18s',
        color,
        filter: isActive ? 'drop-shadow(0 0 5px rgba(201,168,76,0.45))' : 'none',
      }}
    >
      <div style={{ animation: animBell && badge > 0 ? 'ringBell 0.7s ease' : 'none' }}>
        {icon}
      </div>

      {!hideLabel && (
        <span style={{
          fontFamily:"'Bebas Neue', sans-serif", fontSize:'0.48rem',
          letterSpacing:'0.22em', textTransform:'uppercase', lineHeight:1,
          color:'inherit',
        }}>{label}</span>
      )}

      {/* badge */}
      {badge > 0 && (
        <div style={{
          position:'absolute', top:2, right:4,
          minWidth:15, height:15, borderRadius:8,
          background:'#c0392b', border:'1.5px solid #080806',
          display:'flex', alignItems:'center', justifyContent:'center',
          padding:'0 3px',
        }}>
          <span style={{ fontFamily:'monospace', fontSize:'0.42rem', color:'#fff', fontWeight:'bold', letterSpacing:0 }}>
            {badge > 9 ? '9+' : badge}
          </span>
        </div>
      )}
    </button>
  );
};

/* ══ Divider ══ */
const NavDivider = () => (
  <div style={{ width:1, height:28, background:'rgba(201,168,76,0.15)', margin:'0 2px' }} />
);

/* ══════════════════════════════
   MAIN NAVBAR
══════════════════════════════ */
const FanNavbar = () => {
  const navigate                       = useNavigate();
  const location                       = useLocation();
  const device                         = useDevice();
  const isMobile                       = device === 'mobile';
  const isTablet                       = device === 'tablet';
  const isSmall                        = isMobile || isTablet;

  const [user,        setUser]         = useState(null);
  const [unreadCount, setUnreadCount]  = useState(0);
  const [bellAnim,    setBellAnim]     = useState(false);
  const [mobileOpen,  setMobileOpen]   = useState(false);
  const prevNotifCount                 = useRef(0);
  const bellTimer                      = useRef(null);

  /* ── Auth ── */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => setUser(u));
    return () => unsub();
  }, []);

  /* ── Unread count ── */
  useEffect(() => {
    if (!user) { setUnreadCount(0); return; }
    let readIds = new Set();
    getDoc(doc(db, 'fans', user.uid)).then(snap => {
      if (snap.exists()) readIds = new Set(snap.data().readNotifs || []);
    });
    const q = query(collection(db, 'updates'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      const unread = snap.docs.filter(d => !readIds.has(d.id)).length + 1;
      if (snap.docs.length > prevNotifCount.current && prevNotifCount.current > 0) {
        setBellAnim(true);
        clearTimeout(bellTimer.current);
        bellTimer.current = setTimeout(() => setBellAnim(false), 1000);
      }
      prevNotifCount.current = snap.docs.length;
      setUnreadCount(unread);
    });
    return () => { unsub(); clearTimeout(bellTimer.current); };
  }, [user]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
    setMobileOpen(false);
  };

  const go = (path) => { navigate(path); setMobileOpen(false); };
  const isAt = (path) => location.pathname === path;
  const displayName = user?.displayName || user?.email?.split('@')[0] || '';

  if (location.pathname.startsWith('/admin')) return null;

  /* sprocket count based on device */
  const sprocketCount = isMobile ? 10 : isTablet ? 14 : 20;

  return (
    <>
      <FontImport />

      <nav style={{
        position:'fixed', top:0, left:0, right:0, zIndex:100,
        background:'rgba(10,10,8,0.96)',
        backdropFilter:'blur(16px)',
        borderBottom:'1px solid rgba(201,168,76,0.15)',
        boxShadow:'0 4px 30px rgba(0,0,0,0.5)',
        animation:'navSlideDown 0.4s ease',
      }}>
        {/* top sprockets */}
        <div style={{ background:'#100d08', borderBottom:'1px solid rgba(201,168,76,0.1)' }}>
          <SprocketStrip count={sprocketCount} />
        </div>

        {/* main bar */}
        <div style={{
          display:'flex', alignItems:'center',
          justifyContent:'space-between',
          padding: isMobile ? '5px 10px' : '6px 16px',
          minHeight: isMobile ? 44 : 48,
        }}>

          {/* ── Brand / Logo ── */}
          <button onClick={() => go('/')} style={{
            background:'none', border:'none', cursor:'pointer',
            display:'flex', alignItems:'center', gap: isMobile ? 7 : 10,
            padding:'4px 6px', borderRadius:3, transition:'background 0.2s',
            flexShrink:0,
          }}
            onMouseEnter={e => e.currentTarget.style.background='rgba(201,168,76,0.06)'}
            onMouseLeave={e => e.currentTarget.style.background='transparent'}>
            <div style={{
              width: isMobile ? 24 : 28, height: isMobile ? 24 : 28,
              borderRadius:2, background:'rgba(201,168,76,0.12)',
              border:'1px solid rgba(201,168,76,0.4)',
              display:'flex', alignItems:'center', justifyContent:'center',
            }}>
              <Film size={isMobile ? 12 : 14} style={{ color:'#e0b84a' }} />
            </div>
            <div style={{ textAlign:'left' }}>
              <p style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize: isMobile ? '0.85rem' : '1rem', letterSpacing:'0.2em', color:'#e0b84a', margin:0, lineHeight:1 }}>OINDRILA SEN</p>
              {!isMobile && <p style={{ fontFamily:'monospace', fontSize:'0.42rem', letterSpacing:'0.2em', color:'rgba(201,168,76,0.4)', margin:0, textTransform:'uppercase' }}>Official Site</p>}
            </div>
          </button>

          {/* ── Desktop / Tablet icons ── */}
          {!isMobile && (
            <div style={{ display:'flex', alignItems:'center', gap:2 }}>
              <NavIcon icon={<Film size={16}/>}    label="Home"      onClick={() => go('/')}             active={isAt('/')} />
              <NavIcon icon={<User size={16}/>}    label="Profile"   onClick={() => go('/profile')}      active={isAt('/profile')} />
              <NavDivider />

              {!user && (
                <NavIcon icon={<UserPlus size={16}/>} label="Fan Zone" onClick={() => go('/fan-zone')} active={isAt('/fan-zone')} />
              )}

              {user && (
                <>
                  <NavIcon icon={<Bell size={16}/>}          label="Alerts"    onClick={() => go('/notifications')} active={isAt('/notifications')} badge={unreadCount} animBell={bellAnim} />
                  <NavIcon icon={<MessageSquare size={16}/>} label="Community" onClick={() => go('/community')}     active={isAt('/community')} />
                  <NavIcon icon={<Calendar size={16}/>}      label="Events"    onClick={() => go('/events')}        active={isAt('/events')} />
                  <NavDivider />

                  {/* user chip — hide on tablet if too cramped */}
                  {!isTablet && (
                    <div style={{ display:'flex', alignItems:'center', gap:6, padding:'4px 8px', borderRadius:3, background:'rgba(201,168,76,0.06)', border:'1px solid rgba(201,168,76,0.12)' }}>
                      <div style={{ width:20, height:20, borderRadius:'50%', background:'rgba(201,168,76,0.18)', border:'1.5px solid rgba(201,168,76,0.4)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                        <span style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'0.5rem', color:'#e0b84a' }}>
                          {displayName.slice(0,2).toUpperCase()}
                        </span>
                      </div>
                      <span style={{ fontFamily:"'Special Elite', monospace", fontSize:'0.65rem', color:'rgba(255,255,255,0.5)', maxWidth:70, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                        {displayName}
                      </span>
                    </div>
                  )}

                  <NavIcon icon={<LogOut size={15}/>} label="Logout" onClick={handleLogout} danger />
                </>
              )}
            </div>
          )}

          {/* ── Mobile right side: badge bell + hamburger ── */}
          {isMobile && (
            <div style={{ display:'flex', alignItems:'center', gap:4 }}>
              {/* quick bell shortcut on mobile if logged in */}
              {user && (
                <NavIcon
                  icon={<Bell size={18}/>}
                  label=""
                  hideLabel
                  onClick={() => go('/notifications')}
                  active={isAt('/notifications')}
                  badge={unreadCount}
                  animBell={bellAnim}
                />
              )}

              {/* hamburger */}
              <button
                onClick={() => setMobileOpen(o => !o)}
                style={{
                  background: mobileOpen ? 'rgba(201,168,76,0.12)' : 'transparent',
                  border:'1px solid rgba(201,168,76,0.3)',
                  borderRadius:3, padding:'6px 8px',
                  cursor:'pointer',
                  color:'rgba(220,185,80,0.9)',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  transition:'all 0.2s',
                }}>
                {mobileOpen ? <X size={18}/> : <Menu size={18}/>}
              </button>
            </div>
          )}
        </div>

        {/* bottom sprockets */}
        <div style={{ background:'#100d08', borderTop:'1px solid rgba(201,168,76,0.1)' }}>
          <SprocketStrip count={sprocketCount} />
        </div>
      </nav>

      {/* ════ Mobile slide-out drawer ════ */}
      {mobileOpen && (
        <>
          {/* overlay */}
          <div
            onClick={() => setMobileOpen(false)}
            style={{ position:'fixed', inset:0, zIndex:150, background:'rgba(0,0,0,0.55)' }}
          />

          {/* drawer */}
          <div style={{
            position:'fixed', top:0, right:0, bottom:0, width:230, zIndex:200,
            background:'#0c0b08',
            borderLeft:'1px solid rgba(201,168,76,0.22)',
            display:'flex', flexDirection:'column',
            paddingTop:64,
            animation:'mobileSlide 0.28s ease',
            boxShadow:'-10px 0 40px rgba(0,0,0,0.65)',
          }}>
            {/* drawer header */}
            <div style={{ padding:'10px 18px 12px', borderBottom:'1px solid rgba(201,168,76,0.1)', marginBottom:6 }}>
              {user ? (
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <div style={{ width:28, height:28, borderRadius:'50%', background:'rgba(201,168,76,0.15)', border:'1.5px solid rgba(201,168,76,0.4)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <span style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'0.6rem', color:'#e0b84a' }}>
                      {displayName.slice(0,2).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p style={{ fontFamily:"'Special Elite', monospace", fontSize:'0.72rem', color:'rgba(255,255,255,0.6)', margin:0, lineHeight:1 }}>{displayName}</p>
                    <p style={{ fontFamily:'monospace', fontSize:'0.44rem', color:'rgba(201,168,76,0.35)', margin:'2px 0 0', letterSpacing:'0.15em' }}>FAN MEMBER</p>
                  </div>
                </div>
              ) : (
                <p style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'0.72rem', letterSpacing:'0.25em', color:'rgba(201,168,76,0.45)', margin:0 }}>MENU</p>
              )}
            </div>

            {/* menu items */}
            {[
              { label:'Home',      path:'/',              icon:<Film size={15}/> },
              { label:'Profile',   path:'/profile',       icon:<User size={15}/> },
              ...(!user ? [{ label:'Fan Zone / Register', path:'/fan-zone', icon:<UserPlus size={15}/> }] : []),
              ...(user ? [
                { label:`Alerts${unreadCount > 0 ? ` (${unreadCount})` : ''}`, path:'/notifications', icon:<Bell size={15}/> },
                { label:'Community Chat', path:'/community', icon:<MessageSquare size={15}/> },
                { label:'Events',         path:'/events',    icon:<Calendar size={15}/> },
              ] : []),
            ].map(item => (
              <button key={item.path} onClick={() => go(item.path)} style={{
                display:'flex', alignItems:'center', gap:12,
                padding:'12px 20px',
                background: isAt(item.path) ? 'rgba(201,168,76,0.1)' : 'transparent',
                border:'none',
                borderLeft: isAt(item.path) ? '2px solid #e0b84a' : '2px solid transparent',
                cursor:'pointer',
                color: isAt(item.path) ? '#e0b84a' : 'rgba(255,255,255,0.5)',
                fontFamily:"'Bebas Neue', sans-serif", fontSize:'0.85rem', letterSpacing:'0.2em',
                textTransform:'uppercase', transition:'all 0.15s',
                width:'100%', textAlign:'left',
              }}
                onMouseEnter={e => { e.currentTarget.style.background='rgba(201,168,76,0.07)'; e.currentTarget.style.color='#e0b84a'; }}
                onMouseLeave={e => { e.currentTarget.style.background= isAt(item.path) ? 'rgba(201,168,76,0.1)' : 'transparent'; e.currentTarget.style.color= isAt(item.path) ? '#e0b84a' : 'rgba(255,255,255,0.5)'; }}>
                <span style={{ color:'inherit', opacity:0.85 }}>{item.icon}</span>
                {item.label}
              </button>
            ))}

            {/* logout */}
            {user && (
              <button onClick={handleLogout} style={{
                display:'flex', alignItems:'center', gap:12,
                marginTop:'auto', padding:'13px 20px',
                background:'transparent',
                border:'none', borderTop:'1px solid rgba(201,168,76,0.1)',
                cursor:'pointer', color:'rgba(220,80,60,0.7)',
                fontFamily:"'Bebas Neue', sans-serif", fontSize:'0.85rem', letterSpacing:'0.2em',
                textTransform:'uppercase', width:'100%', textAlign:'left', transition:'color 0.15s',
              }}
                onMouseEnter={e => e.currentTarget.style.color='#ff5e4a'}
                onMouseLeave={e => e.currentTarget.style.color='rgba(220,80,60,0.7)'}>
                <LogOut size={15}/> Logout
              </button>
            )}

            {/* bottom film strip */}
            <div style={{ background:'#100d08', borderTop:'1px solid rgba(201,168,76,0.1)', padding:'4px 0' }}>
              <SprocketStrip count={8} />
            </div>
          </div>
        </>
      )}

      {/* Spacer */}
      <div style={{ height: isMobile ? 58 : 68 }} />
    </>
  );
};

export default FanNavbar;