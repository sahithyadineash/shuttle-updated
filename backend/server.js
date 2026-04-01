const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// OSRM proxy (road geometry). Demo host — replace with your routing service in production.
app.use('/api/routing', async (req, res) => {
  const suffix = req.originalUrl.replace(/^\/api\/routing/, '') || '/';
  if (!suffix.startsWith('/route/')) {
    return res.status(400).json({ message: 'Only OSRM /route/* paths are allowed' });
  }
  const url = `https://router.project-osrm.org${suffix}`;
  try {
    const r = await fetch(url);
    const data = await r.json();
    res.status(r.status).json(data);
  } catch (err) {
    res.status(502).json({ message: err?.message || 'Routing proxy failed' });
  }
});

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/shuttle_tracking')
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.log('❌ MongoDB error:', err));

// Make io accessible to routes
app.set('io', io);

// Routes
const authRoutes = require('./routes/auth');
const shuttleRoutes = require('./routes/shuttle');
const routeRoutes = require('./routes/route');

app.use('/api/auth', authRoutes);
app.use('/api/shuttles', shuttleRoutes);
app.use('/api/routes', routeRoutes);

const paymentRoutes = require('./routes/payment');
app.use('/api/payments', paymentRoutes);

// Test route
app.get('/', (req, res) => {
  res.json({ message: '🚐 Shuttle Tracking API is running!' });
});

// Socket.io connection
io.on('connection', (socket) => {
  console.log('👤 User connected:', socket.id);

  // Driver updates location
  socket.on('update-location', async (data) => {
    const { shuttle_id, lat, lng } = data;
    console.log(`📍 Location update from shuttle ${shuttle_id}:`, lat, lng);
    
    // Update database
    const Shuttle = require('./models/Shuttle');
    await Shuttle.findByIdAndUpdate(shuttle_id, {
      current_location: { lat, lng }
    });
    
    // Broadcast to all connected users
    io.emit('location-updated', { shuttle_id, lat, lng });
  });

  // User joins to track specific shuttle
  socket.on('track-shuttle', (shuttle_id) => {
    socket.join(`shuttle-${shuttle_id}`);
    console.log(`👀 User tracking shuttle: ${shuttle_id}`);
  });

  socket.on('disconnect', () => {
    console.log('👋 User disconnected:', socket.id);
  });
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n❌ Port ${PORT} is already in use.`);
    console.error('   Another server is probably still running (e.g. a previous `npm start`).');
    console.error(`   • macOS — see what is using it:  lsof -i :${PORT}`);
    console.error('   • Stop it, or set a different port in backend/.env, e.g. PORT=5002\n');
    process.exit(1);
  }
  throw err;
});

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🔌 Socket.io ready for real-time updates`);
});