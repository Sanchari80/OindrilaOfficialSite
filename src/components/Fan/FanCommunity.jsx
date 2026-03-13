import React, { useState, useEffect, useRef, useCallback } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../../firebase/firebaseConfig';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import { LogOut, Send, Image as ImageIcon, Users, X, Upload } from 'lucide-react';

/* ══ CONFIG ══ */
const SOCKET_URL    = 'http://localhost:4000'; // production e server URL
const CLOUD_NAME    = 'danbshghf';
const UPLOAD_PRESET = 'danbshghf';

const FontImport = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Special+Elite&display=swap');
    @keyframes fadeInUp { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
    @keyframes pulse { 0%,100% { opacity:0.4; } 50% { opacity:1; } }
    @keyframes spin { to { transform: rotate(360deg); } }
    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-track { background: #0a0a08; }
    ::-webkit-scrollbar-thumb { background: rgba(201,168,76,0.3); border-radius: 2px; }
  `}</style>
);

/* ══ Sprockets ══ */
const SprocketRow = ({ count = 8 }) => (
  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-around', padding:'0 8px' }}>
    {Array.from({ length: count }).map((_,i) => (
      <div key={i} style={{ width:11, height:7, background:'#0a0a08', border:'1px solid rgba(201,168,76,0.2)', borderRadius:2 }} />
    ))}
  </div>
);

/* ══ Avatar circle ══ */
const Avatar = ({ name, size = 32 }) => {
  const initials = name?.slice(0,2).toUpperCase() || '??';
  const colors   = ['#c9a84c','#e87c4e','#5b8de8','#4ec9a8','#c94e8d'];
  const color    = colors[name?.charCodeAt(0) % colors.length] || '#c9a84c';
  return (
    <div style={{ width:size, height:size, borderRadius:'50%', background:`${color}22`, border:`1.5px solid ${color}55`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
      <span style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize: size * 0.36, color, letterSpacing:'0.05em' }}>{initials}</span>
    </div>
  );
};

/* ══ Single message bubble ══ */
const MessageBubble = ({ msg, isOwn }) => {
  if (msg.type === 'system') return (
    <div style={{ textAlign:'center', padding:'4px 0', animation:'fadeInUp 0.3s ease' }}>
      <span style={{ fontFamily:'monospace', fontSize:'0.55rem', letterSpacing:'0.15em', color:'rgba(201,168,76,0.35)', background:'rgba(201,168,76,0.05)', padding:'2px 10px', borderRadius:10, border:'1px solid rgba(201,168,76,0.1)' }}>
        {msg.text}
      </span>
    </div>
  );

  const time = new Date(msg.timestamp).toLocaleTimeString('en-BD', { hour:'2-digit', minute:'2-digit' });

  return (
    <div style={{ display:'flex', flexDirection: isOwn ? 'row-reverse' : 'row', gap:8, alignItems:'flex-end', animation:'fadeInUp 0.3s ease', maxWidth:'85%', alignSelf: isOwn ? 'flex-end' : 'flex-start' }}>
      {!isOwn && <Avatar name={msg.name} size={28} />}

      <div style={{ maxWidth:'100%' }}>
        {!isOwn && (
          <p style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'0.65rem', letterSpacing:'0.15em', color:'rgba(201,168,76,0.55)', marginBottom:3, marginLeft:4 }}>
            {msg.name}
          </p>
        )}

        {/* bubble */}
        <div style={{
          position:'relative', borderRadius: isOwn ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
          overflow:'hidden', minWidth:60,
          border:`1px solid ${isOwn ? 'rgba(201,168,76,0.35)' : 'rgba(255,255,255,0.08)'}`,
          boxShadow: isOwn ? '0 2px 12px rgba(201,168,76,0.08)' : '0 2px 12px rgba(0,0,0,0.3)',
        }}>
          {/* custom bg image */}
          {msg.bgUrl && (
            <img src={msg.bgUrl} alt="bg" style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', opacity:0.25, pointerEvents:'none' }} />
          )}
          <div style={{ position:'relative', padding:'8px 12px', background: isOwn ? 'rgba(201,168,76,0.12)' : 'rgba(255,255,255,0.08)' }}>
            <p style={{ fontFamily:"'Special Elite', monospace", fontSize:'0.82rem', color:'#f2ead8', lineHeight:1.45, margin:0, wordBreak:'break-word' }}>
              {msg.text}
            </p>
            <span style={{ display:'block', textAlign:'right', fontFamily:'monospace', fontSize:'0.48rem', color:'rgba(255,255,255,0.5)', marginTop:4, letterSpacing:'0.1em' }}>
              {time}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ══ Online users panel ══ */
const OnlinePanel = ({ users, onClose }) => (
  <div style={{ position:'absolute', top:0, right:0, bottom:0, width:200, background:'#1a1a12', borderLeft:'1px solid rgba(201,168,76,0.15)', zIndex:10, display:'flex', flexDirection:'column' }}>
    <div style={{ padding:'12px 14px', borderBottom:'1px solid rgba(201,168,76,0.1)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
      <span style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'0.75rem', letterSpacing:'0.25em', color:'rgba(201,168,76,0.6)' }}>ONLINE ({users.length})</span>
      <button onClick={onClose} style={{ background:'none', border:'none', color:'rgba(201,168,76,0.4)', cursor:'pointer', padding:2 }}><X size={14}/></button>
    </div>
    <div style={{ flex:1, overflowY:'auto', padding:'8px' }}>
      {users.map((u, i) => (
        <div key={i} style={{ display:'flex', alignItems:'center', gap:8, padding:'6px 4px', borderBottom:'1px solid rgba(255,255,255,0.03)' }}>
          <Avatar name={u.name} size={26} />
          <div>
            <p style={{ fontFamily:"'Special Elite', monospace", fontSize:'0.7rem', color:'#f2ead8', margin:0, lineHeight:1 }}>{u.name}</p>
            <div style={{ display:'flex', alignItems:'center', gap:4, marginTop:2 }}>
              <div style={{ width:5, height:5, borderRadius:'50%', background:'#4ec94e', animation:'pulse 2s infinite' }} />
              <span style={{ fontFamily:'monospace', fontSize:'0.45rem', color:'rgba(255,255,255,0.5)', letterSpacing:'0.1em' }}>online</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

/* ══ BG Picker Modal ══ */
const BgPickerModal = ({ onSelect, onClose, uploading, onUpload }) => {
  const PRESETS = [
    { label:'Dark Film', value: null, style: { background:'#0a0a08' } },
    { label:'Golden',    value: 'linear-gradient(135deg,#2a1f08,#1a1208)', style: { background:'linear-gradient(135deg,#2a1f08,#1a1208)' } },
    { label:'Deep Blue', value: 'linear-gradient(135deg,#081828,#061018)', style: { background:'linear-gradient(135deg,#081828,#061018)' } },
    { label:'Rose',      value: 'linear-gradient(135deg,#280818,#180810)', style: { background:'linear-gradient(135deg,#280818,#180810)' } },
  ];

  return (
    <div style={{ position:'fixed', inset:0, zIndex:100, background:'rgba(0,0,0,0.8)', display:'flex', alignItems:'center', justifyContent:'center', padding:20 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background:'#1a1a12', border:'1px solid rgba(201,168,76,0.4)', borderRadius:4, padding:20, width:'100%', maxWidth:320 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
          <span style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'0.9rem', letterSpacing:'0.25em', color:'#c9a84c' }}>CHAT BACKGROUND</span>
          <button onClick={onClose} style={{ background:'none', border:'none', color:'rgba(201,168,76,0.4)', cursor:'pointer' }}><X size={16}/></button>
        </div>

        {/* Preset swatches */}
        <div style={{ display:'flex', gap:8, marginBottom:16, flexWrap:'wrap' }}>
          {PRESETS.map(p => (
            <div key={p.label} onClick={() => onSelect(p.value)}
              style={{ width:60, height:44, borderRadius:4, cursor:'pointer', border:'2px solid rgba(201,168,76,0.2)', overflow:'hidden', transition:'border-color 0.2s', ...p.style }}
              onMouseEnter={e => e.currentTarget.style.borderColor='#c9a84c'}
              onMouseLeave={e => e.currentTarget.style.borderColor='rgba(201,168,76,0.2)'}
            >
              <span style={{ display:'block', fontFamily:'monospace', fontSize:'0.45rem', color:'rgba(255,255,255,0.4)', padding:'2px 4px', background:'rgba(0,0,0,0.4)', letterSpacing:'0.05em' }}>{p.label}</span>
            </div>
          ))}
        </div>

        <div style={{ height:1, background:'rgba(201,168,76,0.12)', marginBottom:14 }} />

        {/* Upload custom bg */}
        <label style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, padding:'10px', border:'2px dashed rgba(201,168,76,0.25)', borderRadius:4, cursor:'pointer', transition:'border-color 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.borderColor='rgba(201,168,76,0.5)'}
          onMouseLeave={e => e.currentTarget.style.borderColor='rgba(201,168,76,0.25)'}>
          {uploading
            ? <div style={{ width:16, height:16, border:'2px solid #c9a84c', borderTopColor:'transparent', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
            : <Upload size={14} style={{ color:'rgba(201,168,76,0.5)' }} />
          }
          <span style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'0.7rem', letterSpacing:'0.2em', color:'rgba(201,168,76,0.5)' }}>
            {uploading ? 'UPLOADING...' : 'UPLOAD YOUR IMAGE'}
          </span>
          <input type="file" accept="image/*" className="hidden" style={{ display:'none' }} onChange={onUpload} disabled={uploading} />
        </label>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════
   MAIN FanCommunity Component
══════════════════════════════════════ */
const FanCommunity = () => {
  const navigate               = useNavigate();
  const [user, setUser]        = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [messages, setMessages]       = useState([]);
  const [text, setText]               = useState('');
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingName, setTypingName]   = useState(null);
  const [showOnline, setShowOnline]   = useState(false);
  const [showBgPicker, setShowBgPicker] = useState(false);
  const [chatBg, setChatBg]           = useState(null);    // url or gradient string or null
  const [msgBg, setMsgBg]             = useState(null);    // per-message bg url
  const [bgUploading, setBgUploading] = useState(false);
  const [connected, setConnected]     = useState(false);

  const socketRef  = useRef(null);
  const bottomRef  = useRef(null);
  const typingTimer = useRef(null);

  /* ── Auth gate ── */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthLoading(false);
      if (!u) navigate('/fan-zone');
    });
    return () => unsub();
  }, [navigate]);

  /* ── Socket setup ── */
  useEffect(() => {
    if (!user) return;

    const socket = io(SOCKET_URL, { transports:['websocket','polling'] });
    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      socket.emit('fan:join', {
        uid: user.uid,
        name: user.displayName || user.email?.split('@')[0] || 'Fan',
        avatar: null,
      });
    });

    socket.on('disconnect', () => setConnected(false));

    socket.on('messages:history', (hist) => {
      setMessages(hist);
    });

    socket.on('chat:message', (msg) => {
      setMessages(prev => [...prev, msg]);
    });

    socket.on('users:online', (users) => {
      setOnlineUsers(users);
    });

    socket.on('chat:typing', ({ name }) => {
      if (name !== user.displayName) {
        setTypingName(name);
        clearTimeout(typingTimer.current);
        typingTimer.current = setTimeout(() => setTypingName(null), 2500);
      }
    });

    socket.on('chat:stopTyping', () => setTypingName(null));

    return () => {
      socket.disconnect();
      clearTimeout(typingTimer.current);
    };
  }, [user]);

  /* ── Auto scroll ── */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior:'smooth' });
  }, [messages]);

  /* ── Send message ── */
  const sendMessage = useCallback(() => {
    if (!text.trim() || !socketRef.current) return;
    socketRef.current.emit('chat:send', {
      uid: user.uid,
      name: user.displayName || user.email?.split('@')[0] || 'Fan',
      avatar: null,
      text: text.trim(),
      bgUrl: msgBg || null,
    });
    setText('');
    socketRef.current.emit('chat:stopTyping');
  }, [text, user, msgBg]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  /* ── Typing indicator ── */
  const handleTextChange = (e) => {
    setText(e.target.value);
    if (!socketRef.current) return;
    socketRef.current.emit('chat:typing', { name: user?.displayName });
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => socketRef.current?.emit('chat:stopTyping'), 1500);
  };

  /* ── Upload BG to Cloudinary ── */
  const handleBgUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBgUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('upload_preset', UPLOAD_PRESET);
      const res  = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, { method:'POST', body:fd });
      const data = await res.json();
      if (!data.secure_url) throw new Error('Upload failed');
      setChatBg(data.secure_url);
      setMsgBg(data.secure_url);
      toast.success('Background set! 🎨');
      setShowBgPicker(false);
    } catch { toast.error('Upload failed!'); }
    finally { setBgUploading(false); }
  };

  const handlePresetSelect = (value) => {
    setChatBg(value);
    setMsgBg(null); // presets don't show in messages
    setShowBgPicker(false);
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/fan-zone');
  };

  /* ── Loading ── */
  if (authLoading) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#0a0a08' }}>
      <div style={{ width:32, height:32, border:'2px solid #c9a84c', borderTopColor:'transparent', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
    </div>
  );

  const displayName = user?.displayName || user?.email?.split('@')[0] || 'Fan';

  /* ── chat area background style ── */
  const bgStyle = chatBg
    ? chatBg.startsWith('http')
      ? { backgroundImage:`url(${chatBg})`, backgroundSize:'cover', backgroundPosition:'center' }
      : { background: chatBg }
    : { background:'#12120e' };

  return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', background:'#12120e', color:'#f2ead8', position:'relative', zIndex:5, isolation:'isolate' }}>
      <FontImport />

      {/* ══ HEADER ══ */}
      <div style={{ background:'#1a1a12', borderBottom:'1px solid rgba(201,168,76,0.15)', flexShrink:0 }}>
        <div style={{ padding:'6px 0', borderBottom:'1px solid rgba(201,168,76,0.1)' }}>
          <SprocketRow count={12} />
        </div>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 16px' }}>
          {/* title */}
          <div>
            <h1 style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'1.3rem', letterSpacing:'0.2em', color:'#c9a84c', margin:0, lineHeight:1 }}>
              🎬 FAN COMMUNITY
            </h1>
            <p style={{ fontFamily:'monospace', fontSize:'0.5rem', letterSpacing:'0.2em', color:'rgba(201,168,76,0.35)', margin:'3px 0 0', textTransform:'uppercase' }}>
              Oindrila Sen · Official Fan Zone
            </p>
          </div>

          {/* right controls */}
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            {/* connection dot */}
            <div style={{ display:'flex', alignItems:'center', gap:4 }}>
              <div style={{ width:6, height:6, borderRadius:'50%', background: connected ? '#4ec94e' : '#e74c3c', animation: connected ? 'pulse 2s infinite' : 'none' }} />
              <span style={{ fontFamily:'monospace', fontSize:'0.5rem', color:'rgba(255,255,255,0.5)', letterSpacing:'0.1em' }}>
                {connected ? 'LIVE' : 'OFFLINE'}
              </span>
            </div>

            {/* online users button */}
            <button onClick={() => setShowOnline(s => !s)}
              style={{ display:'flex', alignItems:'center', gap:5, padding:'5px 10px', background:'rgba(201,168,76,0.08)', border:'1px solid rgba(201,168,76,0.2)', borderRadius:3, cursor:'pointer', color:'rgba(201,168,76,0.7)', transition:'all 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.background='rgba(201,168,76,0.15)'}
              onMouseLeave={e => e.currentTarget.style.background='rgba(201,168,76,0.08)'}>
              <Users size={13} />
              <span style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'0.65rem', letterSpacing:'0.2em' }}>{onlineUsers.length}</span>
            </button>

            {/* bg picker */}
            <button onClick={() => setShowBgPicker(true)}
              style={{ display:'flex', alignItems:'center', gap:5, padding:'5px 10px', background:'rgba(201,168,76,0.08)', border:'1px solid rgba(201,168,76,0.2)', borderRadius:3, cursor:'pointer', color:'rgba(201,168,76,0.7)', transition:'all 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.background='rgba(201,168,76,0.15)'}
              onMouseLeave={e => e.currentTarget.style.background='rgba(201,168,76,0.08)'}>
              <ImageIcon size={13} />
              <span style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'0.65rem', letterSpacing:'0.2em' }}>BG</span>
            </button>

            {/* user + logout */}
            <div style={{ display:'flex', alignItems:'center', gap:6 }}>
              <Avatar name={displayName} size={28} />
              <span style={{ fontFamily:"'Special Elite', monospace", fontSize:'0.72rem', color:'rgba(255,255,255,0.6)', maxWidth:80, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{displayName}</span>
              <button onClick={handleLogout} title="Logout"
                style={{ background:'none', border:'1px solid rgba(192,57,43,0.3)', borderRadius:3, cursor:'pointer', color:'#e74c3c', padding:'4px 6px', display:'flex', alignItems:'center', transition:'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.background='#c0392b'; e.currentTarget.style.color='#fff'; }}
                onMouseLeave={e => { e.currentTarget.style.background='none'; e.currentTarget.style.color='#e74c3c'; }}>
                <LogOut size={13} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ══ CHAT AREA ══ */}
      <div style={{ flex:1, position:'relative', overflow:'hidden' }}>

        {/* Messages scroll area */}
        <div style={{ position:'absolute', inset:0, overflowY:'auto', padding:'16px', display:'flex', flexDirection:'column', gap:10, ...bgStyle }}>
          {/* bg overlay for readability */}
          {chatBg && <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.3)', pointerEvents:'none', zIndex:0 }} />}
          <div style={{ position:'relative', zIndex:1, display:'flex', flexDirection:'column', gap:10 }}>
            {messages.length === 0 && (
              <div style={{ textAlign:'center', marginTop:60 }}>
                <div style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'1.5rem', letterSpacing:'0.2em', color:'rgba(201,168,76,0.2)' }}>🎬</div>
                <p style={{ fontFamily:'monospace', fontSize:'0.6rem', color:'rgba(255,255,255,0.4)', letterSpacing:'0.15em' }}>Be the first to say something!</p>
              </div>
            )}
            {messages.map(msg => (
              <MessageBubble key={msg.id} msg={msg} isOwn={msg.uid === user?.uid} />
            ))}
            {/* Typing indicator */}
            {typingName && (
              <div style={{ display:'flex', alignItems:'center', gap:6, animation:'fadeInUp 0.2s ease' }}>
                <div style={{ display:'flex', gap:3, padding:'6px 10px', background:'rgba(255,255,255,0.05)', borderRadius:10, border:'1px solid rgba(255,255,255,0.06)' }}>
                  {[0,1,2].map(i => <div key={i} style={{ width:5, height:5, borderRadius:'50%', background:'rgba(201,168,76,0.5)', animation:`pulse 1.2s ${i*0.2}s infinite` }} />)}
                </div>
                <span style={{ fontFamily:'monospace', fontSize:'0.5rem', color:'rgba(255,255,255,0.5)', letterSpacing:'0.1em' }}>{typingName} typing...</span>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        </div>

        {/* Online panel */}
        {showOnline && <OnlinePanel users={onlineUsers} onClose={() => setShowOnline(false)} />}
      </div>

      {/* ══ INPUT BAR ══ */}
      <div style={{ background:'#1a1a12', borderTop:'1px solid rgba(201,168,76,0.12)', padding:'10px 14px', flexShrink:0 }}>

        {/* msg bg indicator */}
        {msgBg && (
          <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:8, padding:'4px 8px', background:'rgba(201,168,76,0.06)', borderRadius:3, border:'1px solid rgba(201,168,76,0.15)' }}>
            <img src={msgBg} alt="bg" style={{ width:20, height:16, objectFit:'cover', borderRadius:2, opacity:0.7 }} />
            <span style={{ fontFamily:'monospace', fontSize:'0.5rem', color:'rgba(201,168,76,0.5)', letterSpacing:'0.1em' }}>Custom BG active</span>
            <button onClick={() => setMsgBg(null)} style={{ marginLeft:'auto', background:'none', border:'none', color:'rgba(201,168,76,0.4)', cursor:'pointer', padding:0 }}><X size={12}/></button>
          </div>
        )}

        <div style={{ display:'flex', gap:8, alignItems:'flex-end' }}>
          {/* textarea */}
          <textarea
            value={text}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            placeholder="Type a message... (Enter to send)"
            rows={1}
            style={{
              flex:1, resize:'none', padding:'10px 12px',
              background:'rgba(255,255,255,0.08)', border:'1px solid rgba(201,168,76,0.18)',
              borderRadius:6, color:'#f2ead8', outline:'none',
              fontFamily:"'Special Elite', monospace", fontSize:'0.82rem',
              lineHeight:1.4, maxHeight:100, overflowY:'auto',
              transition:'border-color 0.2s',
              scrollbarWidth:'thin',
            }}
            onFocus={e => e.target.style.borderColor='rgba(201,168,76,0.45)'}
            onBlur={e => e.target.style.borderColor='rgba(201,168,76,0.18)'}
          />

          {/* send button */}
          <button onClick={sendMessage} disabled={!text.trim() || !connected}
            style={{
              width:40, height:40, flexShrink:0, borderRadius:6, cursor: text.trim() && connected ? 'pointer' : 'not-allowed',
              background: text.trim() && connected ? '#c9a84c' : 'rgba(201,168,76,0.1)',
              border:`1px solid ${text.trim() && connected ? '#c9a84c' : 'rgba(201,168,76,0.15)'}`,
              display:'flex', alignItems:'center', justifyContent:'center',
              color: text.trim() && connected ? '#0a0a08' : 'rgba(201,168,76,0.3)',
              transition:'all 0.2s',
            }}
            onMouseEnter={e => { if (text.trim() && connected) e.currentTarget.style.background='#e8c97a'; }}
            onMouseLeave={e => { if (text.trim() && connected) e.currentTarget.style.background='#c9a84c'; }}>
            <Send size={16} />
          </button>
        </div>

        <p style={{ fontFamily:'monospace', fontSize:'0.45rem', color:'rgba(255,255,255,0.4)', letterSpacing:'0.1em', marginTop:5, textAlign:'center' }}>
          Enter to send · Shift+Enter for new line
        </p>
      </div>

      {/* bottom sprockets */}
      <div style={{ background:'#1a1a12', padding:'5px 0', borderTop:'1px solid rgba(201,168,76,0.08)' }}>
        <SprocketRow count={12} />
      </div>

      {/* BG Picker Modal */}
      {showBgPicker && (
        <BgPickerModal
          onSelect={handlePresetSelect}
          onClose={() => setShowBgPicker(false)}
          uploading={bgUploading}
          onUpload={handleBgUpload}
        />
      )}
    </div>
  );
};

export default FanCommunity;