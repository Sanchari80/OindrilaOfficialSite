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

/* ══ Sprocket strip (top & bottom of nav) ══ */
const SprocketStrip = ({ count = 14 }) => (
  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-around', padding:'0 10px', height:5 }}>
    {Array.from({ length: count }).map((_,i) => (
      <div key={i} style={{ width:8, height:3, background:'#0a0806', border:'1px solid rgba(201,168,76,0.7)', borderRadius:1 }} />
    ))}
  </div>
);

/* ══ NavIcon button ══ */
const NavIcon = ({ icon, label, onClick, active, badge, danger, animBell }) => {
  const [hovered, setHovered] = useState(false);
  const isActive = active || hovered;

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
        background: isActive && !danger ? 'rgba(201,168,76,0.1)' : isActive && danger ? 'rgba(192,57,43,0.12)' : 'transparent',
        border:`1px solid ${isActive && !danger ? 'rgba(201,168,76,0.3)' : isActive && danger ? 'rgba(192,57,43,0.35)' : 'transparent'}`,
        borderRadius:3, transition:'all 0.18s',
        color: danger ? (isActive ? '#e74c3c' : 'rgba(192,57,43,0.55)') : (isActive ? '#c9a84c' : 'rgba(201,168,76,0.45)'),
      }}
    >
      <div style={{ animation: animBell && badge > 0 ? 'ringBell 0.7s ease' : 'none' }}>
        {icon}
      </div>
      <span style={{
        fontFamily:"'Bebas Neue', sans-serif", fontSize:'0.48rem',
        letterSpacing:'0.22em', textTransform:'uppercase', lineHeight:1,
        color: 'inherit', opacity: isActive ? 1 : 0.7,
      }}>{label}</span>

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
  <div style={{ width:1, height:28, background:'rgba(201,168,76,0.12)', margin:'0 2px' }} />
);

/* ══ MAIN NAVBAR ══ */
const FanNavbar = () => {
  const navigate                           = useNavigate();
  const location                           = useLocation();
  const [user, setUser]                   = useState(null);
  const [unreadCount, setUnreadCount]     = useState(0);
  const [bellAnim, setBellAnim]           = useState(false);
  const [mobileOpen, setMobileOpen]       = useState(false);
  const prevNotifCount                    = useRef(0);
  const bellTimer                         = useRef(null);

  /* ── Auth listener ── */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => setUser(u));
    return () => unsub();
  }, []);

  /* ── Unread notifications count (only if logged in) ── */
  useEffect(() => {
    if (!user) { setUnreadCount(0); return; }

    let readIds = new Set();

    // Load fan's readNotifs once
    getDoc(doc(db, 'fans', user.uid)).then(snap => {
      if (snap.exists()) readIds = new Set(snap.data().readNotifs || []);
    });

    const q = query(collection(db, 'updates'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      const total  = snap.docs.length + 1; // +1 for birthday notif
      const unread = snap.docs.filter(d => !readIds.has(d.id)).length + 1; // birthday always unread initially

      // ring bell on new notification
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

  /* ── Don't show on admin page ── */
  if (location.pathname.startsWith('/admin')) return null;

  return (
    <>
      <FontImport />

      {/* ════ NAVBAR ════ */}
      <nav style={{
        position:'fixed', top:0, left:0, right:0, zIndex:100,
        background:'rgba(10,10,8,0.96)',
        backdropFilter:'blur(16px)',
        borderBottom:'1px solid rgba(201,168,76,0.15)',
        boxShadow:'0 4px 30px rgba(0,0,0,0.5)',
        animation:'navSlideDown 0.4s ease',
      }}>
        {/* top sprockets */}
        <div style={{ background:'#0d0d0b', borderBottom:'1px solid rgba(201,168,76,0.08)' }}>
          <SprocketStrip count={18} />
        </div>

        {/* main bar */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'6px 16px', minHeight:48 }}>

          {/* ── LEFT: Logo / Brand ── */}
          <button onClick={() => go('/')} style={{ background:'none', border:'none', cursor:'pointer', display:'flex', alignItems:'center', gap:10, padding:'4px 6px', borderRadius:3, transition:'background 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.background='rgba(201,168,76,0.06)'}
            onMouseLeave={e => e.currentTarget.style.background='transparent'}>
            <div style={{ width:28, height:28, borderRadius:2, background:'rgba(201,168,76,0.1)', border:'1px solid rgba(201,168,76,0.3)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Film size={14} style={{ color:'#c9a84c' }} />
            </div>
            <div style={{ textAlign:'left' }}>
              <p style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'1rem', letterSpacing:'0.2em', color:'#c9a84c', margin:0, lineHeight:1 }}>OINDRILA SEN</p>
              <p style={{ fontFamily:'monospace', fontSize:'0.42rem', letterSpacing:'0.2em', color:'rgba(201,168,76,0.35)', margin:0, textTransform:'uppercase' }}>Official Site</p>
            </div>
          </button>

          {/* ── CENTER: frame number strip ── */}
          <div style={{ display:'none', alignItems:'center', gap:8, fontFamily:'monospace', fontSize:'0.42rem', letterSpacing:'0.2em', color:'rgba(201,168,76,0.2)', textTransform:'uppercase' }}
            className="nav-center">
            <span>◈ FRAME 01</span>
            <span style={{ color:'rgba(201,168,76,0.1)' }}>◆</span>
            <span>{isAt('/') ? 'HOME' : isAt('/profile') ? 'PROFILE' : isAt('/community') ? 'COMMUNITY' : isAt('/notifications') ? 'NOTIFICATIONS' : isAt('/fan-zone') ? 'FAN ZONE' : isAt('/events') ? 'EVENTS' : 'PAGE'}</span>
          </div>

          {/* ── RIGHT: Desktop icons ── */}
          <div style={{ display:'flex', alignItems:'center', gap:2 }}>

            {/* Home — visible to ALL */}
            <NavIcon
              icon={<Film size={16}/>}
              label="Home"
              onClick={() => go('/')}
              active={isAt('/')}
            />

            {/* Profile — visible to ALL */}
            <NavIcon
              icon={<User size={16}/>}
              label="Profile"
              onClick={() => go('/profile')}
              active={isAt('/profile')}
            />

            <NavDivider />

            {/* NOT logged in: show Register */}
            {!user && (
              <NavIcon
                icon={<UserPlus size={16}/>}
                label="Fan Zone"
                onClick={() => go('/fan-zone')}
                active={isAt('/fan-zone')}
              />
            )}

            {/* Logged in: Notifications + Community + Logout */}
            {user && (
              <>
                <NavIcon
                  icon={<Bell size={16}/>}
                  label="Alerts"
                  onClick={() => go('/notifications')}
                  active={isAt('/notifications')}
                  badge={unreadCount}
                  animBell={bellAnim}
                />
                <NavIcon
                  icon={<MessageSquare size={16}/>}
                  label="Community"
                  onClick={() => go('/community')}
                  active={isAt('/community')}
                />
                <NavIcon
                  icon={<Calendar size={16}/>}
                  label="Events"
                  onClick={() => go('/events')}
                  active={isAt('/events')}
                />

                <NavDivider />

                {/* User chip */}
                <div style={{ display:'flex', alignItems:'center', gap:6, padding:'4px 8px', borderRadius:3, background:'rgba(201,168,76,0.05)', border:'1px solid rgba(201,168,76,0.1)' }}>
                  <div style={{ width:20, height:20, borderRadius:'50%', background:'rgba(201,168,76,0.15)', border:'1.5px solid rgba(201,168,76,0.3)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <span style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'0.5rem', color:'#c9a84c' }}>
                      {displayName.slice(0,2).toUpperCase()}
                    </span>
                  </div>
                  <span style={{ fontFamily:"'Special Elite', monospace", fontSize:'0.65rem', color:'rgba(255,255,255,0.45)', maxWidth:70, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                    {displayName}
                  </span>
                </div>

                <NavIcon
                  icon={<LogOut size={15}/>}
                  label="Logout"
                  onClick={handleLogout}
                  danger
                />
              </>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(o => !o)}
              style={{ display:'none', background:'none', border:'1px solid rgba(201,168,76,0.2)', borderRadius:3, padding:'5px 7px', cursor:'pointer', color:'rgba(201,168,76,0.5)', marginLeft:6 }}
              id="nav-hamburger">
              {mobileOpen ? <X size={16}/> : <Menu size={16}/>}
            </button>
          </div>
        </div>

        {/* bottom sprockets */}
        <div style={{ background:'#0d0d0b', borderTop:'1px solid rgba(201,168,76,0.08)' }}>
          <SprocketStrip count={18} />
        </div>
      </nav>

      {/* ── Mobile drawer ── */}
      {mobileOpen && (
        <div style={{
          position:'fixed', top:0, right:0, bottom:0, width:220, zIndex:200,
          background:'#0a0a08', borderLeft:'1px solid rgba(201,168,76,0.2)',
          display:'flex', flexDirection:'column', padding:'70px 0 20px',
          animation:'mobileSlide 0.28s ease',
          boxShadow:'-8px 0 30px rgba(0,0,0,0.6)',
        }}>
          <div style={{ padding:'0 16px 14px', borderBottom:'1px solid rgba(201,168,76,0.1)', marginBottom:10 }}>
            <p style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'0.7rem', letterSpacing:'0.25em', color:'rgba(201,168,76,0.4)', margin:0 }}>MENU</p>
          </div>

          {[
            { label:'Home', path:'/', icon:<Film size={15}/> },
            { label:'Profile', path:'/profile', icon:<User size={15}/> },
            ...(!user ? [{ label:'Fan Zone / Register', path:'/fan-zone', icon:<UserPlus size={15}/> }] : []),
            ...(user ? [
              { label:`Notifications ${unreadCount > 0 ? `(${unreadCount})` : ''}`, path:'/notifications', icon:<Bell size={15}/> },
              { label:'Community Chat', path:'/community', icon:<MessageSquare size={15}/> },
              { label:'Events', path:'/events', icon:<Calendar size={15}/> },
            ] : []),
          ].map(item => (
            <button key={item.path} onClick={() => go(item.path)} style={{
              display:'flex', alignItems:'center', gap:10,
              padding:'11px 20px', background: isAt(item.path) ? 'rgba(201,168,76,0.08)' : 'transparent',
              border:'none', borderLeft: isAt(item.path) ? '2px solid #c9a84c' : '2px solid transparent',
              cursor:'pointer', color: isAt(item.path) ? '#c9a84c' : 'rgba(255,255,255,0.45)',
              fontFamily:"'Bebas Neue', sans-serif", fontSize:'0.8rem', letterSpacing:'0.2em',
              textTransform:'uppercase', transition:'all 0.15s', width:'100%', textAlign:'left',
            }}
              onMouseEnter={e => e.currentTarget.style.background='rgba(201,168,76,0.06)'}
              onMouseLeave={e => e.currentTarget.style.background= isAt(item.path) ? 'rgba(201,168,76,0.08)' : 'transparent'}>
              <span style={{ color:'inherit', opacity:0.7 }}>{item.icon}</span>
              {item.label}
            </button>
          ))}

          {user && (
            <button onClick={handleLogout} style={{
              display:'flex', alignItems:'center', gap:10,
              marginTop:'auto', padding:'11px 20px',
              background:'transparent', border:'none', borderTop:'1px solid rgba(201,168,76,0.1)',
              cursor:'pointer', color:'rgba(192,57,43,0.6)',
              fontFamily:"'Bebas Neue', sans-serif", fontSize:'0.8rem', letterSpacing:'0.2em',
              textTransform:'uppercase', width:'100%', textAlign:'left', transition:'color 0.15s',
            }}
              onMouseEnter={e => e.currentTarget.style.color='#e74c3c'}
              onMouseLeave={e => e.currentTarget.style.color='rgba(192,57,43,0.6)'}>
              <LogOut size={15}/> Logout
            </button>
          )}
        </div>
      )}

      {/* overlay for mobile drawer */}
      {mobileOpen && (
        <div onClick={() => setMobileOpen(false)} style={{ position:'fixed', inset:0, zIndex:150, background:'rgba(0,0,0,0.5)' }} />
      )}

      {/* Spacer so content doesn't hide under fixed navbar */}
      <div style={{ height: 68 }} />

      {/* responsive styles */}
      <style>{`
        @media (max-width: 640px) {
          #nav-hamburger { display: flex !important; }
          .nav-icons-right > *:not(#nav-hamburger) { display: none !important; }
        }
      `}</style>
    </>
  );
};

export default FanNavbar;