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
    origin: '*', // production e frontend URL deben
    methods: ['GET', 'POST'],
  },
});

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => res.send('Fan Community Chat Server Running 🎬'));

// ── In-memory message store (max 100) ──
const messages = [];
const MAX_MSG  = 100;

// ── Connected users map: socketId → { uid, name, avatar } ──
const onlineUsers = new Map();

io.on('connection', (socket) => {
  console.log('🔌 Connected:', socket.id);

  // ── Fan joins ──
  socket.on('fan:join', ({ uid, name, avatar }) => {
    onlineUsers.set(socket.id, { uid, name, avatar });
    // send last 100 messages to new joiner
    socket.emit('messages:history', messages);
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

  // ── Fan sends message ──
  socket.on('chat:send', ({ uid, name, avatar, text, bgUrl }) => {
    if (!text?.trim()) return;
    const msg = {
      id: Date.now() + Math.random(),
      uid, name, avatar,
      text: text.trim(),
      bgUrl: bgUrl || null,
      timestamp: new Date().toISOString(),
      type: 'message',
    };
    messages.push(msg);
    if (messages.length > MAX_MSG) messages.shift();
    io.emit('chat:message', msg);
  });

  // ── Typing indicator ──
  socket.on('chat:typing', ({ name }) => {
    socket.broadcast.emit('chat:typing', { name });
  });
  socket.on('chat:stopTyping', () => {
    socket.broadcast.emit('chat:stopTyping');
  });

  // ── Event: Admin creates event → broadcast to ALL fans ──
  socket.on('event:create', (data) => {
    console.log('📢 New event broadcast:', data.title);
    io.emit('event:new', data);  // io.emit = ALL clients, socket.broadcast = everyone except sender
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