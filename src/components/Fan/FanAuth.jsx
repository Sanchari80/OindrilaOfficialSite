import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../../firebase/firebaseConfig';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import toast from 'react-hot-toast';

const FontImport = () => (
  <style>{`@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Special+Elite&display=swap');`}</style>
);

/* ══ Sprocket row ══ */
const SprocketRow = ({ count = 8 }) => (
  <div style={{ display:'flex', justifyContent:'space-around', alignItems:'center', padding:'0 8px' }}>
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} style={{ width:10, height:7, background:'#0a0a08', border:'1px solid rgba(201,168,76,0.25)', borderRadius:1 }} />
    ))}
  </div>
);

/* ══ Film Input ══ */
const FilmInput = ({ label, type='text', value, onChange, placeholder, icon }) => (
  <div>
    <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:6 }}>
      <span style={{ width:6, height:6, borderTop:'1.5px solid rgba(201,168,76,0.5)', borderLeft:'1.5px solid rgba(201,168,76,0.5)', display:'inline-block' }} />
      <label style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'0.62rem', letterSpacing:'0.3em', color:'rgba(201,168,76,0.65)', textTransform:'uppercase' }}>{label}</label>
      <span style={{ width:6, height:6, borderTop:'1.5px solid rgba(201,168,76,0.5)', borderRight:'1.5px solid rgba(201,168,76,0.5)', display:'inline-block' }} />
    </div>
    <div style={{ position:'relative' }}>
      {icon && <span style={{ position:'absolute', left:11, top:'50%', transform:'translateY(-50%)', fontSize:'0.8rem', pointerEvents:'none' }}>{icon}</span>}
      <input
        type={type} value={value} onChange={onChange} placeholder={placeholder}
        style={{
          width:'100%', boxSizing:'border-box',
          padding: icon ? '10px 14px 10px 34px' : '10px 14px',
          background:'rgba(201,168,76,0.04)',
          border:'1px solid rgba(201,168,76,0.2)',
          borderRadius:2, color:'#f2ead8',
          fontFamily:"'Special Elite', monospace",
          fontSize:'0.8rem', letterSpacing:'0.04em',
          outline:'none', transition:'border-color 0.2s',
        }}
        onFocus={e => e.target.style.borderColor='rgba(201,168,76,0.55)'}
        onBlur={e => e.target.style.borderColor='rgba(201,168,76,0.2)'}
      />
    </div>
  </div>
);

/* ══ Film Button ══ */
const FilmButton = ({ onClick, children, loading, danger, secondary }) => (
  <button type="button" onClick={onClick} disabled={loading}
    style={{
      width:'100%', display:'flex', alignItems:'center', justifyContent:'center', gap:8,
      padding:'11px 20px', cursor: loading ? 'wait' : 'pointer',
      fontFamily:"'Bebas Neue', sans-serif", fontSize:'0.82rem', letterSpacing:'0.28em', textTransform:'uppercase',
      background: danger ? 'rgba(192,57,43,0.12)' : secondary ? 'transparent' : loading ? 'rgba(201,168,76,0.4)' : '#c9a84c',
      border: danger ? '1px solid rgba(192,57,43,0.35)' : secondary ? '1px solid rgba(201,168,76,0.25)' : '1px solid #c9a84c',
      color: danger ? '#e74c3c' : secondary ? 'rgba(201,168,76,0.6)' : '#0a0a08',
      borderRadius:2, transition:'all 0.2s', opacity: loading ? 0.75 : 1,
    }}
    onMouseEnter={e => {
      if (!loading && !danger && !secondary) e.currentTarget.style.background='#e8c97a';
      if (secondary) { e.currentTarget.style.borderColor='rgba(201,168,76,0.5)'; e.currentTarget.style.color='#c9a84c'; }
    }}
    onMouseLeave={e => {
      if (!loading && !danger && !secondary) e.currentTarget.style.background='#c9a84c';
      if (secondary) { e.currentTarget.style.borderColor='rgba(201,168,76,0.25)'; e.currentTarget.style.color='rgba(201,168,76,0.6)'; }
    }}
  >
    {loading ? (
      <>
        <style>{`@keyframes authSpin { to { transform:rotate(360deg); } }`}</style>
        <svg width="13" height="13" viewBox="0 0 18 18" style={{ animation:'authSpin 0.9s linear infinite' }}>
          <circle cx="9" cy="9" r="7" stroke="rgba(0,0,0,0.25)" strokeWidth="2.5" fill="none"/>
          <path d="M9 2 A7 7 0 0 1 16 9" stroke="#0a0a08" strokeWidth="2.5" fill="none"/>
        </svg>
        Processing...
      </>
    ) : children}
  </button>
);

/* ══ Forgot Password View ══ */
const ForgotPasswordView = ({ onBack }) => {
  const [email,   setEmail]   = useState('');
  const [loading, setLoading] = useState(false);
  const [sent,    setSent]    = useState(false);

  const handleReset = async () => {
    if (!email.trim()) return toast.error('Email plz!');
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setSent(true);
    } catch (err) {
      const msg =
        err.code === 'auth/user-not-found'  ? 'Ei email e kono account nei!' :
        err.code === 'auth/invalid-email'   ? 'Valid email dao!' :
        'Somossa hoyeche, ektu por try koro!';
      toast.error(msg);
    } finally { setLoading(false); }
  };

  return (
    <div style={{ padding:'26px 24px 22px', display:'flex', flexDirection:'column', gap:16 }}>

      {!sent ? (
        <>
          {/* info text */}
          <div style={{ textAlign:'center', padding:'12px 10px', background:'rgba(201,168,76,0.05)', border:'1px solid rgba(201,168,76,0.15)', borderRadius:3 }}>
            <p style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'0.75rem', letterSpacing:'0.2em', color:'rgba(201,168,76,0.6)', margin:'0 0 5px' }}>PASSWORD RESET</p>
            <p style={{ fontFamily:"'Special Elite', monospace", fontSize:'0.68rem', color:'rgba(255,255,255,0.35)', lineHeight:1.5, margin:0 }}>
              Provide your registered email address. A password reset link will be sent to your inbox.
            </p>
          </div>

          <FilmInput
            label="Registered Email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="email@example.com"
            icon="✉️"
          />

          <div style={{ paddingTop:4 }}>
            <FilmButton loading={loading} onClick={handleReset}>
              📧 Reset Link Pathao
            </FilmButton>
          </div>

          <button onClick={onBack} style={{
            background:'none', border:'none', cursor:'pointer',
            fontFamily:'monospace', fontSize:'0.54rem', letterSpacing:'0.12em',
            color:'rgba(201,168,76,0.35)', textAlign:'center',
            transition:'color 0.2s', padding:'4px',
          }}
            onMouseEnter={e => e.currentTarget.style.color='rgba(201,168,76,0.65)'}
            onMouseLeave={e => e.currentTarget.style.color='rgba(201,168,76,0.35)'}
          >
            ← Login এ ফিরে যাও
          </button>
        </>
      ) : (
        /* ── Success state ── */
        <div style={{ textAlign:'center', padding:'16px 8px' }}>
          <div style={{ fontSize:'2.5rem', marginBottom:12 }}>📬</div>
          <p style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'1rem', letterSpacing:'0.2em', color:'#c9a84c', margin:'0 0 8px' }}>
            EMAIL Sent!
          </p>
          <p style={{ fontFamily:"'Special Elite', monospace", fontSize:'0.72rem', color:'rgba(255,255,255,0.45)', lineHeight:1.6, margin:'0 0 6px' }}>
            <span style={{ color:'rgba(201,168,76,0.7)' }}>{email}</span> — এই address এ একটা password reset link pathano hoyeche.
          </p>
          <p style={{ fontFamily:'monospace', fontSize:'0.52rem', color:'rgba(255,255,255,0.25)', lineHeight:1.5, margin:'0 0 20px' }}>
            Check your inbox & spam folder. Click the link to reset password.
          </p>

          <FilmButton secondary onClick={onBack}>← Login</FilmButton>
        </div>
      )}
    </div>
  );
};

/* ══════════════════════════════
   MAIN COMPONENT
══════════════════════════════ */
const FanAuth = ({ onAuthSuccess }) => {
  const navigate                           = useNavigate();
  const [mode, setMode]               = useState('login'); // 'login' | 'register' | 'forgot'
  const [email, setEmail]             = useState('');
  const [password, setPassword]       = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading]         = useState(false);
  const [user, setUser]               = useState(null);
  const [checking, setChecking]       = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u) {
        const snap = await getDoc(doc(db, 'fans', u.uid));
        setUser({ ...u, fanData: snap.exists() ? snap.data() : {} });
        if (onAuthSuccess) onAuthSuccess(u);
        navigate('/community');
      } else {
        setUser(null);
      }
      setChecking(false);
    });
    return () => unsub();
  }, []);

  const handleRegister = async () => {
    if (!displayName.trim()) return toast.error('Display name lagbe!');
    if (!email.trim())       return toast.error('Email lagbe!');
    if (password.length < 6) return toast.error('Password kom se kom 6 character hote hobe!');
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      await updateProfile(cred.user, { displayName: displayName.trim() });
      await setDoc(doc(db, 'fans', cred.user.uid), {
        uid: cred.user.uid,
        displayName: displayName.trim(),
        email: email.toLowerCase().trim(),
        joinedAt: serverTimestamp(),
        role: 'fan',
      });
      toast.success(`Welcome dear, ${displayName.trim()}! 🎬`);
    } catch (err) {
      const msg =
        err.code === 'auth/email-already-in-use' ? 'Ei email diye already account ache!' :
        err.code === 'auth/invalid-email'         ? 'Valid email dao!' :
        err.code === 'auth/weak-password'         ? 'Password aro strong hote hobe!' :
        'Registration e somossa hoyeche!';
      toast.error(msg);
    } finally { setLoading(false); }
  };

  const handleLogin = async () => {
    if (!email.trim() || !password) return toast.error('Email & password dao!');
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      toast.success('Welcome back! 🎞️');
    } catch (err) {
      const msg =
        err.code === 'auth/user-not-found'     ? 'Ei email e kono account nei!' :
        err.code === 'auth/wrong-password'     ? 'Password ভুল!' :
        err.code === 'auth/invalid-credential' ? 'Email ba password ভুল!' :
        err.code === 'auth/too-many-requests'  ? 'Onek baar try koreche, ektu por try koro!' :
        'Login e somossa hoyeche!';
      toast.error(msg);
    } finally { setLoading(false); }
  };

  const handleSignOut = async () => {
    await signOut(auth);
    toast.success('Logged out!');
  };

  const switchMode = (m) => {
    setMode(m);
    setEmail(''); setPassword(''); setDisplayName('');
  };

  /* ── tab title ── */
  const tabTitle = mode === 'forgot' ? '🔑 Password Reset' : mode === 'login' ? '🎞️ Login' : '🎬 Register';

  /* ── Loading ── */
  if (checking) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#0a0a08' }}>
      <FontImport />
      <p style={{ fontFamily:"'Bebas Neue', sans-serif", color:'rgba(201,168,76,0.35)', letterSpacing:'0.5em', fontSize:'0.75rem' }}>LOADING...</p>
    </div>
  );

  /* ── Logged in view ── */
  if (user) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#0a0a08', padding:20 }}>
      <FontImport />
      <div style={{ width:'100%', maxWidth:340 }}>
        <div style={{ textAlign:'center', marginBottom:24 }}>
          <h1 style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'2rem', letterSpacing:'0.15em', color:'#f2ead8' }}>
            OINDRILA <span style={{ color:'#c9a84c' }}>SEN</span>
          </h1>
        </div>
        <div style={{ border:'1px solid rgba(201,168,76,0.4)', borderRadius:4, overflow:'hidden', background:'#0f0f0c', boxShadow:'0 20px 50px rgba(0,0,0,0.7)' }}>
          <div style={{ background:'#141410', padding:'7px 0', borderBottom:'1px solid rgba(201,168,76,0.15)' }}><SprocketRow /></div>
          <div style={{ padding:'30px 26px', textAlign:'center' }}>
            <div style={{ width:64, height:64, borderRadius:'50%', background:'rgba(201,168,76,0.12)', border:'2px solid rgba(201,168,76,0.35)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 14px', fontSize:'1.8rem' }}>🎬</div>
            <h2 style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'1.4rem', letterSpacing:'0.1em', color:'#e8c97a', marginBottom:4 }}>{user.displayName || 'Fan'}</h2>
            <p style={{ fontFamily:'monospace', fontSize:'0.52rem', letterSpacing:'0.2em', color:'rgba(201,168,76,0.35)', textTransform:'uppercase', marginBottom:6 }}>{user.email}</p>
            <p style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'0.7rem', letterSpacing:'0.25em', color:'rgba(201,168,76,0.5)', marginBottom:24 }}>✦ VERIFIED FAN ✦</p>
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              <a href="/community" style={{ display:'block', padding:'11px', textAlign:'center', textDecoration:'none', fontFamily:"'Bebas Neue', sans-serif", fontSize:'0.82rem', letterSpacing:'0.25em', background:'#c9a84c', color:'#0a0a08', borderRadius:2, transition:'background 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.background='#e8c97a'}
                onMouseLeave={e => e.currentTarget.style.background='#c9a84c'}
              >🎭 Community তে যাও</a>
              <FilmButton onClick={handleSignOut} danger>Sign Out</FilmButton>
            </div>
          </div>
          <div style={{ padding:'4px 16px', background:'#1a1a15', borderTop:'1px solid rgba(201,168,76,0.1)', fontFamily:'monospace', fontSize:'0.46rem', letterSpacing:'0.2em', color:'rgba(201,168,76,0.3)', display:'flex', gap:8 }}>
            <span style={{ color:'#c9a84c' }}>FAN PORTAL</span><span>◆</span><span>OINDRILA SEN</span><span>◆</span><span>SKT</span>
          </div>
          <div style={{ background:'#141410', padding:'7px 0', borderTop:'1px solid rgba(201,168,76,0.15)' }}><SprocketRow /></div>
        </div>
        <div style={{ textAlign:'center', marginTop:14 }}>
          <a href="/" style={{ fontFamily:'monospace', fontSize:'0.52rem', letterSpacing:'0.14em', color:'rgba(201,168,76,0.3)', textDecoration:'none' }}
            onMouseEnter={e => e.currentTarget.style.color='rgba(201,168,76,0.6)'}
            onMouseLeave={e => e.currentTarget.style.color='rgba(201,168,76,0.3)'}
          >← Back to home</a>
        </div>
      </div>
    </div>
  );

  /* ── Auth form ── */
  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#0a0a08', padding:20 }}>
      <FontImport />
      <div style={{ width:'100%', maxWidth:390, position:'relative', zIndex:1 }}>

        {/* Header */}
        <div style={{ textAlign:'center', marginBottom:26 }}>
          <h1 style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'clamp(1.8rem,6vw,2.8rem)', letterSpacing:'0.15em', color:'#f2ead8', lineHeight:1, marginBottom:8 }}>
            OINDRILA <span style={{ color:'#c9a84c' }}>SEN</span>
          </h1>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:10 }}>
            <div style={{ height:1, width:40, background:'linear-gradient(to right, transparent, rgba(201,168,76,0.4))' }} />
            <p style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'0.58rem', letterSpacing:'0.45em', color:'rgba(201,168,76,0.45)', textTransform:'uppercase' }}>Fan Community</p>
            <div style={{ height:1, width:40, background:'linear-gradient(to left, transparent, rgba(201,168,76,0.4))' }} />
          </div>
        </div>

        {/* Card */}
        <div style={{ border:'1px solid rgba(201,168,76,0.35)', borderRadius:4, overflow:'hidden', background:'#0f0f0c', boxShadow:'0 24px 60px rgba(0,0,0,0.75), 0 0 50px rgba(201,168,76,0.04)' }}>

          {/* Top sprockets */}
          <div style={{ background:'#141410', padding:'7px 0', borderBottom:'1px solid rgba(201,168,76,0.15)' }}><SprocketRow count={9} /></div>

          {/* Tab switcher — forgot mode এ শুধু title দেখাবে */}
          {mode !== 'forgot' ? (
            <div style={{ display:'flex' }}>
              {[
                { key:'login',    label:'🎞️  Login'    },
                { key:'register', label:'🎬  Register' },
              ].map(({ key, label }) => (
                <button key={key} onClick={() => switchMode(key)} style={{
                  flex:1, padding:'13px 8px', cursor:'pointer',
                  fontFamily:"'Bebas Neue', sans-serif", fontSize:'0.78rem', letterSpacing:'0.22em',
                  background: mode === key ? 'rgba(201,168,76,0.08)' : 'transparent',
                  borderBottom: mode === key ? '2px solid #c9a84c' : '2px solid rgba(201,168,76,0.1)',
                  borderTop:'none', borderLeft:'none', borderRight: key==='login' ? '1px solid rgba(201,168,76,0.1)' : 'none',
                  color: mode === key ? '#c9a84c' : 'rgba(201,168,76,0.28)',
                  transition:'all 0.2s',
                }}>{label}</button>
              ))}
            </div>
          ) : (
            <div style={{ padding:'11px 20px', background:'rgba(201,168,76,0.06)', borderBottom:'2px solid #c9a84c' }}>
              <p style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'0.78rem', letterSpacing:'0.25em', color:'#c9a84c', margin:0, textAlign:'center' }}>🔑 PASSWORD RESET</p>
            </div>
          )}

          {/* Form body */}
          {mode === 'forgot' ? (
            <ForgotPasswordView onBack={() => switchMode('login')} />
          ) : (
            <div style={{ padding:'26px 24px 22px', display:'flex', flexDirection:'column', gap:16 }}>
              {mode === 'register' && (
                <FilmInput label="Display Name" value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Tomar naam..." icon="👤" />
              )}
              <FilmInput label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="email@example.com" icon="✉️" />
              <FilmInput label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" icon="🔒" />

              {/* Forgot password link — শুধু login mode এ */}
              {mode === 'login' && (
                <div style={{ textAlign:'right', marginTop:-8 }}>
                  <button onClick={() => switchMode('forgot')} style={{
                    background:'none', border:'none', cursor:'pointer',
                    fontFamily:'monospace', fontSize:'0.52rem', letterSpacing:'0.1em',
                    color:'rgba(201,168,76,0.4)', transition:'color 0.2s', padding:0,
                  }}
                    onMouseEnter={e => e.currentTarget.style.color='rgba(201,168,76,0.75)'}
                    onMouseLeave={e => e.currentTarget.style.color='rgba(201,168,76,0.4)'}
                  >
                    🔑 ohww shit! Forgot password??
                  </button>
                </div>
              )}

              <div style={{ paddingTop: mode === 'login' ? 2 : 6 }}>
                <FilmButton loading={loading} onClick={mode === 'login' ? handleLogin : handleRegister}>
                  {mode === 'login' ? '🎬 Login' : '✨ Register'}
                </FilmButton>
              </div>

              <p style={{ textAlign:'center', fontFamily:'monospace', fontSize:'0.56rem', color:'rgba(255,255,255,0.2)', letterSpacing:'0.08em', margin:0 }}>
                {mode === 'login' ? 'No Account?' : 'Already registered?'}{' '}
                <span onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}
                  style={{ color:'#c9a84c', cursor:'pointer', textDecoration:'underline' }}>
                  {mode === 'login' ? 'Register' : 'Login'}
                </span>
              </p>
            </div>
          )}

          {/* Frame strip */}
          <div style={{ padding:'4px 16px', background:'#1a1a15', borderTop:'1px solid rgba(201,168,76,0.1)', borderBottom:'1px solid rgba(201,168,76,0.1)', fontFamily:'monospace', fontSize:'0.46rem', letterSpacing:'0.22em', color:'rgba(201,168,76,0.28)', display:'flex', gap:8 }}>
            <span style={{ color:'#c9a84c' }}>FAN PORTAL</span><span>◆</span><span>OINDRILA SEN</span><span>◆</span><span>SKT</span>
          </div>

          {/* Bottom sprockets */}
          <div style={{ background:'#141410', padding:'7px 0', borderTop:'1px solid rgba(201,168,76,0.15)' }}><SprocketRow count={9} /></div>
        </div>

        {/* Back link */}
        <div style={{ textAlign:'center', marginTop:14 }}>
          <a href="/" style={{ fontFamily:'monospace', fontSize:'0.52rem', letterSpacing:'0.14em', color:'rgba(201,168,76,0.28)', textDecoration:'none' }}
            onMouseEnter={e => e.currentTarget.style.color='rgba(201,168,76,0.6)'}
            onMouseLeave={e => e.currentTarget.style.color='rgba(201,168,76,0.28)'}
          >← Back to home</a>
        </div>
      </div>
    </div>
  );
};

export default FanAuth;