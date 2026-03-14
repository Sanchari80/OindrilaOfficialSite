// server.js — Fan Community Chat + Event Notification Server
// Install: npm install express socket.io cors
// Run: node server.js (from backend/ folder)

const express    = require('express');
const http       = require('http');
const { Server } = require('socket.io');
const cors       = require('cors');

const app    = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => res.send('Fan Community Chat Server Running 🎬'));

// ── Connected users map: socketId → { uid, name, avatar } ──
const onlineUsers = new Map();

io.on('connection', (socket) => {
  console.log('🔌 Connected:', socket.id);

  // ── Fan joins ──
  socket.on('fan:join', ({ uid, name, avatar }) => {
    onlineUsers.set(socket.id, { uid, name, avatar });
    // broadcast updated online list
    io.emit('users:online', Array.from(onlineUsers.values()));
    // join notification
    io.emit('chat:message', {
      id: Date.now(),
      type: 'system',
      text: `${name} joined the fan zone 🎉`,
      timestamp: new Date().toISOString(),
    });
    console.log(`👤 ${name} joined`);
  });

  // ── Fan sends message (Firestore saves from client, socket just broadcasts) ──
  socket.on('chat:send', ({ uid, name, avatar, text, bgUrl, imageUrl }) => {
    const msg = {
      id: Date.now() + Math.random(),
      uid, name, avatar,
      text: text?.trim() || '',
      bgUrl:    bgUrl    || null,
      imageUrl: imageUrl || null,
      timestamp: new Date().toISOString(),
      type: 'message',
    };
    // broadcast to all OTHER clients (sender already shows optimistically)
    socket.broadcast.emit('chat:message', msg);
  });

  // ── Typing indicator ──
  socket.on('chat:typing',     ({ name }) => { socket.broadcast.emit('chat:typing',    { name }); });
  socket.on('chat:stopTyping', ()         => { socket.broadcast.emit('chat:stopTyping');           });

  // ── Event: Admin creates event → broadcast to ALL fans ──
  socket.on('event:create', (data) => {
    console.log('📢 New event broadcast:', data.title);
    io.emit('event:new', data);
  });

  // ── Event: Manual reminder ──
  socket.on('event:reminder', (data) => {
    console.log('⏰ Reminder:', data.title);
    io.emit('event:reminder', data);
  });

  // ── Disconnect ──
  socket.on('disconnect', () => {
    const user = onlineUsers.get(socket.id);
    if (user) {
      onlineUsers.delete(socket.id);
      io.emit('users:online', Array.from(onlineUsers.values()));
      io.emit('chat:message', {
        id: Date.now(),
        type: 'system',
        text: `${user.name} left the fan zone`,
        timestamp: new Date().toISOString(),
      });
    }
    console.log('❌ Disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`🎬 Chat server running on port ${PORT}`));

// ── Keep-alive self-ping — Render free tier sleep থেকে বাঁচাতে ──
const SELF_URL = 'https://oindrilaofficialsite.onrender.com';
setInterval(() => {
  fetch(SELF_URL)
    .then(() => console.log('🏓 Self-ping OK'))
    .catch(() => console.log('⚠️ Self-ping failed'));
}, 10 * 60 * 1000); // every 10 minutes